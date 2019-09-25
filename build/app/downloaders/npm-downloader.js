"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const Join_1 = require("../utils/Join");
const package_type_1 = require("../models/package-type");
const verdaccio_wrapper_1 = require("../verdaccio/verdaccio-wrapper");
class NpmDownloader {
    constructor(config) {
        this.packageType = package_type_1.PackageType.npm;
        this.verdaccio = new verdaccio_wrapper_1.VerdaccioWrapper(config);
    }
    download(requests, target) {
        this.verdaccio.completed.on(job => {
            this.copy(this.verdaccio.config.storage, target, { move: true, recursive: true });
        });
        this.verdaccio.install(requests);
    }
    copy(source, target, options) {
        return new Promise((resolve, reject) => {
            fs_1.readdir(source, { withFileTypes: true }, (error, files) => {
                if (error) {
                    reject(new ExtendedError(`'${source}' is not a valid directory path. ${error.message}`, error));
                    return;
                }
                const operations = [];
                const operation = options.move ? util_1.promisify(fs_1.rename) : util_1.promisify(fs_1.copyFile);
                files.forEach((dirnet) => {
                    const sourcePath = Join_1.join(source.toString(), dirnet.name);
                    const targetPath = Join_1.join(target.toString(), dirnet.name);
                    if (dirnet.isFile())
                        operations.push(operation(sourcePath, targetPath));
                    else if (dirnet.isDirectory()) {
                        fs_1.mkdirSync(targetPath); // TODO: make async
                        operations.push(this.copy(sourcePath, targetPath, options));
                    }
                });
                Promise.all(operations).then(() => resolve);
            });
        });
    }
}
exports.NpmDownloader = NpmDownloader;
//# sourceMappingURL=npm-downloader.js.map