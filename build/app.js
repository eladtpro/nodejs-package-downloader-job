"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import './app/global';
const bootstrapper_1 = require("./app/bootstrapper");
const configuration_1 = require("./app/configuration");
const adapter_1 = require("./app/db/adapter");
const npm_downloader_1 = require("./app/downloaders/npm-downloader");
const request_status_1 = require("./app/models/request-status");
class App {
    get adapter() {
        if (!this._adapter)
            this._adapter = new adapter_1.Adapter(configuration_1.Configuration.current.cosmos);
        return this._adapter;
    }
    execute() {
        this.adapter.fetch(request_status_1.RequestStatus.Pending, { maxItemCount: 10 }).then(result => {
            const downloader = new npm_downloader_1.NpmDownloader(configuration_1.Configuration.current.verdaccio);
            downloader.download(result.resources, configuration_1.Configuration.current.downloadLocation);
            console.log(result);
        });
    }
}
exports.default = App;
bootstrapper_1.Bootstrapper.bootstrap()
    .then(() => {
    const app = new App();
    app.execute();
}).catch(e => console.log(e));
//# sourceMappingURL=app.js.map