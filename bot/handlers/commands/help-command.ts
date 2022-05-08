import { HELP_MESSAGE } from '../helpers';
import { CommandContext } from '../types';

export function helpCommandHandler(ctx: CommandContext) {
    ctx.reply(HELP_MESSAGE, { parse_mode: 'Markdown', disable_web_page_preview: true });
}
