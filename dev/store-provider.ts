/* eslint-disable no-console */
import { getStoreProvider } from '../src/modules/store';
import { Store } from '../src/modules/store/types';

const TEST_STORES: Record<Store, string[]> = {
    [Store.Store77]: [
        'https://store77.net/apple_iphone_13_pro_max/telefon_apple_iphone_13_pro_max_128gb_alpine_green_mncp3ll_a/',
        'https://store77.net/chasy_apple_watch_series_7/chasy_apple_watch_series_7_gps_41mm_aluminum_case_with_sport_band_belyy_siyayushchaya_zvezda_mkmx3/',
        'https://store77.net/apple_macbook_air/noutbuk_apple_macbook_air_m1_16gb_256gb_ssd_zolotoy_z12a0008qru_a/',
    ],
    [Store.Bigstv]: [
        'https://www.bigstv.ru/product/televizor-oled-sony-xr-65a80j/',
        'https://www.bigstv.ru/product/mitsubishi-electric-msz-hj25va-vnutrennij-blok/',
        'https://www.bigstv.ru/product/antennyj-kabel/',
    ],
};

async function main() {
    for (const store in TEST_STORES) {
        const storeProvider = getStoreProvider(store as Store);

        for (const url of TEST_STORES[store as Store]) {
            console.log(`[${store}] Start check ${url}`);

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
    }

    process.exit();
}

main();
