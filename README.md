# 🤖🏷️ Price checker telegram bot

Telegram bot to track price changes for certain goods in stores.

## 👨‍💻 Development

For local development you need:

1. [Running YDB in Docker](https://ydb.tech/en/docs/getting_started/self_hosted/ydb_docker)

```sh
docker pull cr.yandex/yc/yandex-docker-local-ydb:latest
docker run -d --rm --name ydb-local -h localhost \
  -p 2135:2135 -p 8765:8765 -p 2136:2136 \
  -e GRPC_TLS_PORT=2135 -e GRPC_PORT=2136 -e MON_PORT=8765 -e YDB_USE_IN_MEMORY_PDISKS=true \
  cr.yandex/yc/yandex-docker-local-ydb:latest
```

2. Run migration script [migrate.sql](src/modules/database/migrate.sql) in [YDB UI](http://localhost:8765/) or by using [ydb-cli](https://ydb.tech/en/docs/reference/ydb-cli/)

```sh
ydb -e grpc://localhost:2136 -d /local yql -f ./src/modules/database/migrate.sql
```

3. Create `.env.local` at the root of the project with environment variables filled in from `.env`
4. Use test commands for development

```sh
# Migrate test data
npm run dev:migrate-test-data
# State telegram bot
npm run dev:start-bot
# Simulate daily trigger
npm run dev:trigger
# Launching store data provider
npm run dev:store-provider
# Price chart generation
npm run dev:chart
```

## 🚀 Initialization

### Yandex Cloud initialization

> Initialization is carried out 1 time when creating a project, or when moving a project to another cloud directory. For development in an already deployed project, this item is not necessary.

1. Create folder in [Yandex Cloud console](https://console.cloud.yandex.ru/cloud)
    - Name: `price-checker-bot`
2. Create service account
    - Name: `price-checker-bot-sa`
    - Role: `editor`
3. Create `Yandex Database`
    - Name: `price-checker-bot-ydb`
    - Database type: `Serverless`
4. Run migration script `database/migrate.sql` in `price-checker-bot-ydb` console
5. Create `Cloud Function`
    - Name: `price-checker-bot-function`
6. Make the `price-checker-bot-function` function public
7. Create a trigger inside function `price-checker-bot-function`
    - Name: `price-checker-bot-trigger`
    - Type: `Timer`
    - Cron-expression: `0 7 ? * * *` ([cron-expression format](https://cloud.yandex.com/en/docs/functions/concepts/trigger/timer#cron-expression))
    - Function: `price-checker-bot-function`
    - Service account: `price-checker-bot-sa`

### GitHub initialization

Add `Actions secrets`:

| Secret                   | Description                                                                                                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `YC_SA_JSON_CREDENTIALS` | Must contain JSON with the authorized key for the service account. More details at [Yandex Cloud IAM documentation](https://cloud.yandex.com/en/docs/container-registry/operations/authentication#sa-json). |
| `YC_FOLDER_ID`           | Folder ID `price-checker-bot`.                                                                                                                                                                              |
| `YC_SERVICE_ACCOUNT_ID`  | Service account ID `price-checker-bot-sa`.                                                                                                                                                                  |
| `YDB_DATABASE`           | YDB location `price-checker-bot-ydb`.                                                                                                                                                                       |
| `YDB_ENDPOINT`           | YDB endpoint `price-checker-bot-ydb`.                                                                                                                                                                       |
| `TG_BOT_TOKEN`           | Token you got from `BotFather` when you created your Bot.                                                                                                                                                   |
| `TG_ADMIN_CHAT_ID`       | Administrator's telegram chat ID for collecting logs.                                                                                                                                                       |

### Telegram initialization

1. Create a bot using [BotFather](https://t.me/BotFather)
2. Call the `setWebHook` method in the Bot API via the following url `https://api.telegram.org/bot{my_bot_token}/setWebhook?url={url_to_send_updates_to}` where:
    - `my_bot_token` is the token you got from `BotFather` when you created your Bot
    - `url_to_send_updates_to` function `price-checker-bot-function` invoke url
