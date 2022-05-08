import { driver } from '../../../database/db-driver';
import { Subscription } from '../../../database/entities/subscription';
import { replySubscribesList } from '../helpers';
import { Action, ActionContext } from '../types';

export async function removeActionHandler(ctx: ActionContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }

    const subscriptions = await Subscription.getByUser(driver, { chatId: ctx.chatId });
    const subscription = subscriptions.find((sub) => sub.productId === data.replace(`${Action.Remove} `, ''));

    if (!subscription) {
        ctx.reply('❌ Ошибка. Подписка не найдена.');
        return;
    }

    await subscription.remove(driver);

    ctx.deleteMessage();
    await replySubscribesList(ctx);
    ctx.reply(`✅ Подписка \`${subscription.productId}\` успешно удалена!`, { parse_mode: 'Markdown' });
}
