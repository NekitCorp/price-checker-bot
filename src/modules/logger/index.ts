/* eslint-disable no-console */
import { Telegraf } from 'telegraf';
import { ILogger, LogLevel } from './types';

// https://cloud.yandex.ru/docs/functions/concepts/logs#structured-logs
export class Logger implements ILogger {
    private readonly bot: Telegraf;

    constructor(private adminChatId: string, botToken: string) {
        this.bot = new Telegraf(botToken);
    }

    error(message: string, data?: unknown) {
        const msg = JSON.stringify({ message, level: LogLevel.ERROR, data });

        console.error(msg);

        this.bot.telegram
            .sendMessage(this.adminChatId, msg)
            .catch((err) =>
                console.error(
                    JSON.stringify({ message: 'Failed to send error message', level: LogLevel.FATAL, data: err }),
                ),
            );
    }

    log(message: string, data?: unknown) {
        try {
            console.log(JSON.stringify({ message, level: LogLevel.INFO, data }));
        } catch (error) {
            this.error('Failed to INFO log.', error);
        }
    }

    warn(message: string, data?: unknown) {
        try {
            console.log(JSON.stringify({ message, level: LogLevel.WARN, data }));
        } catch (error) {
            this.error('Failed to WARN log.', error);
        }
    }

    time(label?: string) {
        console.time(label);
    }

    timeEnd(label?: string) {
        console.timeEnd(label);
    }
}
