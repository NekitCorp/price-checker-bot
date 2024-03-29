CREATE TABLE products
(
    id Utf8,
    created Datetime,
    name Utf8,
    url Utf8,
    store Utf8,
    PRIMARY KEY (id, store)
);

CREATE TABLE prices
(
    product_id Utf8,
    created Datetime,
    price Uint64,
    PRIMARY KEY (product_id, created)
);

CREATE TABLE subscriptions
(
    product_id Utf8,
    chat_id Uint64,
    created Datetime,
    PRIMARY KEY (product_id, chat_id)
);

CREATE TABLE chat_states
(
    chat_id Uint64,
    state Utf8,
    store Utf8,
    created Datetime,
    PRIMARY KEY (chat_id)
);