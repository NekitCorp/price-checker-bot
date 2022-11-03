import dayjs from 'dayjs';
import { getKeys, truthy } from '../../utils/array';
import { numberWithSpaces } from '../../utils/number';
import { Price } from '../database/entities/price';
import { Product, ProductId } from '../database/entities/product';
import { ChatId, Subscription } from '../database/entities/subscription';
import { IDbDriver } from '../database/types';
import { ILogger } from '../logger/types';
import { getStoreProvider } from '../store';
import { ITelegramBot } from '../telegram-bot/types';
import { escapeMessage } from './utils';

const SCOPE = 'TRIGGER_HANDLER';

export async function triggerHandler(bot: ITelegramBot, logger: ILogger, dbDriver: IDbDriver) {
    logger.log('Trigger handler processing...', { scope: SCOPE });

    try {
        await updatePrices(logger, dbDriver);

        const subscriptions = await getSubscriptions(dbDriver);
        const availableProducts = await getAvailableProducts(dbDriver);

        logger.log(`Available products: ${Object.keys(availableProducts).join(',')}.`, { scope: SCOPE });

        const messages = prepareMessages(subscriptions, availableProducts);

        logger.log(`Messages to send: ${messages.map((m) => m.chatId).join(',')}.`, { scope: SCOPE });

        await Promise.all(
            messages.map(async ({ chatId, message }) => {
                try {
                    await bot.sendMessage(chatId, message, {
                        parse_mode: 'MarkdownV2',
                        disable_web_page_preview: true,
                    });
                    logger.log(`Message ${chatId} sent successfully!`, { scope: SCOPE });
                } catch (error) {
                    logger.error(error, { scope: `${SCOPE}_ERROR_FAILED_SEND_MESSAGE` });
                }
            }),
        );
    } catch (error) {
        logger.error(error, { scope: 'TRIGGER_ERROR' });
    }
}

/**
 * Добавление новых цен на продукты, имеющих хотя бы одну подписку.
 */
async function updatePrices(logger: ILogger, dbDriver: IDbDriver) {
    const products = await Product.getProductsWithSubscription(dbDriver);

    for await (const product of products) {
        const storeProvider = getStoreProvider(product.store, logger);

        try {
            const { id, price } = await storeProvider.getData(product.url);
            const priceEntity = Price.create({ productId: id as ProductId, price });

            await priceEntity.insert(dbDriver);

            logger.log(`New price ${numberWithSpaces(price)} added for product ${id}.`, { scope: SCOPE });
        } catch (error) {
            logger.error(error, { scope: `ERROR_TRIGGER_UPDATE_PRICE_${product.id}` });
        }
    }
}

type ChatSubscriptions = Record<ChatId, Subscription[]>;

/**
 * Получить все подписки по каждому чату.
 */
async function getSubscriptions(dbDriver: IDbDriver): Promise<ChatSubscriptions> {
    const subscriptions = await Subscription.getAll(dbDriver);
    return subscriptions.reduce<ChatSubscriptions>(
        (acc, val) => ({ ...acc, [val.chatId]: acc[val.chatId] ? [...acc[val.chatId], val] : [val] }),
        {},
    );
}

type AvailableProducts = Record<ProductId, [Price, Price]>;

/**
 * Получить все доступные продукты. Доступная цена - продукт, цена у которого есть на вчера и на сегодня.
 */
async function getAvailableProducts(dbDriver: IDbDriver): Promise<AvailableProducts> {
    const today = dayjs().hour(0).minute(0).second(0);
    const tomorrow = today.add(1, 'day');
    const yesterday = today.add(-1, 'day');
    const todayPrices = await Price.getByDate(dbDriver, { from: today.toDate(), to: tomorrow.toDate() });
    const yesterdayPrices = await Price.getByDate(dbDriver, { from: yesterday.toDate(), to: today.toDate() });

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
