export enum LogLevel {
    'TRACE' = 'TRACE',
    'DEBUG' = 'DEBUG',
    'INFO' = 'INFO',
    'WARN' = 'WARN',
    'ERROR' = 'ERROR',
    'FATAL' = 'FATAL',
}

export type ILogger = {
    error(message: string, data?: unknown): void;
    log(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    time(label?: string): void;
    timeEnd(label?: string): void;
};
