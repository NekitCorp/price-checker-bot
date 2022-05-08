# 💲 Price checker telegram bot

Телеграм бот для отслеживания изменения цен на определенные товары в магазинах.

## Разработка

Для локальной разработки необходимо:

1. [Запустить YDB в Docker](https://cloud.yandex.ru/docs/ydb/getting_started/self_hosted/ydb_docker)

```sh
docker pull cr.yandex/yc/yandex-docker-local-ydb:latest
docker run -d --rm --name ydb-local -h localhost \
  -p 2135:2135 -p 8765:8765 -p 2136:2136 \
  -v $(pwd)/ydb_certs:/ydb_certs -v $(pwd)/ydb_data:/ydb_data \
  -e YDB_DEFAULT_LOG_LEVEL=NOTICE \
  -e GRPC_TLS_PORT=2135 -e GRPC_PORT=2136 -e MON_PORT=8765 -e YDB_USE_IN_MEMORY_PDISKS=true \
  cr.yandex/yc/yandex-docker-local-ydb:latest
```

2. Выполнить скрипт миграции `database/migrate.sql` в [YDB UI](http://localhost:8765/)
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

## Инициализация Yandex Cloud

> Инициализация проводится 1 раз при создании проекта, либо при переезде проекта в другой каталог облака. Для разработки в уже развернутом проекта данный пункт выполнять не нужно.

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
6. Создать триггер внутри функции `price-checker-bot-function`
    - Имя: `price-checker-bot-trigger`
    - Тип: `Таймер`
    - Cron-выражение: `0 10 ? * * *`
    - Функция: `price-checker-bot-function`
    - Сервисный аккаунт: `price-checker-bot-sa`
