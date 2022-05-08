import { TelegramBot } from './bot/telegram-bot';
import { ICloudContext, ICloudEvent, isTriggerEvent } from './utils/yandex-cloud';

if (!process.env.BOT_TOKEN) {
    throw new Error('Environment variable `BOT_TOKEN` not provided');
}

const bot = new TelegramBot(process.env.BOT_TOKEN);

/**
 * Handler for Yandex Cloud Function
 */
module.exports.handler = async function (event: ICloudEvent, context: ICloudContext) {
    console.log(`REQUEST: ${JSON.stringify(event)}`);

    const isTrigger = isTriggerEvent(event);
    const message = event.body && JSON.parse(event.body);

    if (isTrigger) {
        await bot.trigger();
    } else {
        await bot.update(message);
    }

    return {
        statusCode: 200,
        body: '',
    };
};
