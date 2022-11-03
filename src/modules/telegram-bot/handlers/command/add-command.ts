import { getStoreProvider } from '../../../store';
import { Store } from '../../../store/types';
import { CommandHandler } from '../../types';
import { Action } from '../types';

export const addCommandHandler: CommandHandler = async ({ ctx }) => {
    await ctx.reply('🛍️ Выберите магазин:', {
        reply_markup: {
            inline_keyboard: [
                Object.values(Store).map((store) => ({
                    text: getStoreProvider(store).name,
                    callback_data: `${Action.Add} ${store}`,
                })),
            ],
        },
        parse_mode: 'Markdown',
    });
};
