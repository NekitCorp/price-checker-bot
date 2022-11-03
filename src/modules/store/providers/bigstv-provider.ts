import axios from 'axios';
import iconv from 'iconv-lite';
import { HTMLElement, parse } from 'node-html-parser';
import { IStoreProduct, IStoreProvider, Store } from '../types';

export class BigstvProvider implements IStoreProvider {
    public name = 'BIGSTV';
    public exampleLink = 'https://www.bigstv.ru/product/televizor-oled-sony-xr-65a80j/';

    public checkLink(link: string) {
        return /^https:\/\/www\.bigstv\.ru\/product\/[a-z_\-0-9]+\/$/.test(link);
    }

    public async getData(url: string): Promise<IStoreProduct> {
        let html: string;
        try {
            // https://github.com/axios/axios/issues/332
            const response = await axios.get<Buffer>(url, { responseType: 'arraybuffer' });
            html = iconv.decode(response.data, 'win1251');
        } catch (error) {
            throw new Error('Не удалось получить страницу.');
        }

        let dom: HTMLElement;
        try {
            dom = parse(html);
        } catch (error) {
            throw new Error('Не удалось разобрать страницу.');
        }

        const id = dom.querySelector('input[name="item_id"]')?.getAttribute('value');
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

        return { id, name, store: Store.Bigstv, url, price };
    }
}
