require('dotenv-flow').config();

import dayjs from 'dayjs';
import { Session } from 'ydb-sdk';
import { driver } from './db-driver';
import { Price } from './entities/price';
import { Product } from './entities/product';
import { Subscription } from './entities/subscription';

const TABLES = [Product.TABLE_NAME, Price.TABLE_NAME, Subscription.TABLE_NAME];

async function clear(session: Session) {
    for await (const table of TABLES) {
        console.log(`Deleting data from a table ${table}...`);
        const query = `DELETE FROM ${table};`;
        await session.executeQuery(query);
    }
}

async function migrate() {
    console.log('Creating products...');
    await Product.create({
        id: '8-531733',
        name: 'Ноутбук Apple MacBook Air (M1 8C CPU/7C GPU, 16Гб, 256Гб SSD) Золотой Z12A0008QRU/A',
        url: 'https://store77.net/apple_macbook_air/noutbuk_apple_macbook_air_m1_16gb_256gb_ssd_zolotoy_z12a0008qru_a/',
    }).insert(driver);
    await Product.create({
        id: '8-668506',
        name: 'Телефон Apple iPhone 13 Pro Max 128Gb (Gold) MLLT3',
        url: 'https://store77.net/apple_iphone_13_pro_max/telefon_apple_iphone_13_pro_max_128gb_gold/',
    }).insert(driver);
    await Product.create({
        id: '8-700880',
        name: 'Телефон Xiaomi 11T 5G 8/128Gb (Серый)',
        url: 'https://store77.net/xiaomi_11t_pro/telefon_xiaomi_11t_8_128gb_seryy/',
    }).insert(driver);

    console.log('Creating prices...');
    const today = dayjs().hour(10).minute(0);
    // 8-531733
    await new Price({ productId: '8-531733', price: 130980, created: today.toDate() }).insert(driver);
    await new Price({ productId: '8-531733', price: 128980, created: today.add(-1, 'd').toDate() }).insert(driver);
    await new Price({ productId: '8-531733', price: 130980, created: today.add(-2, 'd').toDate() }).insert(driver);
    // 8-668506
    await new Price({ productId: '8-668506', price: 105980, created: today.toDate() }).insert(driver);
    await new Price({ productId: '8-668506', price: 105980, created: today.add(-1, 'd').toDate() }).insert(driver);
    await new Price({ productId: '8-668506', price: 105980, created: today.add(-2, 'd').toDate() }).insert(driver);
    // 8-700880
    await new Price({ productId: '8-700880', price: 30740, created: today.toDate() }).insert(driver);

    console.log('Creating subscriptions...');
    await Subscription.create({ productId: '8-668506', chatId: 276071981 }).insert(driver);
    await Subscription.create({ productId: '8-700880', chatId: 276071981 }).insert(driver);
}

driver.withSession(async (session) => {
    await clear(session);
    await migrate();

    console.log('Successful data migration');

    process.exit();
});
