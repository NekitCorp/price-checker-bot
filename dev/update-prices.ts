require('dotenv-flow').config();

import { driver } from '../database/db-driver';
import { Product } from '../database/entities/product';
import { getStoreProvider } from '../store/provider';

driver.withSession(async (session) => {
    const products = await Product.getProductsWithSubscription(driver);

    for await (const product of products) {
        const storeProvider = getStoreProvider(product.store);

        try {
            const data = await storeProvider.getData(product.url);
            await data.price.insert(driver);
            console.log(`New price added for product "${data.product.name}" [${data.product.id}]: ${data.price.price}`);
        } catch (error) {
            console.log(error);
        }
    }

    process.exit();
});
