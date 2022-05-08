import { AnonymousAuthService, Driver, getCredentialsFromEnv, getLogger, Session } from 'ydb-sdk';
import { isYandexCloudFunction } from '../utils/yandex-cloud';

const TIMEOUT = 10000;

export class DbDriver {
    /**
     * Эндпоинт
     * @description https://cloud.yandex.ru/docs/ydb/concepts/connect#endpoint
     */
    private readonly endpoint: string;
    /**
     * Размещение базы данных
     * @description https://cloud.yandex.ru/docs/ydb/concepts/connect#database
     */
    private readonly database: string;
    private driver: Driver | null = null;
    private isDriverReady: Promise<boolean> = Promise.resolve(false);

    constructor() {
        if (!process.env.YDB_ENDPOINT) {
            throw new Error('Environment variable `YDB_ENDPOINT` not provided');
        }

        if (!process.env.YDB_DATABASE) {
            throw new Error('Environment variable `YDB_DATABASE` not provided');
        }

        this.endpoint = process.env.YDB_ENDPOINT;
        this.database = process.env.YDB_DATABASE;
    }

    public async init() {
        const logger = getLogger();
        const authService = isYandexCloudFunction ? getCredentialsFromEnv(logger) : new AnonymousAuthService();

        this.driver = new Driver({ endpoint: this.endpoint, database: this.database, authService });
        this.isDriverReady = this.driver.ready(TIMEOUT);
    }

    public async withSession<T>(callback: (session: Session) => Promise<T>): Promise<T> {
        if (!(await this.isDriverReady)) {
            throw new Error(`Driver has not become ready in ${TIMEOUT}ms!`);
        }

        if (!this.driver) {
            throw new Error('Driver not exists');
        }

        return await this.driver.tableClient.withSession(callback);
    }
}

const driver = new DbDriver();
driver.init();

export { driver };
