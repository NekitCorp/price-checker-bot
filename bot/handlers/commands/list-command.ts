import { replySubscribesList } from '../helpers';
import { CommandContext } from '../types';

export async function listCommandHandler(ctx: CommandContext) {
    const username = ctx.message.from.first_name || ctx.message.from.username;
    await replySubscribesList(ctx);
}
