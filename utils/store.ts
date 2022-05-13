import { Store } from '../database/entities/product';

export function getStoreName(store: Store): string {
    switch (store) {
        case Store.Store77:
            return 'Store77';
        case Store.Bigstv:
            return 'BIGSTV';
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}
