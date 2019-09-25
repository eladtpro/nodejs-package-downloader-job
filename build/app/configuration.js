"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
class Configuration {
    static get current() {
        if (!Configuration._current)
            throw new Error('configuration uninitialized');
        return Configuration._current;
    }
    get cosmos() {
        return this._cosmos;
    }
    get verdaccio() {
        return this._verdaccio;
    }
    get downloadLocation() {
        return this._downloadLocation;
    }
    static init() {
        dotenv_1.config();
        const cfg = new Configuration();
        cfg._cosmos = {
            database: process.env.COSMOS_DATABASE,
            container: process.env.COSMOS_CONTAINER,
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        };
        cfg._verdaccio = {
            storage: process.env.VERDACCIO_STORAGE,
            app: process.env.VERDACCIO_APP,
            host: process.env.VERDACCIO_HOST,
            port: +process.env.VERDACCIO_PORT,
            minUptime: +process.env.VERDACCIO_MIN_UPTIME
        };
        cfg._downloadLocation = process.env.DEFAULT_DOWNLOAD_DIRECTORY;
        Configuration._current = cfg;
        return cfg;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map