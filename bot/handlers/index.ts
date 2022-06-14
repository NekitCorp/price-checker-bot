import { addActionHandler } from './actions/add-action';
import { chartActionHandler } from './actions/chart-action';
import { listActionHandler } from './actions/list-action';
import { removeActionHandler } from './actions/remove-action';
import { subscriptionDetailActionHandler } from './actions/subscription-detail-action';
import { addCommandHandler } from './commands/add-command';
import { helpCommandHandler } from './commands/help-command';
import { listCommandHandler } from './commands/list-command';
import { startCommandHandler } from './commands/start-command';
import { Action, ActionContext, Command, CommandContext, Triggers } from './types';

export const commands: Record<Command, (ctx: CommandContext) => Promise<void> | void> = {
    [Command.Start]: startCommandHandler,
    [Command.Help]: helpCommandHandler,
    [Command.List]: listCommandHandler,
    [Command.Add]: addCommandHandler,
};

export const actions: Record<Action, { trigger: Triggers; handler: (ctx: ActionContext) => Promise<void> | void }> = {
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
