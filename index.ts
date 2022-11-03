import { Chart } from './src/modules/chart';
import { DbDriver } from './src/modules/database';
import { Logger } from './src/modules/logger';
import { TelegramBot } from './src/modules/telegram-bot';
import { YandexCloud } from './src/modules/yandex-cloud';

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

// Creating modules
const chart = new Chart();
const logger = new Logger(process.env.TG_ADMIN_CHAT_ID, process.env.TG_BOT_TOKEN);
const db = new DbDriver(process.env.YDB_ENDPOINT, process.env.YDB_DATABASE);
const bot = new TelegramBot(process.env.TG_BOT_TOKEN, { chart, db, logger });
const yandexCloud = new YandexCloud(logger, db, bot);

/**
 * Handler for Yandex Cloud Function
 */
module.exports.handler = yandexCloud.handler;
