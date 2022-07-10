import { DbDriver } from '../src/database';
import { triggerHandler } from '../src/handlers';
import { LoggerService } from '../src/logger';
import { TelegramBot } from '../src/telegram-bot';

require('dotenv-flow').config();

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

async function main() {
    await triggerHandler(telegramBot, logger, dbDriver);
    process.exit();
}

main();
