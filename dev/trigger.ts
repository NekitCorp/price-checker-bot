import 'dotenv-flow/config';
import { Chart } from '../src/modules/chart';
import { DbDriver } from '../src/modules/database';
import { Logger } from '../src/modules/logger';
import { TelegramBot } from '../src/modules/telegram-bot';
import { triggerHandler } from '../src/modules/yandex-cloud/trigger-handler';

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

const logger = new Logger(process.env.ADMIN_CHAT_ID, process.env.BOT_TOKEN);
const db = new DbDriver(process.env.YDB_ENDPOINT, process.env.YDB_DATABASE);
const chart = new Chart();
const bot = new TelegramBot(process.env.BOT_TOKEN, { db, logger, chart });

async function main() {
    await triggerHandler(bot, logger, db);
    process.exit();
}

main();
