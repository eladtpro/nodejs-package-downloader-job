"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commons_api_1 = require("@verdaccio/commons-api");
class AnonymousPlugin {
    constructor(config, opts) {
        this.logger = opts.logger;
    }
    authenticate(user, password, cb) {
        try {
            this.logger.info(`AnonymousPlugin called - next parameters should be null - user:${user}, password:${password}`);
            cb(null, [user]);
        }
        catch (error) {
            this.logger.error(`AnonymousPlugin Error:${error}`);
            return cb(commons_api_1.getInternalError(error));
        }
    }
}
exports.default = AnonymousPlugin;
//# sourceMappingURL=anonymous.plugin.js.map