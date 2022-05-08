/**
 * Структура запроса
 * https://cloud.yandex.ru/docs/functions/concepts/function-invoke#request
 */
export type ICloudEvent = {
    httpMethod?: 'GET' | 'POST' | 'DELETE';
    headers?: Record<string, string>;
    url?: string;
    params?: Record<string, string>;
    multiValueParams?: unknown;
    pathParams?: Record<string, string>;
    multiValueHeaders?: unknown;
    queryStringParameters?: Record<string, string>;
    multiValueQueryStringParameters?: Record<string, string[]>;
    requestContext?: unknown;
    body?: string | null;
    isBase64Encoded?: boolean;
    path?: string;
    messages?: {
        event_metadata: {
            event_id: string;
            event_type: string;
            created_at: string;
            cloud_id: string;
            folder_id: string;
        };
        details: {
            trigger_id: string;
        };
    }[];
};

/**
 * Служебные данные
 * https://cloud.yandex.ru/docs/functions/concepts/function-invoke#service-data
 */
export type ICloudContext = {
    awsRequestId: string;
    requestId: string;
    invokedFunctionArn: string;
    functionName: string;
    functionVersion: string;
    memoryLimitInMB: string;
    deadlineMs: number;
    logGroupName: string;
    token: {
        access_token: string;
        expires_in: number;
        token_type: 'Bearer';
    };
};

/**
 * Структура ответа
 * https://cloud.yandex.ru/docs/functions/concepts/function-invoke#response
 */
export type ICloudResponse = {
    statusCode: number;
    headers: Record<string, string>;
    body?: string;
};

/**
 * Проверка на то что сообщение от триггера (таймера)
 * https://cloud.yandex.ru/docs/functions/concepts/trigger/timer#timer-format
 */
export const isTriggerEvent = (event: ICloudEvent) =>
    event?.messages &&
    event.messages[0]?.event_metadata?.event_type === 'yandex.cloud.events.serverless.triggers.TimerMessage';
