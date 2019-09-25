"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const url_1 = require("url");
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
        const path = path_1.join(process.cwd(), process.env.VERDACCIO_CONFIG_FILE_NAME);
        const yamlConfig = js_yaml_1.safeLoad(fs_1.readFileSync(path, 'utf8'));
        const yamlUrl = url_1.parse(yamlConfig.listen.toString(), false, true);
        cfg._verdaccio = {
            workingDir: path_1.join(process.cwd(), yamlConfig.self_path),
            maxUptimeSec: +process.env.VERDACCIO_MAX_UPTIME_SEC,
            installTimeout: +process.env.VERDACCIO_INSTALL_TIMEOUT_SEC,
            serverVersion: '1.0.0',
            serverTitle: 'Verdaccio Orca',
            serverConfigPath: path,
            serverConfig: yamlConfig,
            url: yamlUrl
        };
        cfg._downloadLocation = process.env.DEFAULT_DOWNLOAD_DIRECTORY;
        Configuration._current = cfg;
        return cfg;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map