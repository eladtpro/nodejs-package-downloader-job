export interface Data {
    message?: string;
    error?: Error;
    key?: string;
}
export declare class ExtendedError extends Error {
    constructor(data: Data);
    readonly data: Data;
}
