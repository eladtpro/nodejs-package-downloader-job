"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrapper_1 = require("./bootstrap/bootstrapper");
const configuration_1 = require("./bootstrap/configuration");
const adapter_1 = require("./db/adapter");
const npm_downloader_1 = require("./downloaders/npm-downloader");
const package_1 = require("./models/package");
const request_status_1 = require("./models/request-status");
class App {
    get adapter() {
        if (!this._adapter)
            this._adapter = new adapter_1.Adapter(configuration_1.Configuration.current.cosmos);
        return this._adapter;
    }
    execute() {
        this.adapter.fetch(request_status_1.RequestStatus.Pending, { maxItemCount: 10 }).then(result => {
            const downloader = new npm_downloader_1.NpmDownloader(configuration_1.Configuration.current.verdaccio, configuration_1.Configuration.current.npmsApi);
            result.resources.forEach(r => r.package = new package_1.Package(r.package.name, r.package.version));
            // downloader.download(result.resources, Configuration.current.downloadLocation);
            downloader.download([result.resources[0]], configuration_1.Configuration.current.downloadLocation);
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