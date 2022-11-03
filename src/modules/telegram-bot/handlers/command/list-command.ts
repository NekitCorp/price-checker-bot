import { CommandHandler } from '../../types';
import { replySubscribesList } from '../helpers';

export const listCommandHandler: CommandHandler = async ({ ctx, services: { db } }) => {
    await replySubscribesList(ctx, db);
};
