import 'dotenv-flow/config';
import { DbDriver } from '../src/database';
import { actions, commands, textHandlers } from '../src/handlers';
import { LoggerService } from '../src/logger';
import { TelegramBot } from '../src/telegram-bot';

if (!process.env.BOT_TOKEN) {
    throw new Error('Environment variable `BOT_TOKEN` not provided');
}

if (!process.env.ADMIN_CHAT_ID) {
    throw new Error('Environment variable `ADMIN_CHAT_ID` not provided');
}

if (!process.env.YDB_ENDPOINT) {
    throw new Error('Environment variable `YDB_ENDPOINT` not provided');
}

if (!process.env.YDB_DATABASE) {
    throw new Error('Environment variable `YDB_DATABASE` not provided');
}

const logger = new LoggerService(process.env.ADMIN_CHAT_ID, process.env.BOT_TOKEN);
const dbDriver = new DbDriver(process.env.YDB_ENDPOINT, process.env.YDB_DATABASE);
const telegramBot = new TelegramBot(process.env.BOT_TOKEN, dbDriver, logger);

// register telegram bot handlers
Object.entries(commands).forEach(([command, handler]) => telegramBot.registerCommand(command, handler));
Object.entries(actions).forEach(([action, { trigger, handler }]) =>
    telegramBot.registerAction(action, trigger, handler),
);
textHandlers.forEach((handler) => telegramBot.registerTextHandler(handler));

telegramBot.launch();

// Enable graceful stop
process.once('SIGINT', () => telegramBot.stop('SIGINT'));
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
process.once('SIGHUP', () => telegramBot.stop('SIGHUP'));
