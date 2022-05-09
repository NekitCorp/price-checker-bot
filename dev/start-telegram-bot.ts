require('dotenv-flow').config();

import { telegramBot } from '../bot/telegram-bot';

telegramBot.launch();

// Enable graceful stop
process.once('SIGINT', () => telegramBot.stop('SIGINT'));
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
process.once('SIGHUP', () => telegramBot.stop('SIGHUP'));
