import { ChatState, State } from '../../database/entities/chat-state';
import { getStoreProvider } from '../../../src/store';
import { Store } from '../../store/types';
import { ActionHandler } from '../../telegram-bot/types';
import { Action } from '../types';

export const addActionHandler: ActionHandler = async ({ ctx, logger, dbDriver }) => {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }
    const store = data.replace(`${Action.Add} `, '') as Store;

    if (ctx.chatState) {
        // Удаляем состояние текущего чата
        await ctx.chatState.remove(dbDriver);
    }

    await ChatState.create({ state: State.AddProduct, store, chatId: ctx.chatId }).insert(dbDriver);

    ctx.deleteMessage();

    const storeProvider = getStoreProvider(store, logger);
    const message = `⌛ Пришлите мне ссылку с товаром.\n\n💡 Пример ссылки: ${storeProvider.exampleLink}`;
    ctx.reply(message, { disable_web_page_preview: true });
};
