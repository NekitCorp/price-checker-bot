import axios from 'axios';
import https from 'https';
import { HTMLElement, parse } from 'node-html-parser';
import { ILogger } from '../../logger/types';
import { IStoreProduct, IStoreProvider, Store } from '../types';

// https://stackoverflow.com/questions/51363855/how-to-configure-axios-to-use-ssl-certificate
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export class Store77Provider implements IStoreProvider {
    constructor(private logger: ILogger) {}

    public name = 'Store77';
    public exampleLink =
        'https://store77.net/apple_iphone_13_pro_max/telefon_apple_iphone_13_pro_max_128gb_alpine_green_mncp3ll_a/';

    public checkLink(link: string) {
        return /^https:\/\/store77\.net\/[a-z_0-9]+\/[a-z_0-9]+\/$/.test(link);
    }

    public async getData(url: string): Promise<IStoreProduct> {
        let html: string;
        try {
            const response = await axios.get<string>(url, { httpsAgent });
            html = response.data;
        } catch (error) {
            this.logger.error(error, { scope: 'ERROR_STORE77_GET_PAGE' });
            throw new Error('Не удалось получить страницу.');
        }

        let dom: HTMLElement;
        try {
            dom = parse(html);
        } catch (error) {
            this.logger.error(error, { scope: 'ERROR_STORE77_PARSE_PAGE' });
            throw new Error('Не удалось разобрать страницу.');
        }

        const id = dom.querySelector('[data-type="addBasket"]')?.getAttribute('data-id');
        if (!id) {
            throw new Error('Не удалось найти код товара.');
        }

        const name = dom.querySelector('h1.title_card_product')?.innerText;
        if (!name) {
            throw new Error('Не удалось найти название товара.');
        }

        const price = parseInt(dom.querySelector('.price_title_product')?.innerText.replace(/[^0-9]/g, '') ?? '');
        if (!price) {
            throw new Error('Не удалось найти цену товара.');
        }

        return { id, name, store: Store.Store77, url, price };
    }
}
