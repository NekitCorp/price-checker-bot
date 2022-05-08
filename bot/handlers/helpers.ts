import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { driver } from '../../database/db-driver';
import { Subscription } from '../../database/entities/subscription';
import { Action, Command } from './types';

export const HELP_MESSAGE = `Я бот для мониторинга цен в магазине [store77](https://store77.net/) по определенным товарам. Я буду уведомлять тебя, когда цена на определенный товар изменилась.

🔼 - цена на товар повысилась
🔽 - цена на товар снизилась

*Список доступных команд:*
/${Command.Help} - помощь
/${Command.List} - список отслеживаемых товаров
/${Command.Add} - добавить новый товар для отслеживания
`;

export async function replySubscribesList(ctx: Context<Update>) {
    const chatId = ctx.chat?.id || ctx.from?.id;

    if (!chatId) {
        ctx.reply('Ошибка. Не найден идентификатор чата.');
        return;
    }

    const subscriptions = await Subscription.getByUser(driver, { chatId });

    if (subscriptions.length === 0) {
        ctx.reply(`У вас пока нет отслеживаемых товаров. Для добавления воспользуйтесь командой /${Command.Add}.`);
        return;
    }

    const message =
        '🔔 Список текущих подписок:' +
        '\n' +
        '\n' +
        subscriptions.map((sub) => `\`${sub.productId}\` [[${sub.store}]] ${sub.name}`).join('\n');

    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                subscriptions.map((sub) => ({
                    text: sub.productId,
                    callback_data: `${Action.SubscriptionDetail} ${sub.productId}`,
                })),
            ],
        },
        parse_mode: 'Markdown',
    });
}
