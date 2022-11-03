import { Telegraf, TelegramError } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { ChatState } from '../database/entities/chat-state';
import { ChatId } from '../database/entities/subscription';
import { actions, commands, textHandlers } from './handlers';
import {
    ActionHandler,
    CommandHandler,
    DependentServices,
    ITelegramBot,
    MyContext,
    TextHandler,
    Triggers,
} from './types';

export class TelegramBot implements ITelegramBot {
    public readonly bot: Telegraf<MyContext>;

    constructor(token: string, private services: DependentServices) {
        this.bot = new Telegraf<MyContext>(token, { handlerTimeout: 5 * 1000 });

        this.registerMiddlewares();

        // register telegram bot handlers
        Object.entries(commands).forEach(([command, handler]) => this.registerCommand(command, handler));
        Object.entries(actions).forEach(([action, { trigger, handler }]) =>
            this.registerAction(action, trigger, handler),
        );
        textHandlers.forEach((handler) => this.registerTextHandler(handler));
    }

    public launch() {
        this.bot
            .launch()
            .then(() =>
                this.services.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} is running.`, { scope: 'BOT' }),
            );
    }

    public stop(reason?: string) {
        this.services.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stops...`, { scope: 'BOT' });
        this.bot.stop(reason);
        this.services.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stopped.`, { scope: 'BOT' });
    }

    public async sendMessage(chatId: string | number, text: string, extra?: ExtraReplyMessage) {
        try {
            return await this.bot.telegram.sendMessage(chatId, text, extra);
        } catch (err) {
            if (err instanceof TelegramError && err.code === 403) {
                return this.services.logger.log(
                    `Failed to send a message to user ${chatId} because the bot was blocked.`,
                    {
                        scope: 'BOT_SEND_MESSAGE',
                    },
                );
            }

            this.services.logger.error(`Failed to send message to user ${chatId}. ${err}.`, {
                scope: 'ERROR_BOT_SEND_MESSAGE',
            });
        }
    }

    public update(update: Update) {
        return this.bot.handleUpdate(update);
    }

    private registerCommand(command: string, handler: CommandHandler): void {
        this.bot.command(command, (ctx) => {
            this.services.logger.log(`Start command /${command} processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, services: this.services });
            } catch (error) {
                this.services.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    private registerAction(name: string, triggers: Triggers, handler: ActionHandler): void {
        this.bot.action(triggers, (ctx) => {
            this.services.logger.log(`Start action ${name} processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, services: this.services });
            } catch (error) {
                this.services.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    private registerTextHandler(handler: TextHandler): void {
        this.bot.on('text', (ctx) => {
            this.services.logger.log(`Start text handler processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, services: this.services });
            } catch (error) {
                this.services.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    private registerMiddlewares() {
        this.bot.use(async (ctx, next) => {
            this.services.logger.log(ctx.update, { scope: 'TELEGRAM_UPDATE' });
            this.services.logger.time(`Processing update ${ctx.update.update_id}`);
            await next();
            this.services.logger.timeEnd(`Processing update ${ctx.update.update_id}`);
        });

        this.bot.use(async (ctx, next) => {
            const chatId = ctx.chat?.id || ctx.from?.id;

            if (!chatId) {
                ctx.reply('❌ Ошибка. Не найден идентификатор чата.');
                return;
            }

            ctx.chatId = chatId as ChatId;
            ctx.chatState = await ChatState.getChatState(this.services.db, { chatId: ctx.chatId });

            return next();
        });
    }
}
