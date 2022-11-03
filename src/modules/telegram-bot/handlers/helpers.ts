import { Subscription } from '../../database/entities/subscription';
import { IDbDriver } from '../../database/types';
import { MyContext } from '../types';
import { chunkArray } from '../../../utils/array';
import { Action, Command } from './types';

export const HELP_MESSAGE = `Я 🤖 бот для мониторинга цен в магазинах по определенным товарам. Я буду присылать тебе уведомления каждый день в 10:00, если на какой-либо товар из твоего списка поменялась цена.

🔼 - цена на товар повысилась
🔽 - цена на товар снизилась

💡 *Список доступных команд:*
/${Command.Help} - помощь
/${Command.List} - список отслеживаемых товаров
/${Command.Add} - добавить новый товар для отслеживания
`;

export async function replySubscribesList(ctx: MyContext, db: IDbDriver) {
    const subscriptions = await Subscription.getByUser(db, { chatId: ctx.chatId });

    if (subscriptions.length === 0) {
        return ctx.reply(
            `😶 У вас пока нет отслеживаемых товаров. Для добавления воспользуйтесь командой /${Command.Add}.`,
        );
    }

    const message =
        '🔔 Список текущих подписок:\n\n' +
        subscriptions.map((sub) => `👉 \`${sub.productId}\` [[${sub.store}]] ${sub.name}`).join('\n');

    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                ...chunkArray(subscriptions, 3).map((subs) =>
                    subs.map((sub) => ({
                        text: sub.productId,
                        callback_data: `${Action.SubscriptionDetail} ${sub.productId}`,
                    })),
                ),
            ],
        },
        parse_mode: 'Markdown',
    });
}
