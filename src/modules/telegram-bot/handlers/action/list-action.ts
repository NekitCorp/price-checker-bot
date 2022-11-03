import { ActionHandler } from '../../types';
import { replySubscribesList } from '../helpers';

export const listActionHandler: ActionHandler = async ({ ctx, services: { db } }) => {
    ctx.deleteMessage();
    await replySubscribesList(ctx, db);
};
