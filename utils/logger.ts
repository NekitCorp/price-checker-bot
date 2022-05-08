class LoggerService {
    public error(message: unknown, ...optionalParams: unknown[]): void {
        console.error(this.prepareMessage(message), ...this.prepareOptionalParams(optionalParams));
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
        return process.env.NODE_ENV === 'production' ? JSON.stringify(message) : message;
    }

    private prepareOptionalParams(optionalParams: unknown[]) {
        return process.env.NODE_ENV === 'production' ? optionalParams.map((p) => JSON.stringify(p)) : optionalParams;
    }
}

export const logger = new LoggerService();
