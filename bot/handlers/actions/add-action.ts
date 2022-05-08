import { driver } from '../../../database/db-driver';
import { ChatState, State } from '../../../database/entities/chat-state';
import { Store } from '../../../database/entities/product';
import { getStoreExampleLink } from '../../../utils/store';
import { Action, ActionContext } from '../types';

export async function addActionHandler(ctx: ActionContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }
    const store = data.replace(`${Action.Add} `, '') as Store;

    if (ctx.chatState) {
        ctx.reply(`❌ Ошибка. Состояние чата: ${ctx.chatState.state}.`);
        return;
    }

    await ChatState.create({ state: State.AddProduct, store, chatId: ctx.chatId }).insert(driver);

    ctx.deleteMessage();

    const message = `⌛ Пришлите мне ссылку с товаром.
    
💡 Пример ссылки: ${getStoreExampleLink(store)}`;

    ctx.reply(message, { disable_web_page_preview: true });
}
