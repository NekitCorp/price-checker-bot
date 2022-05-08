import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { DbDriver } from '../db-driver';
import { Subscription } from './subscription';

export enum Store {
    Store77 = 'Store77',
}

export interface IProduct {
    id: string;
    created: Date;
    name: string;
    url: string;
    store: Store;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class Product extends TypedData {
    public static TABLE_NAME = 'products';

    @declareType(Types.UTF8)
    public id: string;

    @declareType(Types.DATETIME)
    public created: Date;

    @declareType(Types.UTF8)
    public name: string;

    @declareType(Types.UTF8)
    public url: string;

    @declareType(Types.UTF8)
    public store: Store;

    static create(data: Pick<IProduct, 'id' | 'name' | 'url' | 'store'>): Product {
        return new this({ ...data, created: new Date() });
    }

    constructor(data: IProduct) {
        super(data);
        this.id = data.id;
        this.created = data.created;
        this.name = data.name;
        this.url = data.url;
        this.store = data.store;
    }

    public async insert(driver: DbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                DECLARE $id as Utf8;
                DECLARE $created as Datetime;
                DECLARE $name as Utf8;
                DECLARE $url as Utf8;
                DECLARE $store as Utf8;
            
                INSERT INTO ${Product.TABLE_NAME} (id, created, name, url, store)
                VALUES ($id, $created, $name, $url, $store)`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $id: this.getTypedValue('id'),
                $created: this.getTypedValue('created'),
                $name: this.getTypedValue('name'),
                $url: this.getTypedValue('url'),
                $store: this.getTypedValue('store'),
            });
        });
    }

    /** Получить все продукты на которые есть подписка */
    public static async getProductsWithSubscription(driver: DbDriver): Promise<Product[]> {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT ${Product.TABLE_NAME}.*
                FROM ${Product.TABLE_NAME}
                INNER JOIN ${Subscription.TABLE_NAME} ON ${Subscription.TABLE_NAME}.product_id = ${Product.TABLE_NAME}.id
            `;
            const { resultSets } = await session.executeQuery(query);
            return Product.createNativeObjects(resultSets[0]) as Product[];
        });
    }

    public static async get(driver: DbDriver, data: Pick<IProduct, 'id'>): Promise<Product | null> {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT ${Product.TABLE_NAME}.*
                FROM ${Product.TABLE_NAME}
                WHERE id = "${data.id}"
            `;
            const { resultSets } = await session.executeQuery(query);
            const products = Product.createNativeObjects(resultSets[0]) as Product[];

            return products[0] ? products[0] : null;
        });
    }
}
