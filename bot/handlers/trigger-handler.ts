import dayjs from 'dayjs';
import { driver } from '../../database/db-driver';
import { Price } from '../../database/entities/price';
import { Product, ProductId } from '../../database/entities/product';
import { ChatId, Subscription } from '../../database/entities/subscription';
import { getStoreProvider } from '../../store/provider';
import { getKeys, truthy } from '../../utils/array';
import { logger } from '../../utils/logger';
import { numberWithSpaces } from '../../utils/number';
import { escapeMessage } from '../../utils/telegram';
import { TelegramBot } from '../telegram-bot';

export async function triggerHandler(bot: TelegramBot) {
    await updatePrices();

    const subscriptions = await getSubscriptions();
    const availableProducts = await getAvailableProducts();

    logger.log(`Available products: ${Object.keys(availableProducts).join(',')}.`);

    const messages = prepareMessages(subscriptions, availableProducts);

    logger.log(`Messages to send: ${messages.map((m) => m.chatId).join(',')}.`);

    await Promise.all(
        messages.map(async ({ chatId, message }) => {
            await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
            logger.log(`Message ${chatId} sent successfully!`);
        }),
    );
}

/**
 * Добавление новых цен на продукты, имеющих хотя бы одну подписку.
 */
async function updatePrices() {
    const products = await Product.getProductsWithSubscription(driver);

    for await (const product of products) {
        const storeProvider = getStoreProvider(product.store);

        try {
            const data = await storeProvider.getData(product.url);

            await data.price.insert(driver);

            logger.log(`New price ${numberWithSpaces(data.price.price)} added for product ${data.product.id}.`);
        } catch (error) {
            logger.error(error, { scope: 'TRIGGER_UPDATE_PRICE_' + product.id });
        }
    }
}

type ChatSubscriptions = Record<ChatId, Subscription[]>;

/**
 * Получить все подписки по каждому чату.
 */
async function getSubscriptions(): Promise<ChatSubscriptions> {
    const subscriptions = await Subscription.getAll(driver);
    return subscriptions.reduce<ChatSubscriptions>(
        (acc, val) => ({ ...acc, [val.chatId]: acc[val.chatId] ? [...acc[val.chatId], val] : [val] }),
        {},
    );
}

type AvailableProducts = Record<ProductId, [Price, Price]>;

/**
 * Получить все доступные продукты. Доступная цена - продукт, цена у которого есть на вчера и на сегодня.
 */
async function getAvailableProducts(): Promise<AvailableProducts> {
    const today = dayjs().hour(0).minute(0).second(0);
    const tomorrow = today.add(1, 'day');
    const yesterday = today.add(-1, 'day');
    const todayPrices = await Price.getByDate(driver, { from: today.toDate(), to: tomorrow.toDate() });
    const yesterdayPrices = await Price.getByDate(driver, { from: yesterday.toDate(), to: today.toDate() });

    return todayPrices.reduce<AvailableProducts>((acc, todayPrice) => {
        const productId = todayPrice.productId;
        const yesterdayPrice = yesterdayPrices.find((p) => p.productId === productId);
        return yesterdayPrice ? { ...acc, [productId]: [todayPrice, yesterdayPrice] } : acc;
    }, {});
}

type PreparedMessage = { chatId: ChatId; message: string };

function prepareMessages(subscriptions: ChatSubscriptions, availableProducts: AvailableProducts): PreparedMessage[] {
    return getKeys(subscriptions)
        .map((chatId) => {
            const subs = subscriptions[chatId];
            const filteredSubs = subs
                // Есть сегодняшняя цена и вчерашняя
                .filter((sub) => availableProducts[sub.productId])
                // Эти цены отличаются
                .filter((sub) => {
                    const [todayPrice, yesterdayPrice] = availableProducts[sub.productId];
                    return todayPrice.price !== yesterdayPrice.price;
                });

            if (filteredSubs.length === 0) {
                return null;
            }

            const message =
                '💹 На ваши товары есть изменения цены:\n\n' +
                filteredSubs
                    .map((sub) => {
                        const [todayPrice, yesterdayPrice] = availableProducts[sub.productId];
                        const icon = todayPrice.price > yesterdayPrice.price ? '🔼' : '🔽';
                        return `• ${icon} \`${sub.productId}\` \\[${sub.store}\\] ${numberWithSpaces(
                            todayPrice.price,
                        )}₽ ~${numberWithSpaces(yesterdayPrice.price)}₽~ [${escapeMessage(sub.name)}](${sub.url})`;
                    })
                    .join('\n');

            return { chatId, message };
        })
        .filter(truthy);
}
