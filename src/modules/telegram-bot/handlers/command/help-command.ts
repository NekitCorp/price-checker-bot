import { CommandHandler } from '../../types';
import { HELP_MESSAGE } from '../helpers';

export const helpCommandHandler: CommandHandler = async ({ ctx }) => {
    await ctx.reply(HELP_MESSAGE, { parse_mode: 'Markdown', disable_web_page_preview: true });
};
