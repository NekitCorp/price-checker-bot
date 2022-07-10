export function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

// https://stackoverflow.com/questions/47632622/typescript-and-filter-boolean
export function truthy<T>(value: T): value is Truthy<T> {
    return Boolean(value);
}

export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;
