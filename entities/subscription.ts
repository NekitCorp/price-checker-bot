import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { DbDriver } from '../db-driver';

interface ISubscription {
    productId: string;
    chatId: number;
    created: Date;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class Subscription extends TypedData {
    public static TABLE_NAME = 'subscriptions';

    @declareType(Types.UTF8)
    public productId: string;

    @declareType(Types.UINT64)
    public chatId: number;

    @declareType(Types.DATETIME)
    public created: Date;

    static create(data: Pick<ISubscription, 'productId' | 'chatId'>): Subscription {
        return new this({ ...data, created: new Date() });
    }

    constructor(data: ISubscription) {
        super(data);
        this.productId = data.productId;
        this.chatId = data.chatId;
        this.created = data.created;
    }

    public async insert(driver: DbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                DECLARE $productId as Utf8;
                DECLARE $chatId as Uint64;
                DECLARE $created as Datetime;
            
                INSERT INTO ${Subscription.TABLE_NAME} (product_id, chat_id, created)
                VALUES ($productId, $chatId, $created)`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $productId: this.getTypedValue('productId'),
                $chatId: this.getTypedValue('chatId'),
                $created: this.getTypedValue('created'),
            });
        });
    }

    public static async getAll(driver: DbDriver): Promise<Subscription[]> {
        return await driver.withSession(async (session) => {
            const query = `SELECT * FROM ${Subscription.TABLE_NAME}`;
            const { resultSets } = await session.executeQuery(query);
            return Subscription.createNativeObjects(resultSets[0]) as Subscription[];
        });
    }

    public static async getByUser(driver: DbDriver, chatId: string): Promise<Subscription[]> {
        return await driver.withSession(async (session) => {
            const query = `SELECT * FROM ${Subscription.TABLE_NAME} WHERE chat_id = "${chatId}"`;
            const { resultSets } = await session.executeQuery(query);
            return Subscription.createNativeObjects(resultSets[0]) as Subscription[];
        });
    }

    public async remove(driver: DbDriver) {
        await driver.withSession(async (session) => {
            const query = `
                DECLARE $productId as Utf8;
                DECLARE $chatId as Uint64;

                DELETE FROM ${Subscription.TABLE_NAME}
                WHERE chat_id = $chatId AND product_id = $productId`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $productId: this.getTypedValue('productId'),
                $chatId: this.getTypedValue('chatId'),
            });
        });
    }
}
