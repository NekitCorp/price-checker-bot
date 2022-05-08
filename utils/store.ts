import { Store } from '../database/entities/product';

export function getStoreName(store: Store): string {
    switch (store) {
        case Store.Store77:
            return 'Store77';
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}

export function getStoreExampleLink(store: Store): string {
    switch (store) {
        case Store.Store77:
            return 'https://store77.net/apple_iphone_13_pro_max/telefon_apple_iphone_13_pro_max_128gb_alpine_green_mncp3ll_a/';
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}

export function getStoreLinkRegExp(store: Store): RegExp {
    switch (store) {
        case Store.Store77:
            return /^https:\/\/store77\.net\/[a-z_0-9]+\/[a-z_0-9]+\/$/;
        default:
            ASSERT_EXHAUSTIVE(store);
    }
}
