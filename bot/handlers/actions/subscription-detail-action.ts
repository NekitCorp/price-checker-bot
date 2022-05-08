import dayjs from 'dayjs';
import { driver } from '../../../database/db-driver';
import { Subscription } from '../../../database/entities/subscription';
import { Action, ActionContext } from '../types';

export async function subscriptionDetailActionHandler(ctx: ActionContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('Ошибка. Не найдены данные callbackQuery.');
        return;
    }

    const subscriptions = await Subscription.getByUser(driver, { chatId: ctx.chatId });
    const subscription = subscriptions.find(
        (sub) => sub.productId === data.replace(`${Action.SubscriptionDetail} `, ''),
    );

    if (!subscription) {
        ctx.reply('Ошибка. Подписка не найдена.');
        return;
    }

    const message =
        `🔔 Подписка \`${subscription.productId}\`\n` +
        `Магазин: ${subscription.store}\n` +
        `Товар: [${subscription.name}](${subscription.url})\n` +
        `Дата создания: ${dayjs(subscription.created).format('dddd, MMMM D, YYYY HH:mm')}`;

    ctx.deleteMessage();
    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔙 Назад', callback_data: Action.List },
                    { text: '🗑 Удалить', callback_data: `${Action.Remove} ${subscription.productId}` },
                ],
            ],
        },
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    });
}
