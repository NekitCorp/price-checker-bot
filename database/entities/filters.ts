import { declareType, snakeToCamelCaseConversion, TypedData, Types, withTypeOptions } from 'ydb-sdk';

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class DateFilter extends TypedData {
    @declareType(Types.DATETIME)
    public from: Date;

    @declareType(Types.DATETIME)
    public to: Date;

    constructor(data: { from: Date; to: Date }) {
        super(data);
        this.from = data.from;
        this.to = data.to;
    }
}
