export interface Data {
    message?: string,
    error?: Error,
    key?: string
}

export class ExtendedError extends Error {
    constructor(data: Data) {
        super(data.message ? data.message : (data.error ? data.error.message : 'Unknown Error'));
        this.data = data;
        if (this.data && this.data.error)
            Object.assign(this, this.data.error);

        this.name = this.constructor.name;
        if (data.message)
            this.message = data.message;

        if (typeof Error.captureStackTrace === 'function')
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error(this.message)).stack;

        const messageLines = (this.message.match(/\n/g) || []).length + 1;
        if (this.stack) {
            this.stack = this.stack.split('\n').slice(0, messageLines + 1).join('\n') + '\n';

            if (this.data && this.data.error)
                this.stack += this.data.error.stack;
        }
    }

    readonly data: Data;
}
