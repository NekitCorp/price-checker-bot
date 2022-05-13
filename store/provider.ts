import { Price } from '../database/entities/price';
import { Product, Store } from '../database/entities/product';
import { BigstvProvider } from './providers/bigstv-provider';
import { Store77Provider } from './providers/store77-provider';

export interface IStoreProvider {
    exampleLink: string;

    checkLink(link: string): boolean;
    getData(url: string): Promise<{ product: Product; price: Price }>;
}

export function getStoreProvider(store: Store): IStoreProvider {
    switch (store) {
        case Store.Store77:
            return new Store77Provider();
        case Store.Bigstv:
            return new BigstvProvider();
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}
