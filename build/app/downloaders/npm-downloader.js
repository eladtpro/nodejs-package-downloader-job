"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const package_type_1 = require("../models/package-type");
const extended_error_1 = require("../utils/extended-error");
const Join_1 = require("../utils/Join");
const verdaccio_wrapper_1 = require("../verdaccio/verdaccio-wrapper");
class NpmDownloader {
    constructor(config) {
        this.packageType = package_type_1.PackageType.npm;
        this.verdaccio = new verdaccio_wrapper_1.VerdaccioWrapper(config);
    }
    download(requests, target) {
        this.verdaccio.completed.on(job => {
            if (!this.verdaccio.config.serverConfig.storage)
                throw new Error('this.verdaccio.config.serverConfig.storage must be valid directory path');
            this.copy(this.verdaccio.config.serverConfig.storage, target, { move: true, recursive: true });
        });
        this.verdaccio.install(requests);
    }
    copy(source, target, options) {
        return new Promise((resolve, reject) => {
            fs_1.readdir(source, { withFileTypes: true }, (error, files) => {
                if (error) {
                    reject(new extended_error_1.ExtendedError({ message: `'${source}' is not a valid directory path.`, error }));
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