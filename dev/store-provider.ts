require('dotenv-flow').config();

import { Store } from '../database/entities/product';
import { getStoreProvider } from '../store/provider';

const STORE: Store = Store.Bigstv;
const PRODUCT_URLS: string[] = [
    'https://www.bigstv.ru/product/televizor-oled-sony-xr-65a80j/',
    'https://www.bigstv.ru/product/mitsubishi-electric-msz-hj25va-vnutrennij-blok/',
    'https://www.bigstv.ru/product/antennyj-kabel/',
];

async function main() {
    const storeProvider = getStoreProvider(STORE);

    for (const url of PRODUCT_URLS) {
        console.log(`Start check ${url}...`);

        if (!storeProvider.checkLink(url)) {
            return console.log(`Wrong link, example: ${storeProvider.exampleLink}`);
        }

        try {
            const data = await storeProvider.getData(url);
            console.log(data);
        } catch (error) {
            console.log('[ERROR]', error);
        }
    }

    process.exit();
}

main();
