declare class ExtendedError extends Error {
    constructor(message: string, error: Error);
    readonly original: Error;
}
