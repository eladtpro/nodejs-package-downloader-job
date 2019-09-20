"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
;
;
var Configuration = /** @class */ (function () {
    function Configuration() {
    }
    Object.defineProperty(Configuration, "current", {
        get: function () {
            if (!Configuration._current)
                Configuration._current = Configuration.init();
            return Configuration._current;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "cosmos", {
        get: function () {
            return this._cosmos;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "verdaccio", {
        get: function () {
            return this._verdaccio;
        },
        enumerable: true,
        configurable: true
    });
    Configuration.init = function () {
        dotenv_1.config();
        var cfg = new Configuration();
        cfg._cosmos = {
            database: process.env.COSMOS_DATABASE,
            container: process.env.COSMOS_CONTAINER,
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        };
        cfg._verdaccio = {
            storage: process.env.VERDACCIO_STORAGE,
            app: process.env.VERDACCIO_APP
        };
        return cfg;
    };
    return Configuration;
}());
exports.default = Configuration;
//# sourceMappingURL=configuration.js.map