import { replySubscribesList } from '../helpers';
import { ActionContext } from '../types';

export async function listActionHandler(ctx: ActionContext) {
    ctx.deleteMessage();
    await replySubscribesList(ctx);
}
