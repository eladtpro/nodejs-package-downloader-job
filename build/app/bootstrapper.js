"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
const adapter_1 = require("./db/adapter");
class Bootstrapper {
    static async bootstrap() {
        process
            .on('unhandledRejection', (reason, p) => {
            console.error(reason, 'Unhandled Rejection at Promise', p);
        })
            .on('uncaughtException', err => {
            console.error(err, 'Uncaught Exception thrown');
            process.exit(1);
        });
        const cfg = configuration_1.Configuration.init();
        console.log(cfg);
        await adapter_1.Adapter.createIfNotExists();
    }
}
exports.Bootstrapper = Bootstrapper;
//# sourceMappingURL=bootstrapper.js.map