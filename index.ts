import { DbDriver } from './src/database';
import { actions, commands, textHandlers, triggerHandler } from './src/handlers';
import { LoggerService } from './src/logger';
import { TelegramBot } from './src/telegram-bot';
import { ICloudContext, ICloudEvent, isTriggerEvent } from './src/utils/yandex-cloud';

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

// register telegram bot handlers
Object.entries(commands).forEach(([command, handler]) => telegramBot.registerCommand(command, handler));
Object.entries(actions).forEach(([action, { trigger, handler }]) =>
    telegramBot.registerAction(action, trigger, handler),
);
textHandlers.forEach((handler) => telegramBot.registerTextHandler(handler));

/**
 * Handler for Yandex Cloud Function
 */
module.exports.handler = async function (event: ICloudEvent, context: ICloudContext) {
    logger.log(event, { scope: 'CLOUD_EVENT' });

    const isTrigger = isTriggerEvent(event);
    const message = event.body && JSON.parse(event.body);

    if (isTrigger) {
        await triggerHandler(telegramBot, logger, dbDriver);
    } else {
        await telegramBot.update(message);
    }

    return {
        statusCode: 200,
        body: '',
    };
};
