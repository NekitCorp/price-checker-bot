import { driver } from '../../../database/db-driver';
import { ChatState, State } from '../../../database/entities/chat-state';
import { Store } from '../../../database/entities/product';
import { getStoreProvider } from '../../../store/provider';
import { Action, ActionContext } from '../types';

export async function addActionHandler(ctx: ActionContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }
    const store = data.replace(`${Action.Add} `, '') as Store;

    if (ctx.chatState) {
        // Удаляем состояние текущего чата
        await ctx.chatState.remove(driver);
    }

    await ChatState.create({ state: State.AddProduct, store, chatId: ctx.chatId }).insert(driver);

    ctx.deleteMessage();

    const storeProvider = getStoreProvider(store);
    const message = `⌛ Пришлите мне ссылку с товаром.\n\n💡 Пример ссылки: ${storeProvider.exampleLink}`;
    ctx.reply(message, { disable_web_page_preview: true });
}
