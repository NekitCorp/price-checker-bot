import { isYandexCloudFunction } from './yandex-cloud';

class LoggerService {
    public error(message: unknown, ...optionalParams: unknown[]): void {
        console.error('[ERROR]', this.prepareMessage(message), ...this.prepareOptionalParams(optionalParams));
    }

    public log(message: unknown, ...optionalParams: unknown[]): void {
        console.log(this.prepareMessage(message), ...this.prepareOptionalParams(optionalParams));
    }

    public time(label?: string): void {
        console.time(label);
    }

    public timeEnd(label?: string): void {
        console.timeEnd(label);
    }

    private prepareMessage(message: unknown) {
        return isYandexCloudFunction ? JSON.stringify(message) : message;
    }

    private prepareOptionalParams(optionalParams: unknown[]) {
        return isYandexCloudFunction ? optionalParams.map((p) => JSON.stringify(p)) : optionalParams;
    }
}

export const logger = new LoggerService();
