import dayjs from 'dayjs';
import { driver } from '../../database/db-driver';
import { Price } from '../../database/entities/price';
import { Product } from '../../database/entities/product';
import { Subscription } from '../../database/entities/subscription';
import { getStoreProvider } from '../../store/provider';
import { numberWithSpaces } from '../../utils/number';
import { escapeMessage } from '../../utils/telegram';
import { TelegramBot } from '../telegram-bot';

export async function triggerHandler(bot: TelegramBot) {
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

    const subscriptions = await Subscription.getAll(driver);
    const chatSubscriptions = subscriptions.reduce<Record<number, Subscription[]>>(
        (acc, val) => ({ ...acc, [val.chatId]: acc[val.chatId] ? [...acc[val.chatId], val] : [val] }),
        {},
    );

    console.log(`Current subscriptions: `, chatSubscriptions);

    const today = dayjs().hour(0).minute(0).second(0);
    const tomorrow = today.add(1, 'day');
    const yesterday = today.add(-1, 'day');
    const todayPrices = await Price.getByDate(driver, { from: today.toDate(), to: tomorrow.toDate() });
    const yesterdayPrices = await Price.getByDate(driver, { from: yesterday.toDate(), to: today.toDate() });
    const availablePrices = todayPrices.reduce<Record<string, [Price, Price]>>((acc, todayPrice) => {
        const productId = todayPrice.productId;
        const yesterdayPrice = yesterdayPrices.find((p) => p.productId === productId);
        return yesterdayPrice ? { ...acc, [productId]: [todayPrice, yesterdayPrice] } : acc;
    }, {});

    console.log(`Available prices: `, availablePrices);

    const messages = Object.entries(chatSubscriptions)
        .map(([chatId, subs]) => {
            const message =
                '💹 На ваши товары есть изменения цены:\n\n' +
                subs
                    // Есть сегодняшняя цена и вчерашняя
                    .filter((sub) => availablePrices[sub.productId])
                    // Эти цены отличаются
                    .filter((sub) => {
                        const [todayPrice, yesterdayPrice] = availablePrices[sub.productId];
                        return todayPrice.price !== yesterdayPrice.price;
                    })
                    .map((sub) => {
                        const [todayPrice, yesterdayPrice] = availablePrices[sub.productId];
                        const icon = todayPrice.price > yesterdayPrice.price ? '🔼' : '🔽';
                        return `• ${icon} \`${sub.productId}\` \\[${sub.store}\\] ${numberWithSpaces(
                            todayPrice.price,
                        )}₽ ~${numberWithSpaces(yesterdayPrice.price)}₽~ [${escapeMessage(sub.name)}](${sub.url})`;
                    })
                    .join('\n');

            return { chatId, message };
        })
        .filter((message) => message.message);

    await Promise.all(
        messages.map(
            async ({ chatId, message }) =>
                await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2', disable_web_page_preview: true }),
        ),
    );
}
