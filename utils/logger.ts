import { MyContext, telegramBot } from '../bot/telegram-bot';
import { isYandexCloudFunction } from './yandex-cloud';

class LoggerService {
    constructor(private adminChatId: string) {}

    public error(error: unknown, options: { context?: MyContext; scope: string }) {
        const update = options?.context?.update;

        const errorObj =
            error instanceof Error
                ? { message: error.message, stack: error.stack, update }
                : { message: `${error}`, update };
        const message = `[${options.scope}] ${JSON.stringify(errorObj)}`;

        console.error(message);

        telegramBot.bot.telegram
            .sendMessage(this.adminChatId, message)
            .catch((err) => console.error(`[ERROR] Failed to send error message`, err?.message));
    }

    public log(message: unknown, options: { scope: string }) {
        try {
            const data = isYandexCloudFunction ? JSON.stringify(message) : message;
            console.log(`[${options.scope}] ${data}`);
        } catch (error) {
            this.error(error, { scope: `LOG_ERROR_${options.scope}` });
        }
    }

    public time(label?: string) {
        console.time(label);
    }

    public timeEnd(label?: string) {
        console.timeEnd(label);
    }
}

if (!process.env.ADMIN_CHAT_ID) {
    throw new Error('Environment variable `ADMIN_CHAT_ID` not provided');
}

export const logger = new LoggerService(process.env.ADMIN_CHAT_ID);
