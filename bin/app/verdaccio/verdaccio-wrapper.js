"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var child_process_1 = require("child_process");
var ready = Symbol('ready');
var completed = Symbol('completed');
var VerdaccioWrapper = /** @class */ (function (_super) {
    __extends(VerdaccioWrapper, _super);
    function VerdaccioWrapper(config) {
        var _this = _super.call(this) || this;
        _this.config = config;
        return _this;
    }
    VerdaccioWrapper.prototype.on = function (event, listener) {
        return this;
    };
    VerdaccioWrapper.prototype.start = function () {
        var _this = this;
        this.verdaccio = child_process_1.spawn('node', [this.config.app.toString(), '--listen', '4873'], { stdio: 'ignore' });
        this.verdaccio.on('message', function (message) {
            console.log(message);
            if (message && message.indexOf('warn --- http address -', 0) !== -1)
                _this.emit('ready');
        });
    };
    VerdaccioWrapper.prototype.install = function (request) {
        var _this = this;
        var version = request.package.version ? "@" + request.package.version : '';
        var command = "npm install " + request.package.name + version + " --registry http://localhost:4873";
        var child = child_process_1.exec(command);
        return new Promise(function (resolve, reject) {
            child.addListener('error', reject);
            child.on('exit', function (code, signal) {
                if (code && 0 != code) {
                    reject({ code: code, signal: signal });
                    return;
                }
                resolve();
                _this.emit('ready');
            });
        });
    };
    VerdaccioWrapper.prototype.shutdown = function () {
        if (this.verdaccio)
            this.verdaccio.kill();
    };
    return VerdaccioWrapper;
}(events_1.EventEmitter));
exports.VerdaccioWrapper = VerdaccioWrapper;
//# sourceMappingURL=verdaccio-wrapper.js.map