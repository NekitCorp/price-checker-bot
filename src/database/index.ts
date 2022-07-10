import { AnonymousAuthService, Driver, getCredentialsFromEnv, getLogger, Session } from 'ydb-sdk';
import { isYandexCloudFunction } from '../utils/yandex-cloud';
import { IDbDriver } from './types';

const TIMEOUT = 10000;
const logger = getLogger();
const authService = isYandexCloudFunction ? getCredentialsFromEnv(logger) : new AnonymousAuthService();

export class DbDriver implements IDbDriver {
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
    private readonly driver: Driver;
    private readonly isDriverReady: Promise<boolean>;

    constructor(endpoint: string, database: string) {
        this.endpoint = endpoint;
        this.database = database;
        this.driver = new Driver({ endpoint: this.endpoint, database: this.database, authService });
        this.isDriverReady = this.driver.ready(TIMEOUT);
    }

    public async withSession<T>(callback: (session: Session) => Promise<T>): Promise<T> {
        if (!(await this.isDriverReady)) {
            throw new Error(`Driver has not become ready in ${TIMEOUT}ms!`);
        }

        return await this.driver.tableClient.withSession(callback);
    }
}
