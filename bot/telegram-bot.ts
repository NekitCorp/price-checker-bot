import { Context, Telegraf, TelegramError } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { driver } from '../database/db-driver';
import { ChatState } from '../database/entities/chat-state';
import { ChatId } from '../database/entities/subscription';
import { logger } from '../utils/logger';
import { actions, commands } from './handlers';
import { textHandler } from './handlers/text-handler';
import { triggerHandler } from './handlers/trigger-handler';

export interface MyContext extends Context {
    chatId: ChatId;
    chatState: ChatState | null;
}

export class TelegramBot {
    public readonly bot: Telegraf<MyContext>;

    constructor(token: string) {
        this.bot = new Telegraf<MyContext>(token);
        this.registerMiddlewares();
        this.registerHandlers();
    }

    public launch() {
        this.bot
            .launch()
            .then(() => logger.log(`Telegram bot ${this.bot.botInfo?.first_name} is running.`, { scope: 'BOT' }));
    }

    public stop(reason?: string) {
        logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stops...`, { scope: 'BOT' });
        this.bot.stop(reason);
        logger.log(`Telegram bot ${this.bot.botInfo?.first_name} stopped.`, { scope: 'BOT' });
    }

    public async sendMessage(chatId: string | number, text: string, extra?: ExtraReplyMessage) {
        try {
            return await this.bot.telegram.sendMessage(chatId, text, extra);
        } catch (err) {
            if (err instanceof TelegramError && err.code === 403) {
                return logger.log(`Failed to send a message to user ${chatId} because the bot was blocked.`, {
                    scope: 'BOT_SEND_MESSAGE',
                });
            }

            logger.error(`Failed to send message to user ${chatId}. ${err}.`, { scope: 'ERROR_BOT_SEND_MESSAGE' });
        }
    }

    public update(update: Update) {
        return this.bot.handleUpdate(update);
    }

    public trigger() {
        logger.log('Trigger handler processing...', { scope: 'BOT_HANDLER' });
        try {
            return triggerHandler(this);
        } catch (error) {
            logger.error(error, { scope: 'TRIGGER_ERROR' });
        }
    }

    private registerMiddlewares() {
        this.bot.use(async (ctx, next) => {
            logger.log(ctx.update, { scope: 'TELEGRAM_UPDATE' });
            logger.time(`Processing update ${ctx.update.update_id}`);
            await next();
            logger.timeEnd(`Processing update ${ctx.update.update_id}`);
        });

        this.bot.use(async (ctx, next) => {
            const chatId = ctx.chat?.id || ctx.from?.id;

            if (!chatId) {
                ctx.reply('❌ Ошибка. Не найден идентификатор чата.');
                return;
            }

            ctx.chatId = chatId as ChatId;
            ctx.chatState = await ChatState.getChatState(driver, { chatId: ctx.chatId });

            return next();
        });
    }

    private registerHandlers() {
        // register commands
        Object.entries(commands).forEach(([command, handler]) => {
            return this.bot.command(command, (ctx) => {
                logger.log(`Start command /${command} processing...`, { scope: 'BOT_HANDLER' });
                try {
                    return handler(ctx);
                } catch (error) {
                    logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                    ctx.reply('😿 Похоже что-то пошло не так...');
                }
            });
        });

        // register actions
        Object.entries(actions).forEach(([action, { trigger, handler }]) => {
            return this.bot.action(trigger, (ctx) => {
                logger.log(`Start action ${action} processing...`, { scope: 'BOT_HANDLER' });
                try {
                    return handler(ctx);
                } catch (error) {
                    logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                    ctx.reply('😿 Похоже что-то пошло не так...');
                }
            });
        });

        // register text
        this.bot.on('text', (ctx) => {
            logger.log(`Start text handler processing...`, { scope: 'BOT_HANDLER' });
            try {
                return textHandler(ctx);
            } catch (error) {
                logger.error(error, { context: ctx, scope: 'ERROR_BOT_HANDLER' });
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }
}

if (!process.env.BOT_TOKEN) {
    throw new Error('Environment variable `BOT_TOKEN` not provided');
}

export const telegramBot = new TelegramBot(process.env.BOT_TOKEN);
