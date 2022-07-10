import { Subscription } from '../../database/entities/subscription';
import { ActionHandler } from '../../telegram-bot/types';
import { replySubscribesList } from '../helpers';
import { Action } from '../types';

export const removeActionHandler: ActionHandler = async ({ ctx, dbDriver }) => {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }

    const subscriptions = await Subscription.getByUser(dbDriver, { chatId: ctx.chatId });
    const subscription = subscriptions.find((sub) => sub.productId === data.replace(`${Action.Remove} `, ''));

    if (!subscription) {
        ctx.reply('❌ Ошибка. Подписка не найдена.');
        return;
    }

    await subscription.remove(dbDriver);

    ctx.deleteMessage();
    await replySubscribesList(ctx, dbDriver);
    ctx.reply(`✅ Подписка \`${subscription.productId}\` успешно удалена!`, { parse_mode: 'Markdown' });
};
