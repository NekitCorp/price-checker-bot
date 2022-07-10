/* eslint-disable no-console */
import dayjs from 'dayjs';
import 'dotenv-flow/config';
import { Session } from 'ydb-sdk';
import { DbDriver } from '../src/database';
import { ChatState } from '../src/database/entities/chat-state';
import { Price } from '../src/database/entities/price';
import { Product, ProductId } from '../src/database/entities/product';
import { ChatId, Subscription } from '../src/database/entities/subscription';
import { Store } from '../src/store/types';
import { randomNumber } from '../src/utils/number';

if (!process.env.YDB_ENDPOINT) {
    throw new Error('Environment variable `YDB_ENDPOINT` not provided');
}

if (!process.env.YDB_DATABASE) {
    throw new Error('Environment variable `YDB_DATABASE` not provided');
}

const dbDriver = new DbDriver(process.env.YDB_ENDPOINT, process.env.YDB_DATABASE);

const TABLES = [Product.TABLE_NAME, Price.TABLE_NAME, Subscription.TABLE_NAME, ChatState.TABLE_NAME];

async function clear(session: Session) {
    for await (const table of TABLES) {
        console.log(`Deleting data from a table ${table}...`);
        const query = `DELETE FROM ${table};`;
        await session.executeQuery(query);
    }
}

const pid = (id: string): ProductId => id as ProductId;
const cid = (id: number): ChatId => id as ChatId;

async function migrate() {
    console.log('Creating products...');
    await Product.create({
        id: pid('531733'),
        name: 'Ноутбук Apple MacBook Air (M1 8C CPU/7C GPU, 16Гб, 256Гб SSD) Золотой Z12A0008QRU/A',
        url: 'https://store77.net/apple_macbook_air/noutbuk_apple_macbook_air_m1_16gb_256gb_ssd_zolotoy_z12a0008qru_a/',
        store: Store.Store77,
    }).insert(dbDriver);
    await Product.create({
        id: pid('668506'),
        name: 'Телефон Apple iPhone 13 Pro Max 128Gb (Gold) MLLT3',
        url: 'https://store77.net/apple_iphone_13_pro_max/telefon_apple_iphone_13_pro_max_128gb_gold/',
        store: Store.Store77,
    }).insert(dbDriver);
    await Product.create({
        id: pid('700880'),
        name: 'Телефон Xiaomi 11T 5G 8/128Gb (Серый)',
        url: 'https://store77.net/xiaomi_11t_pro/telefon_xiaomi_11t_8_128gb_seryy/',
        store: Store.Store77,
    }).insert(dbDriver);

    console.log('Creating prices...');
    const today = dayjs().hour(10).minute(0);
    // 8-531733
    for (let index = 0; index < 30; index++) {
        await new Price({
            productId: pid('531733'),
            price: randomNumber(120000, 140000),
            created: today.add(-1 * index, 'd').toDate(),
        }).insert(dbDriver);
    }
    // 668506
    await new Price({ productId: pid('668506'), price: 105980, created: today.toDate() }).insert(dbDriver);
    await new Price({ productId: pid('668506'), price: 105980, created: today.add(-1, 'd').toDate() }).insert(dbDriver);
    await new Price({ productId: pid('668506'), price: 105980, created: today.add(-2, 'd').toDate() }).insert(dbDriver);
    // 700880
    await new Price({ productId: pid('700880'), price: 30740, created: today.toDate() }).insert(dbDriver);

    console.log('Creating subscriptions...');
    await Subscription.create({ productId: pid('668506'), chatId: cid(276071981) }).insert(dbDriver);
    await Subscription.create({ productId: pid('531733'), chatId: cid(276071981) }).insert(dbDriver);
}

dbDriver.withSession(async (session) => {
    await clear(session);
    await migrate();

    console.log('Successful data migration');

    process.exit();
});
