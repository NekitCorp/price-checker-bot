import axios from 'axios';
import https from 'https';
import { HTMLElement, parse } from 'node-html-parser';
import { Price } from '../../database/entities/price';
import { Product, ProductId, Store } from '../../database/entities/product';
import { logger } from '../../utils/logger';
import { IStoreProvider } from '../provider';
import iconv from 'iconv-lite';

export class BigstvProvider implements IStoreProvider {
    public exampleLink = 'https://www.bigstv.ru/product/televizor-oled-sony-xr-65a80j/';

    public checkLink(link: string) {
        return /^https:\/\/www\.bigstv\.ru\/product\/[a-z_\-0-9]+\/$/.test(link);
    }

    public async getData(url: string): Promise<{ product: Product; price: Price }> {
        let html: string;
        try {
            // https://github.com/axios/axios/issues/332
            const response = await axios.get<Buffer>(url, { responseType: 'arraybuffer' });
            html = iconv.decode(response.data, 'win1251');
        } catch (error) {
            logger.error(error, { scope: 'ERROR_BIGSTV_GET_PAGE' });
            throw new Error('Не удалось получить страницу.');
        }

        let dom: HTMLElement;
        try {
            dom = parse(html);
        } catch (error) {
            logger.error(error, { scope: 'ERROR_BIGSTV_PARSE_PAGE' });
            throw new Error('Не удалось разобрать страницу.');
        }

        const id = dom.querySelector('input[name="item_id"]')?.getAttribute('value') as ProductId | undefined;
        if (!id) {
            throw new Error('Не удалось найти код товара.');
        }

        const name = dom.querySelector('.page-title')?.innerText.replace(/[\n\t]/g, '');
        if (!name) {
            throw new Error('Не удалось найти название товара.');
        }

        const price = parseInt(dom.getElementById(`tovar_form_price${id}`)?.innerText.replace(/[^0-9]/g, '') ?? '');
        if (!price) {
            throw new Error('Не удалось найти цену товара.');
        }

        return {
            product: Product.create({ id, name, store: Store.Bigstv, url }),
            price: Price.create({ productId: id, price }),
        };
    }
}
