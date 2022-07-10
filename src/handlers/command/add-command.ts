import { getStoreProvider } from '../../store';
import { Store } from '../../store/types';
import { CommandHandler } from '../../telegram-bot/types';
import { Action } from '../types';

export const addCommandHandler: CommandHandler = async ({ ctx, logger }) => {
    await ctx.reply('🛍️ Выберите магазин:', {
        reply_markup: {
            inline_keyboard: [
                Object.values(Store).map((store) => ({
                    text: getStoreProvider(store, logger).name,
                    callback_data: `${Action.Add} ${store}`,
                })),
            ],
        },
        parse_mode: 'Markdown',
    });
};
