# Price checker telegram bot

Телеграм бот для отслеживания изменения цен на определенные товары в магазинах.

## Разработка

Для локальной разработки необходимо:

1. [Запустить YDB в Docker](https://cloud.yandex.ru/docs/ydb/getting_started/self_hosted/ydb_docker)

```sh
docker pull cr.yandex/yc/yandex-docker-local-ydb:latest
docker run -d --rm --name ydb-local -h localhost \
  -p 2135:2135 -p 8765:8765 -p 2136:2136 \
  -e GRPC_TLS_PORT=2135 -e GRPC_PORT=2136 -e MON_PORT=8765 -e YDB_USE_IN_MEMORY_PDISKS=true \
  cr.yandex/yc/yandex-docker-local-ydb:latest
```

2. Выполнить скрипт миграции `database/migrate.sql` в [YDB UI](http://localhost:8765/) или с помощью `ydb-cli`:

```sh
ydb -e grpc://localhost:2136 -d /local yql -f ./src/database/migrate.sql
```

3. Создать `.env.local` в корне проекта с заполненными переменными окружения из `.env`
4. [`optional`] Мигрировать тестовые данные

```sh
npm run migrate-test-data
```

5. Запустить телеграм-бота

```sh
npm run start-bot
```

6. [`optional`] Имитировать ежедневный триггер

```sh
npm run trigger
```

## Инициализация

> Инициализация проводится 1 раз при создании проекта, либо при переезде проекта в другой каталог облака. Для разработки в уже развернутом проекта данный пункт выполнять не нужно.

### Инициализация Yandex Cloud

1. Создать каталог в [консоли Yandex Cloud](https://console.cloud.yandex.ru/cloud)
    - Имя: `price-checker-bot`
2. Создать сервисный аккаунт
    - Имя: `price-checker-bot-sa`
    - Роль: `editor`
3. Создать `Yandex Database`
    - Имя: `price-checker-bot-ydb`
    - Тип базы данных: `Serverless`
4. Выполнить скрипт миграции `database/migrate.sql` в консоли `price-checker-bot-ydb`
5. Создать `Cloud Function`
    - Имя: `price-checker-bot-function`
6. Сделать функцию `price-checker-bot-function` публичной
7. Создать триггер внутри функции `price-checker-bot-function`
    - Имя: `price-checker-bot-trigger`
    - Тип: `Таймер`
    - Cron-выражение: `0 7 ? * * *` ([Формат cron-выражения](https://cloud.yandex.ru/docs/functions/concepts/trigger/timer#cron-expression))
    - Функция: `price-checker-bot-function`
    - Сервисный аккаунт: `price-checker-bot-sa`

### Инициализация GitHub

Добавить `Actions secrets`:

| Secret               | Description                                                                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BOT_TOKEN`          | Токен, который был получен от `BotFather` при создании бота.                                                                                                                                        |
| `CLOUD_FUNCTION_ID`  | Идентификатор функции `price-checker-bot-function`.                                                                                                                                                 |
| `OAUTH_TOKEN`        | Получите OAuth-токен в сервисе Яндекс.OAuth. Для этого перейдите по [ссылке](https://oauth.yandex.ru/authorize?response_type=token&client_id=1a6990aa636648e9b2ef855fa7bec2fb) и нажмите Разрешить. |
| `SERVICE_ACCOUNT_ID` | Идентификатор сервисного аккаунта `price-checker-bot-sa`.                                                                                                                                           |
| `YDB_DATABASE`       | Размещение базы данных `price-checker-bot-ydb`.                                                                                                                                                     |
| `YDB_ENDPOINT`       | Эндпоинт `price-checker-bot-ydb`.                                                                                                                                                                   |
| `ADMIN_CHAT_ID`      | Идентификатор телеграм чата администратора для сбора ошибок.                                                                                                                                        |

### Инициализация Telegram

1. Создаем бота у [BotFather](https://t.me/BotFather)
2. Переходим по ссылке `https://api.telegram.org/bot{my_bot_token}/setWebhook?url={url_to_send_updates_to}` для установки webhook'а, где:
    - `my_bot_token`: токен, который был получен от `BotFather` при создании бота
    - `url_to_send_updates_to`: ссылка для вызова функции `price-checker-bot-function`
