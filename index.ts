import { telegramBot } from './bot/telegram-bot';
import { logger } from './utils/logger';
import { ICloudContext, ICloudEvent, isTriggerEvent } from './utils/yandex-cloud';

/**
 * Handler for Yandex Cloud Function
 */
module.exports.handler = async function (event: ICloudEvent, context: ICloudContext) {
    logger.log(event, { scope: 'CLOUD_EVENT' });

    const isTrigger = isTriggerEvent(event);
    const message = event.body && JSON.parse(event.body);

    if (isTrigger) {
        await telegramBot.trigger();
    } else {
        await telegramBot.update(message);
    }

    return {
        statusCode: 200,
        body: '',
    };
};
