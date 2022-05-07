require('dotenv-flow').config();

import { TelegramBot } from './telegram-bot';

if (!process.env.BOT_TOKEN) {
    throw new Error('Environment variable `BOT_TOKEN` not provided');
}

const bot = new TelegramBot(process.env.BOT_TOKEN);
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.once('SIGHUP', () => bot.stop('SIGHUP'));
