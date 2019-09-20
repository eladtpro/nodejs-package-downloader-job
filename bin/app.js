"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./app/configuration");
var request_status_1 = require("./app/models/request-status");
var adapter_1 = require("./app/db/adapter");
var App = /** @class */ (function () {
    function App() {
        this.adapter = new adapter_1.default(configuration_1.default.current.cosmos);
        this.adapter.createIfNotExists();
        process
            .on('unhandledRejection', function (reason, p) {
            console.error(reason, 'Unhandled Rejection at Promise', p);
        })
            .on('uncaughtException', function (err) {
            console.error(err, 'Uncaught Exception thrown');
            process.exit(1);
        });
    }
    App.prototype.execute = function () {
        this.adapter.fetch(request_status_1.RequestStatus.Pending, { maxItemCount: 10 }).then(function (result) {
            console.log(result);
        });
    };
    return App;
}());
exports.default = App;
String.prototype.startsWith = function (suffix) {
    return this.indexOf(suffix, 0) !== -1;
};
var app = new App();
app.execute();
//# sourceMappingURL=app.js.map