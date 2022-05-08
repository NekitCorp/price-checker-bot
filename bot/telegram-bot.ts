import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { driver } from '../database/db-driver';
import { ChatState } from '../database/entities/chat-state';
import { actions, commands } from './handlers';
import { textHandler } from './handlers/text-handler';
import { triggerHandler } from './handlers/trigger-handler';

export interface MyContext extends Context {
    chatId: number;
    chatState: ChatState | null;
}

export class TelegramBot {
    private readonly bot: Telegraf<MyContext>;

    constructor(token: string) {
        this.bot = new Telegraf<MyContext>(token);
        this.registerMiddlewares();
        this.registerHandlers();
    }

    public launch() {
        this.bot.launch().then(() => console.log(`Telegram bot ${this.bot.botInfo?.first_name} is running.`));
    }

    public stop(reason?: string) {
        console.log(`Telegram bot ${this.bot.botInfo?.first_name} stops...`);
        this.bot.stop(reason);
        console.log(`Telegram bot ${this.bot.botInfo?.first_name} stopped.`);
    }

    public sendMessage(chatId: string | number, text: string, extra?: ExtraReplyMessage) {
        return this.bot.telegram.sendMessage(chatId, text, extra);
    }

    public update(update: Update) {
        return this.bot.handleUpdate(update);
    }

    public trigger() {
        console.log('[BOT_HANDLER] Trigger handler processing...');
        return triggerHandler(this);
    }

    private registerMiddlewares() {
        this.bot.use(async (ctx, next) => {
            console.log(ctx.update);
            console.time(`Processing update ${ctx.update.update_id}`);
            await next();
            console.timeEnd(`Processing update ${ctx.update.update_id}`);
        });

        this.bot.use(async (ctx, next) => {
            const chatId = ctx.chat?.id || ctx.from?.id;

            if (!chatId) {
                ctx.reply('Ошибка. Не найден идентификатор чата.');
                return;
            }

            ctx.chatState = await ChatState.getChatState(driver, { chatId });
            ctx.chatId = chatId;

            return next();
        });
    }

    private registerHandlers() {
        // register commands
        Object.entries(commands).forEach(([command, handler]) => {
            return this.bot.command(command, (ctx) => {
                console.log(`[BOT_HANDLER] Start command ${command} processing...`);
                try {
                    return handler(ctx);
                } catch (error) {
                    console.error(error);
                    ctx.reply('😿 Похоже что-то пошло не так...');
                }
            });
        });

        // register actions
        Object.entries(actions).forEach(([action, { trigger, handler }]) => {
            return this.bot.action(trigger, (ctx) => {
                console.log(`[BOT_HANDLER] Start action ${action} processing...`);
                try {
                    return handler(ctx);
                } catch (error) {
                    console.error(error);
                    ctx.reply('😿 Похоже что-то пошло не так...');
                }
            });
        });

        // register text
        this.bot.on('text', (ctx) => {
            console.log(`[BOT_HANDLER] Start text handler processing...`);
            try {
                return textHandler(ctx);
            } catch (error) {
                console.error(error);
                ctx.reply('😿 Похоже что-то пошло не так...');
            }
        });
    }
}
