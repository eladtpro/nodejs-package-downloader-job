"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var Join_1 = require("../utils/Join");
var util_1 = require("util");
var fs_1 = require("fs");
var package_type_1 = require("../models/package-type");
var verdaccio_wrapper_1 = require("../verdaccio/verdaccio-wrapper");
var NpmDownloader = /** @class */ (function () {
    function NpmDownloader() {
        this.packageType = package_type_1.PackageType.npm;
        this.verdaccio = new verdaccio_wrapper_1.VerdaccioWrapper();
    }
    NpmDownloader.prototype.download = function (requests, target) {
        var _this = this;
        return util_1.promisify(fs_1.lstat)(target).then(function (stat) {
            if (!stat.isDirectory())
                throw new Error("Invalid directory target " + target + ".");
            return new Promise(function (resolve, reject) {
                try {
                    requests.forEach(function (request) { return _this.downloadOne(request, target); });
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    };
    NpmDownloader.prototype.downloadOne = function (request, target) {
        var _this = this;
        if (this.packageType !== request.package.type)
            throw new Error("invalid request.package.type '" + request.package.type + "', should be " + this.packageType + ".");
        var version = request.package.version ? "@" + request.package.version : '';
        var command = "npm install " + request.package.name + version + " --registry http://localhost:4873";
        var child = child_process_1.exec(command);
        this.verdaccio.install(request).then(function () {
            _this.copy(_this.options.storage, target, { move: true, recursive: true })
                .then(resolve)
                .catch(reject);
        })
            .catch(function () {
        });
        return new Promise(function (resolve, reject) {
            child.addListener('error', reject);
            child.addListener('exit', function (code, signal) {
                if (code && 0 != code) {
                    reject({ code: code, signal: signal });
                    return;
                }
                this.copy(this.options.storage, target, { move: true, recursive: true })
                    .then(resolve)
                    .catch(reject);
            });
        });
    };
    NpmDownloader.prototype.copy = function (source, target, options) {
        return new Promise(function (resolve, reject) {
            var _this = this;
            fs_1.readdir(source, { withFileTypes: true }, function (error, files) {
                if (error) {
                    reject(new ExtendedError("'" + source + "' is not a valid directory path. " + error.message, error));
                    return;
                }
                var operations = [];
                var operation = options.move ? util_1.promisify(fs_1.rename) : util_1.promisify(fs_1.copyFile);
                files.forEach(function (dirnet) {
                    var sourcePath = Join_1.join(source.toString(), dirnet.name);
                    var targetPath = Join_1.join(target.toString(), dirnet.name);
                    if (dirnet.isFile())
                        operations.push(operation(sourcePath, targetPath));
                    else if (dirnet.isDirectory()) {
                        operations.push(fs_1.mkdir(targetPath, function () { return _this.copy(sourcePath, targetPath, options); }));
                    }
                    Promise.all(operations).then(function () { return resolve; });
                });
            });
        });
    };
    return NpmDownloader;
}());
exports.NpmDownloader = NpmDownloader;
//# sourceMappingURL=npm-downloader.js.map