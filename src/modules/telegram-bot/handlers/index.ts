import { ActionHandler, CommandHandler, TextHandler, Triggers } from '../types';
import {
    addActionHandler,
    chartActionHandler,
    listActionHandler,
    removeActionHandler,
    subscriptionDetailActionHandler,
} from './action';
import { addCommandHandler, helpCommandHandler, listCommandHandler, startCommandHandler } from './command';
import { textHandler } from './text/text-handler';
import { Action, Command } from './types';

export const commands: Record<Command, CommandHandler> = {
    [Command.Start]: startCommandHandler,
    [Command.Help]: helpCommandHandler,
    [Command.List]: listCommandHandler,
    [Command.Add]: addCommandHandler,
};

export const actions: Record<Action, { trigger: Triggers; handler: ActionHandler }> = {
    [Action.SubscriptionDetail]: {
        trigger: new RegExp(`^${Action.SubscriptionDetail}\\s{1}[0-9]+$`),
        handler: subscriptionDetailActionHandler,
    },
    [Action.List]: {
        trigger: Action.List,
        handler: listActionHandler,
    },
    [Action.Remove]: {
        trigger: new RegExp(`^${Action.Remove}\\s{1}[0-9]+$`),
        handler: removeActionHandler,
    },
    [Action.Add]: {
        trigger: new RegExp(`^${Action.Add}\\s{1}[a-zA-Z0-9]+$`),
        handler: addActionHandler,
    },
    [Action.Chart]: {
        trigger: new RegExp(`^${Action.Chart}\\s{1}[a-zA-Z0-9]+$`),
        handler: chartActionHandler,
    },
};

export const textHandlers: TextHandler[] = [textHandler];
