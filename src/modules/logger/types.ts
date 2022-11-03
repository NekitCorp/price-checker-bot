import { Context } from 'telegraf';

export type ILoggerErrorOptions = { context?: Context; scope: string };
export type ILoggerLogOptions = { scope: string };

export type ILogger = {
    error(error: unknown, options: ILoggerErrorOptions): void;
    log(message: unknown, options: ILoggerLogOptions): void;
    time(label?: string): void;
    timeEnd(label?: string): void;
};
