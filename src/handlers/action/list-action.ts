import { ActionHandler } from '../../telegram-bot/types';
import { replySubscribesList } from '../helpers';

export const listActionHandler: ActionHandler = async ({ ctx, dbDriver }) => {
    ctx.deleteMessage();
    await replySubscribesList(ctx, dbDriver);
};
