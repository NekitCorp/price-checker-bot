import { replySubscribesList } from '../helpers';
import { CommandContext } from '../types';

export async function listCommandHandler(ctx: CommandContext) {
    await replySubscribesList(ctx);
}
