import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';
import { DbDriver } from '../db-driver';
import { Store } from './product';
import { ChatId } from './subscription';

export enum State {
    AddProduct = 'add-product',
}

export interface IChatState {
    chatId: ChatId;
    state: State;
    store: Store;
    created: Date;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class ChatState extends TypedData {
    public static TABLE_NAME = 'chat_states';

    @declareType(Types.UINT64)
    public chatId: ChatId;

    @declareType(Types.UTF8)
    public state: State;

    @declareType(Types.UTF8)
    public store: Store;

    @declareType(Types.DATETIME)
    public created: Date;

    static create(data: Pick<IChatState, 'chatId' | 'state' | 'store'>): ChatState {
        return new this({ ...data, created: new Date() });
    }

    constructor(data: IChatState) {
        super(data);
        this.chatId = data.chatId;
        this.state = data.state;
        this.store = data.store;
        this.created = data.created;
    }

    public async insert(driver: DbDriver) {
        return await driver.withSession(async (session) => {
            const query = `
                DECLARE $chatId as Uint64;
                DECLARE $state as Utf8;
                DECLARE $store as Utf8;
                DECLARE $created as Datetime;
            
                INSERT INTO ${ChatState.TABLE_NAME} (chat_id, state, store, created)
                VALUES ($chatId, $state, $store, $created)`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $chatId: this.getTypedValue('chatId'),
                $state: this.getTypedValue('state'),
                $store: this.getTypedValue('store'),
                $created: this.getTypedValue('created'),
            });
        });
    }

    /** Получить состояние текущего чата */
    public static async getChatState(driver: DbDriver, data: Pick<IChatState, 'chatId'>): Promise<ChatState | null> {
        return await driver.withSession(async (session) => {
            const query = `
                SELECT *
                FROM ${ChatState.TABLE_NAME}
                WHERE chat_id = ${data.chatId}
            `;
            const { resultSets } = await session.executeQuery(query);
            const chatStates = ChatState.createNativeObjects(resultSets[0]) as ChatState[];

            return chatStates[0] ? chatStates[0] : null;
        });
    }

    public async remove(driver: DbDriver) {
        await driver.withSession(async (session) => {
            const query = `
                DECLARE $chatId as Uint64;

                DELETE FROM ${ChatState.TABLE_NAME}
                WHERE chat_id = $chatId`;
            const preparedQuery = await session.prepareQuery(query);

            await session.executeQuery(preparedQuery, {
                $chatId: this.getTypedValue('chatId'),
            });
        });
    }
}
