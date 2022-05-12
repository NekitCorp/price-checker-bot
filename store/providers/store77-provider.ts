import axios from 'axios';
import https from 'https';
import { HTMLElement, parse } from 'node-html-parser';
import { Price } from '../../database/entities/price';
import { Product, ProductId, Store } from '../../database/entities/product';
import { logger } from '../../utils/logger';
import { IStoreProvider } from '../provider';

// https://stackoverflow.com/questions/51363855/how-to-configure-axios-to-use-ssl-certificate
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export class Store77Provider implements IStoreProvider {
    async getData(url: string): Promise<{ product: Product; price: Price }> {
        let html: string;
        try {
            const response = await axios.get<string>(url, { httpsAgent });
            html = response.data;
        } catch (error) {
            logger.error(error, { scope: 'ERROR_STORE77_GET_PAGE' });
            throw new Error('Не удалось получить страницу.');
        }

        let dom: HTMLElement;
        try {
            dom = parse(html);
        } catch (error) {
            logger.error(error, { scope: 'ERROR_STORE77_PARSE_PAGE' });
            throw new Error('Не удалось разобрать страницу.');
        }

        const id = dom.querySelector('[data-type="addBasket"]')?.getAttribute('data-id') as ProductId | undefined;
        if (!id) {
            throw new Error('Не удалось найти название код товара.');
        }

        const name = dom.querySelector('h1.title_card_product')?.innerText;
        if (!name) {
            throw new Error('Не удалось найти название товара.');
        }

        const price = parseInt(dom.querySelector('.price_title_product')?.innerText.replace(/[^0-9]/g, '') ?? '');
        if (!price) {
            throw new Error('Не удалось найти цену товара.');
        }

        return {
            product: Product.create({ id, name, store: Store.Store77, url }),
            price: Price.create({ productId: id, price }),
        };
    }
}
