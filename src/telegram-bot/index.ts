import { Telegraf, TelegramError } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { ChatState } from '../database/entities/chat-state';
import { ChatId } from '../database/entities/subscription';
import { IDbDriver } from '../database/types';
import { ILoggerService } from '../logger/types';
import { ActionHandler, CommandHandler, ITelegramBot, MyContext, TextHandler, Triggers } from './types';

export class TelegramBot implements ITelegramBot {
    public readonly bot: Telegraf<MyContext>;

    constructor(token: string, private dbDriver: IDbDriver, private logger: ILoggerService) {
        this.bot = new Telegraf<MyContext>(token, { handlerTimeout: 5 * 1000 });

        this.registerMiddlewares();
    }

    launch() {
        this.bot
            .launch()
            .then(() => this.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} is running.`, { scope: 'BOT' }));
    }

    stop(reason?: string) {
        this.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stops...`, { scope: 'BOT' });
        this.bot.stop(reason);
        this.logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stopped.`, { scope: 'BOT' });
    }

    async sendMessage(chatId: string | number, text: string, extra?: ExtraReplyMessage) {
        try {
            return await this.bot.telegram.sendMessage(chatId, text, extra);
        } catch (err) {
            if (err instanceof TelegramError && err.code === 403) {
                return this.logger.log(`Failed to send a message to user ${chatId} because the bot was blocked.`, {
                    scope: 'BOT_SEND_MESSAGE',
                });
            }

            this.logger.error(`Failed to send message to user ${chatId}. ${err}.`, { scope: 'ERROR_BOT_SEND_MESSAGE' });
        }
    }

    update(update: Update) {
        return this.bot.handleUpdate(update);
    }

    registerCommand(command: string, handler: CommandHandler): void {
        this.bot.command(command, (ctx) => {
            this.logger.log(`Start command /${command} processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, logger: this.logger, dbDriver: this.dbDriver });
            } catch (error) {
                this.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    registerAction(name: string, triggers: Triggers, handler: ActionHandler): void {
        this.bot.action(triggers, (ctx) => {
            this.logger.log(`Start action ${name} processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, logger: this.logger, dbDriver: this.dbDriver });
            } catch (error) {
                this.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    registerTextHandler(handler: TextHandler): void {
        this.bot.on('text', (ctx) => {
            this.logger.log(`Start text handler processing...`, { scope: 'BOT_HANDLER' });
            try {
                return handler({ ctx, logger: this.logger, dbDriver: this.dbDriver });
            } catch (error) {
                this.logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }

    private registerMiddlewares() {
        this.bot.use(async (ctx, next) => {
            this.logger.log(ctx.update, { scope: 'TELEGRAM_UPDATE' });
            this.logger.time(`Processing update ${ctx.update.update_id}`);
            await next();
            this.logger.timeEnd(`Processing update ${ctx.update.update_id}`);
        });

        this.bot.use(async (ctx, next) => {
            const chatId = ctx.chat?.id || ctx.from?.id;

            if (!chatId) {
                ctx.reply('❌ Ошибка. Не найден идентификатор чата.');
                return;
            }

            ctx.chatId = chatId as ChatId;
            ctx.chatState = await ChatState.getChatState(this.dbDriver, { chatId: ctx.chatId });

            return next();
        });
    }
}
