import { CommandHandler } from '../../telegram-bot/types';
import { replySubscribesList } from '../helpers';

export const listCommandHandler: CommandHandler = async ({ ctx, dbDriver }) => {
    await replySubscribesList(ctx, dbDriver);
};
