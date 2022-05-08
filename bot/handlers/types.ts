import { Context, NarrowedContext } from 'telegraf';
import { Triggers as TelegrafTriggers } from 'telegraf/typings/composer';
import { Update } from 'telegraf/typings/core/types/typegram';
import { MessageSubType, MountMap, UpdateType } from 'telegraf/typings/telegram-types';

export enum Command {
    Start = 'start',
    Help = 'help',
    List = 'list',
    Add = 'add',
}

export enum Action {
    SubscriptionDetail = 'subscription-detail',
    List = 'list',
    Remove = 'remove',
}

/** Takes: a context type and an update type (or message subtype).
    Produces: a context that has some properties required, and some undefined.
    The required ones are those that are always present when the given update (or message) arrives.
    The undefined ones are those that are always absent when the given update (or message) arrives. */
type MatchedContext<C extends Context, T extends UpdateType | MessageSubType> = NarrowedContext<C, MountMap[T]>;

export type CommandContext = MatchedContext<Context<Update>, 'text'>;
export type ActionContext = MatchedContext<Context<Update> & { match: RegExpExecArray }, 'callback_query'>;
export type Triggers = TelegrafTriggers<Context<Update>>;
