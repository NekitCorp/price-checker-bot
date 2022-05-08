import { HELP_MESSAGE } from '../helpers';
import { CommandContext } from '../types';

export function startCommandHandler(ctx: CommandContext) {
    const username = ctx.message.from.first_name || ctx.message.from.username;
    ctx.reply(`👋 Привет, ${username}. ` + HELP_MESSAGE, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    });
}
