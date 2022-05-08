import { driver } from '../../database/db-driver';
import { ChatState, State } from '../../database/entities/chat-state';
import { Price } from '../../database/entities/price';
import { Product } from '../../database/entities/product';
import { Subscription } from '../../database/entities/subscription';
import { getStoreProvider } from '../../store/provider';
import { logger } from '../../utils/logger';
import { getStoreExampleLink, getStoreLinkRegExp } from '../../utils/store';
import { Command, CommandContext } from './types';

export async function textHandler(ctx: CommandContext) {
    if (ctx.chatState?.state === State.AddProduct) {
        return await addProductHandler(ctx, ctx.chatState);
    }

    // not found chat state
    ctx.replyWithSticker('CAACAgIAAxkBAAPhYneTKx_dcDOYQbazLwhEKAsV8LgAAvsUAAKEPslLcnZGpyqRn64kBA');
}

async function addProductHandler(ctx: CommandContext, chatState: ChatState) {
    // Проверка ссылки
    if (!getStoreLinkRegExp(chatState.store).test(ctx.message.text)) {
        const message = `❌ Неверная ссылка.\n\n💡 Пример ссылки: ${getStoreExampleLink(chatState.store)}`;
        return ctx.reply(message, { disable_web_page_preview: true });
    }

    // Получение и разбор страницы
    let product: Product;
    let price: Price;
    try {
        const storeProvider = getStoreProvider(chatState.store);
        const data = await storeProvider.getData(ctx.message.text);
        product = data.product;
        price = data.price;
    } catch (error) {
        logger.error(error);
        return ctx.reply(`😭 Ошибка. ${error}`);
    }

    const userSubscriptions = await Subscription.getByUser(driver, { chatId: ctx.chatId });

    // Разрешаем создавать максимум 5 подписок
    if (userSubscriptions.length >= 5) {
        return ctx.reply('😬 Достигнуто максимальное количество подписок.');
    }

    // Проверяем то что такой подписки не существует
    if (userSubscriptions.find((sub) => sub.productId === product.id)) {
        return ctx.reply('🤔 Похоже такая подписка уже существует.');
    }

    // Если продукт до этого момента не существовал, создаем его
    if (!(await Product.get(driver, { id: product.id }))) {
        await product.insert(driver);
    }

    // Добавляем новую цену на продукт
    await price.insert(driver);

    // Добавляем подписку
    await Subscription.create({ chatId: ctx.chatId, productId: product.id }).insert(driver);

    const message =
        `✅ Подписка \`${product.id}\` успешно создана!\n\n` +
        `💡 Для просмотра всех активных подписок используйте команду /${Command.List}.`;
    ctx.reply(message, { parse_mode: 'Markdown' });

    // Удаляем состояние текущего чата
    await chatState.remove(driver);
}
