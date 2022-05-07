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
npm start migrate-test-data
```
