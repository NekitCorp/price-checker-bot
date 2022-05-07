import { Price } from '../database/entities/price';
import { Product, Store } from '../database/entities/product';
import { Store77Provider } from './providers/store77-provider';

export interface IStoreProvider {
    getData(url: string): Promise<{ product: Product; price: Price }>;
}

export function getStoreProvider(store: Store): IStoreProvider {
    switch (store) {
        case Store.Store77:
            return new Store77Provider();
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}
