"use strict";
class ExtendedError extends Error {
    constructor(message, error) {
        super(message);
        Object.assign(this, error);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function')
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error(message)).stack;
        this.original = error;
        const messageLines = (this.message.match(/\n/g) || []).length + 1;
        if (this.stack)
            this.stack = this.stack.split('\n').slice(0, messageLines + 1).join('\n') + '\n' + error.stack;
    }
}
//# sourceMappingURL=extended-error.js.map