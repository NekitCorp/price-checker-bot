import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { DbDriver } from '../db-driver';

interface IProduct {
    id: string;
    created: Date;
    name: string;
    url: string;
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

    static create(data: Pick<IProduct, 'id' | 'name' | 'url'>): Product {
        return new this({ ...data, created: new Date() });
    }

    constructor(data: IProduct) {
        super(data);
        this.id = data.id;
        this.created = data.created;
        this.name = data.name;
        this.url = data.url;
    }

    public async insert(driver: DbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                DECLARE $id as Utf8;
                DECLARE $created as Datetime;
                DECLARE $name as Utf8;
                DECLARE $url as Utf8;
            
                INSERT INTO ${Product.TABLE_NAME} (id, created, name, url)
                VALUES ($id, $created, $name, $url)`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $id: this.getTypedValue('id'),
                $created: this.getTypedValue('created'),
                $name: this.getTypedValue('name'),
                $url: this.getTypedValue('url'),
            });
        });
    }
}
