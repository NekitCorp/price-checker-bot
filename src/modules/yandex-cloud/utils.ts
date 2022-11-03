import { ICloudEvent } from './types';

/**
 * Проверка на то что сообщение от триггера (таймера)
 * https://cloud.yandex.ru/docs/functions/concepts/trigger/timer#timer-format
 */
export const isTriggerEvent = (event: ICloudEvent) =>
    event?.messages &&
    event.messages[0]?.event_metadata?.event_type === 'yandex.cloud.events.serverless.triggers.TimerMessage';

export function escapeMessage(text: string): string {
    return (
        text
            // Bad Request: can't parse entities: Character '(' is reserved and must be escaped with the preceding '\\'
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            // Bad Request: can't parse entities: Character '-' is reserved and must be escaped with the preceding '\\'
            .replace(/-/g, '\\-')
    );
}
