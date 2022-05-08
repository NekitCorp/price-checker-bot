import { Store } from '../../../database/entities/product';
import { getStoreName } from '../../../utils/store';
import { Action, CommandContext } from '../types';

export async function addCommandHandler(ctx: CommandContext) {
    ctx.reply('🛍️ Выберите магазин:', {
        reply_markup: {
            inline_keyboard: [
                Object.values(Store).map((store) => ({
                    text: getStoreName(store),
                    callback_data: `${Action.Add} ${store}`,
                })),
            ],
        },
        parse_mode: 'Markdown',
    });
}
