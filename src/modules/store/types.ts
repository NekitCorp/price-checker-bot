export enum Store {
    Store77 = 'Store77',
    Bigstv = 'Bigstv',
}

export type IStoreProduct = {
    id: string;
    name: string;
    store: Store;
    url: string;
    price: number;
};

export interface IStoreProvider {
    name: string;
    exampleLink: string;

    checkLink(link: string): boolean;
    getData(url: string): Promise<IStoreProduct>;
}
