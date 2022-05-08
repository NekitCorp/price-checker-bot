require('dotenv-flow').config();

import { TelegramBot } from '../bot/telegram-bot';

if (!process.env.BOT_TOKEN) {
    throw new Error('Environment variable `BOT_TOKEN` not provided');
}

const bot = new TelegramBot(process.env.BOT_TOKEN);

async function main() {
    await bot.trigger();
    process.exit();
}

main();
