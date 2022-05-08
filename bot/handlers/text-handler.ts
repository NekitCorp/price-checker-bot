import { driver } from '../../database/db-driver';
import { State } from '../../database/entities/chat-state';
import { Product } from '../../database/entities/product';
import { Subscription } from '../../database/entities/subscription';
import { getStoreProvider } from '../../store/provider';
import { getStoreExampleLink, getStoreLinkRegExp } from '../../utils/store';
import { Command, CommandContext } from './types';

export async function textHandler(ctx: CommandContext) {
    if (ctx.chatState?.state === State.AddProduct) {
        if (!getStoreLinkRegExp(ctx.chatState.store).test(ctx.message.text)) {
            const message = `❌ Неверная ссылка.
    
💡 Пример ссылки: ${getStoreExampleLink(ctx.chatState.store)}`;
            ctx.reply(message);
        } else {
            const storeProvider = getStoreProvider(ctx.chatState.store);

            try {
                const data = await storeProvider.getData(ctx.message.text);

                const product = await Product.get(driver, { id: data.product.id });

                if (!product) {
                    await data.product.insert(driver);
                }

                await data.price.insert(driver);
                await Subscription.create({ chatId: ctx.chatId, productId: data.product.id }).insert(driver);

                const message = `✅ Подписка \`${data.product.id}\` успешно создана!

💡 Для просмотра всех активных подписок используйте команду /${Command.List}.`;

                ctx.reply(message, { parse_mode: 'Markdown' });
            } catch (error) {
                console.error(error);
                ctx.reply('😭 Ошибка. Попробуйте еще раз...');
            }
        }

        await ctx.chatState.remove(driver);

        return;
    }

    // not found chat state
    ctx.replyWithSticker('CAACAgIAAxkBAAPhYneTKx_dcDOYQbazLwhEKAsV8LgAAvsUAAKEPslLcnZGpyqRn64kBA');
}
