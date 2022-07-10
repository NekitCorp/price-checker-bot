/* eslint-disable no-console */
import { Telegraf } from 'telegraf';
import { ILoggerErrorOptions, ILoggerLogOptions, ILoggerService } from './types';

export class LoggerService implements ILoggerService {
    private readonly bot: Telegraf;

    constructor(private adminChatId: string, botToken: string) {
        this.bot = new Telegraf(botToken);
    }

    error(error: unknown, options: ILoggerErrorOptions) {
        const update = options?.context?.update;

        const errorObj =
            error instanceof Error
                ? { message: error.message, stack: error.stack, update }
                : { message: `${error}`, update };
        const message = `[${options.scope}] ${JSON.stringify(errorObj)}`;

        console.error(message);

        this.bot.telegram
            .sendMessage(this.adminChatId, message)
            .catch((err) => console.error(`[ERROR] Failed to send error message`, err?.message));
    }

    log(message: unknown, options: ILoggerLogOptions) {
        try {
            console.log(`[${options.scope}] ${JSON.stringify(message)}`);
        } catch (error) {
            this.error(error, { scope: `LOG_ERROR_${options.scope}` });
        }
    }

    time(label?: string) {
        console.time(label);
    }

    timeEnd(label?: string) {
        console.timeEnd(label);
    }
}
