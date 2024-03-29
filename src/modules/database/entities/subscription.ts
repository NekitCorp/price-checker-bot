import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { IDbDriver } from '../types';
import { IProduct, Product, ProductId } from './product';

export type ChatId = number & { __brand: 'chat_id' };

interface ISubscription {
    productId: ProductId;
    chatId: ChatId;
    created: Date;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class Subscription extends TypedData {
    public static TABLE_NAME = 'subscriptions';

    @declareType(Types.UTF8)
    public productId: ProductId;

    @declareType(Types.UINT64)
    public chatId: ChatId;

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

    public async insert(driver: IDbDriver) {
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

    public static async get(
        driver: IDbDriver,
        data: Pick<ISubscription, 'chatId' | 'productId'>,
    ): Promise<Subscription | null> {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT *
                FROM ${Subscription.TABLE_NAME}
                WHERE chat_id = ${data.chatId} AND product_id = "${data.productId}"`;
            const { resultSets } = await session.executeQuery(query);
            const subscriptions = Subscription.createNativeObjects(resultSets[0]) as Subscription[];

            return subscriptions[0] ? subscriptions[0] : null;
        });
    }

    public static async getAll(driver: IDbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT ${Subscription.TABLE_NAME}.*, name, store, url
                FROM ${Subscription.TABLE_NAME}
                INNER JOIN ${Product.TABLE_NAME} ON ${Product.TABLE_NAME}.id = ${Subscription.TABLE_NAME}.product_id`;
            const { resultSets } = await session.executeQuery(query);
            return Subscription.createNativeObjects(resultSets[0]) as (Subscription &
                Pick<IProduct, 'name' | 'store' | 'url'>)[];
        });
    }

    public static async getByUser(driver: IDbDriver, data: Pick<ISubscription, 'chatId'>) {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT ${Subscription.TABLE_NAME}.*, name, store, url
                FROM ${Subscription.TABLE_NAME}
                INNER JOIN ${Product.TABLE_NAME} ON ${Product.TABLE_NAME}.id = ${Subscription.TABLE_NAME}.product_id
                WHERE chat_id = ${data.chatId}`;
            const { resultSets } = await session.executeQuery(query);
            return Subscription.createNativeObjects(resultSets[0]) as (Subscription &
                Pick<IProduct, 'name' | 'store' | 'url'>)[];
        });
    }

    public async remove(driver: IDbDriver) {
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
