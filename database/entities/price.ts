import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { DbDriver } from '../db-driver';

interface IPrice {
    productId: string;
    created: Date;
    price: number;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class Price extends TypedData {
    public static TABLE_NAME = 'prices';

    @declareType(Types.UTF8)
    public productId: string;

    @declareType(Types.DATETIME)
    public created: Date;

    @declareType(Types.UINT64)
    public price: number;

    static create(data: Pick<IPrice, 'productId' | 'price'>): Price {
        return new this({ ...data, created: new Date() });
    }

    constructor(data: IPrice) {
        super(data);
        this.productId = data.productId;
        this.created = data.created;
        this.price = data.price;
    }

    public async insert(driver: DbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                DECLARE $productId as Utf8;
                DECLARE $created as Datetime;
                DECLARE $price as Uint64;
            
                INSERT INTO ${Price.TABLE_NAME} (product_id, created, price)
                VALUES ($productId, $created, $price)`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $productId: this.getTypedValue('productId'),
                $created: this.getTypedValue('created'),
                $price: this.getTypedValue('price'),
            });
        });
    }

    /**
     * Выбрать 2 последние цены по каждому продукту. Не используется,
     * но запрос получился крутым, поэтому останется для истории :)
     */
    public async selectLast2PricesOnEachProduct(driver: DbDriver): Promise<Price[]> {
        return await driver.withSession(async (session) => {
            // https://stackoverflow.com/questions/46583900/select-top-2-values-for-each-group
            // https://cloud.yandex.ru/docs/ydb/yql/reference/syntax/window
            const query = `
                SELECT product_id, created, price
                FROM (
                    SELECT
                        COUNT(*) OVER w AS row_number,
                        prices.*
                    FROM ${Price.TABLE_NAME}
                    WINDOW w AS (
                        PARTITION BY product_id
                        ORDER BY created DESC
                    )
                )
                WHERE row_number <= 2`;

            const { resultSets } = await session.executeQuery(query);
            return Price.createNativeObjects(resultSets[0]) as Price[];
        });
    }
}
