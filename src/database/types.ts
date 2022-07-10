import { Session } from 'ydb-sdk';

export type IDbDriver = {
    withSession<T>(callback: (session: Session) => Promise<T>): Promise<T>;
};
