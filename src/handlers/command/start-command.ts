import { CommandHandler } from '../../telegram-bot/types';
import { HELP_MESSAGE } from '../helpers';

export const startCommandHandler: CommandHandler = async ({ ctx }) => {
    const username = ctx.message.from.first_name || ctx.message.from.username;
    await ctx.reply(`👋 Привет, ${username}. ` + HELP_MESSAGE, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    });
};
