import { State } from '../../../database/entities/chat-state';
import { Price } from '../../../database/entities/price';
import { Product, ProductId } from '../../../database/entities/product';
import { Subscription } from '../../../database/entities/subscription';
import { getStoreProvider } from '../../../store';
import { TextHandler } from '../../types';
import { Command } from '../types';

export const textHandler: TextHandler = async (props) => {
    const { ctx } = props;

    if (ctx.chatState?.state === State.AddProduct) {
        await addProductHandler(props);
        return;
    }

    // not found chat state
    ctx.replyWithSticker('CAACAgIAAxkBAAPhYneTKx_dcDOYQbazLwhEKAsV8LgAAvsUAAKEPslLcnZGpyqRn64kBA');
};

const addProductHandler: TextHandler = async ({ ctx, services: { db, logger } }) => {
    if (!ctx.chatState) return;

    const storeProvider = getStoreProvider(ctx.chatState.store);

    // Проверка ссылки
    if (!storeProvider.checkLink(ctx.message.text)) {
        const message = `❌ Неверная ссылка.\n\n💡 Пример ссылки: ${storeProvider.exampleLink}`;
        ctx.reply(message, { disable_web_page_preview: true });
        return;
    }

    // Получение и разбор страницы
    let product: Product;
    let priceEntity: Price;
    try {
        const { id, name, price, store, url } = await storeProvider.getData(ctx.message.text);
        product = Product.create({ id: id as ProductId, name, store, url });
        priceEntity = Price.create({ productId: id as ProductId, price });
    } catch (error) {
        logger.error(error, { context: ctx, scope: 'ERROR_ADD_PRODUCT_HANDLER' });
        ctx.reply(`😭 Ошибка. ${error}`);
        return;
    }

    const userSubscriptions = await Subscription.getByUser(db, { chatId: ctx.chatId });

    // Разрешаем создавать максимум 5 подписок
    if (userSubscriptions.length >= 5) {
        ctx.reply('😬 Достигнуто максимальное количество подписок.');
        return;
    }

    // Проверяем то что такой подписки не существует
    if (userSubscriptions.find((sub) => sub.productId === product.id)) {
        ctx.reply('🤔 Похоже такая подписка уже существует.');
        return;
    }

    // Если продукт до этого момента не существовал, создаем его
    if (!(await Product.get(db, { id: product.id }))) {
        await product.insert(db);
    }

    // Добавляем новую цену на продукт
    await priceEntity.insert(db);

    // Добавляем подписку
    await Subscription.create({ chatId: ctx.chatId, productId: product.id }).insert(db);

    const message =
        `✅ Подписка \`${product.id}\` успешно создана!\n\n` +
        `💡 Для просмотра всех активных подписок используйте команду /${Command.List}.`;
    ctx.reply(message, { parse_mode: 'Markdown' });

    // Удаляем состояние текущего чата
    await ctx.chatState.remove(db);
};
