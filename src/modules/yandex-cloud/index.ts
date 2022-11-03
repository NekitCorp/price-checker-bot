import { IDbDriver } from '../database/types';
import { ILogger } from '../logger/types';
import { ITelegramBot } from '../telegram-bot/types';
import { triggerHandler } from './trigger-handler';
import { ICloudEvent, ICloudResponse, IYandexCloud } from './types';
import { isTriggerEvent } from './utils';

export class YandexCloud implements IYandexCloud {
    constructor(private logger: ILogger, private db: IDbDriver, private bot: ITelegramBot) {}

    public async handler(event: ICloudEvent): Promise<ICloudResponse> {
        this.logger.log(event, { scope: 'CLOUD_EVENT' });

        const isTrigger = isTriggerEvent(event);
        const message = event.body && JSON.parse(event.body);

        if (isTrigger) {
            await triggerHandler(this.bot, this.logger, this.db);
        } else {
            await this.bot.update(message);
        }

        return {
            statusCode: 200,
            body: '',
        };
    }
}
