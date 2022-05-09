require('dotenv-flow').config();

import { telegramBot } from '../bot/telegram-bot';

async function main() {
    await telegramBot.trigger();
    process.exit();
}

main();
