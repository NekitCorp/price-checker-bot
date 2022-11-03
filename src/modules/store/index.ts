import { BigstvProvider } from './providers/bigstv-provider';
import { Store77Provider } from './providers/store77-provider';
import { IStoreProvider, Store } from './types';

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
