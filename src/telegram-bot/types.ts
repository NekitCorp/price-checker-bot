import { Context, NarrowedContext } from 'telegraf';
import { Triggers as TelegrafTriggers } from 'telegraf/typings/composer';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage, MessageSubType, MountMap, UpdateType } from 'telegraf/typings/telegram-types';
import { ChatState } from '../database/entities/chat-state';
import { ChatId } from '../database/entities/subscription';
import { IDbDriver } from '../database/types';
import { ILoggerService } from '../logger/types';

export type ITelegramBot = {
    launch(): void;
    stop(reason?: string): void;
    sendMessage(chatId: string | number, text: string, extra?: ExtraReplyMessage): Promise<unknown>;
    update(update: Update): Promise<void>;
    registerCommand(command: string, handler: CommandHandler): void;
    registerAction(name: string, triggers: Triggers, handler: ActionHandler): void;
    registerTextHandler(handler: TextHandler): void;
};

export interface MyContext extends Context {
    chatId: ChatId;
    chatState: ChatState | null;
}

/** Takes: a context type and an update type (or message subtype).
    Produces: a context that has some properties required, and some undefined.
    The required ones are those that are always present when the given update (or message) arrives.
    The undefined ones are those that are always absent when the given update (or message) arrives. */
type MatchedContext<C extends Context, T extends UpdateType | MessageSubType> = NarrowedContext<C, MountMap[T]>;

export type CommandContext = MatchedContext<MyContext, 'text'>;
export type ActionContext = MatchedContext<MyContext & { match: RegExpExecArray }, 'callback_query'>;
export type Triggers = TelegrafTriggers<MyContext>;

export type CommandHandler = (props: {
    ctx: CommandContext;
    logger: ILoggerService;
    dbDriver: IDbDriver;
}) => Promise<void> | void;
export type ActionHandler = (props: {
    ctx: ActionContext;
    logger: ILoggerService;
    dbDriver: IDbDriver;
}) => Promise<void> | void;
export type TextHandler = (props: {
    ctx: CommandContext;
    logger: ILoggerService;
    dbDriver: IDbDriver;
}) => Promise<void> | void;
