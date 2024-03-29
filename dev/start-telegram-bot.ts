import 'dotenv-flow/config';
import { Chart } from '../src/modules/chart';
import { DbDriver } from '../src/modules/database';
import { Logger } from '../src/modules/logger';
import { TelegramBot } from '../src/modules/telegram-bot';

if (!process.env.TG_BOT_TOKEN) {
    throw new Error('Environment variable `TG_BOT_TOKEN` not provided');
}

if (!process.env.TG_ADMIN_CHAT_ID) {
    throw new Error('Environment variable `TG_ADMIN_CHAT_ID` not provided');
}

if (!process.env.YDB_ENDPOINT) {
    throw new Error('Environment variable `YDB_ENDPOINT` not provided');
}

if (!process.env.YDB_DATABASE) {
    throw new Error('Environment variable `YDB_DATABASE` not provided');
}

const chart = new Chart();
const logger = new Logger(process.env.TG_ADMIN_CHAT_ID, process.env.TG_BOT_TOKEN);
const db = new DbDriver(process.env.YDB_ENDPOINT, process.env.YDB_DATABASE);
const bot = new TelegramBot(process.env.TG_BOT_TOKEN, { db, logger, chart });

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.once('SIGHUP', () => bot.stop('SIGHUP'));
