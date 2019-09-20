import { copyFile, Dirent, lstat, mkdir, PathLike, readdir, rename } from 'fs';
import { promisify } from 'util';
import { join } from '../utils/Join';

import { VerdaccioConfiguration } from '../configuration';
import { Downloader } from '../downloader';
import { PackageType } from '../models/package-type';
import { Request } from '../models/request';
import { VerdaccioWrapper } from '../verdaccio/verdaccio-wrapper';

export class NpmDownloader implements Downloader {
    constructor(config: VerdaccioConfiguration) {
        this.verdaccio = new VerdaccioWrapper(config);
    }
    private verdaccio: VerdaccioWrapper;

    packageType = PackageType.npm;

    download(requests: Request[], target: PathLike): Promise<void> {
        this.verdaccio.completed.on()

        return promisify(lstat)(target).then((stat) => {
            if (!stat.isDirectory())
                throw new Error(`Invalid directory target ${target}.`);
            return new Promise((resolve, reject) => {
                try {
                    requests.forEach((request) => this.downloadOne(request, target));
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    }



    private downloadOne(request: Request, target: PathLike): Promise<void> {
        if (this.packageType !== request.package.type)
            throw new Error(`invalid request.package.type '${request.package.type}', should be ${this.packageType}.`);

        this.verdaccio.install(request).then(() => {
            this.copy(this.config.storage, target, { move: true, recursive: true })
            .then(resolve)
            .catch(reject);
        })
        .catch(() => {

        });

        return new Promise(function(resolve, reject) {
            child.addListener('error', reject);
            child.addListener('exit', function(code: number | null, signal: string | null) {
                if (code && 0 != code) {
                    reject({ code, signal });
                    return;
                }
                this.copy(this.options.storage, target, { move: true, recursive: true })
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    private copy(source: PathLike, target: PathLike, options: { move: boolean, recursive: boolean }): Promise<void> {
        return new Promise(function(resolve, reject) {
            readdir(source, { withFileTypes: true }, (error: NodeJS.ErrnoException, files: Dirent[]) => {
                if (error) {
                    reject(new ExtendedError(`'${source}' is not a valid directory path. ${error.message}`, error));
                    return;
                }

                const operations = [];
                const operation = options.move ? promisify<void>(rename) : promisify<void>(copyFile);

                files.forEach((dirnet: Dirent) => {
                    const sourcePath: PathLike = join(source.toString(), dirnet.name);
                    const targetPath: PathLike = join(target.toString(), dirnet.name);

                    if (dirnet.isFile())
                        operations.push(operation(sourcePath, targetPath));
                    else if (dirnet.isDirectory()) {
                        operations.push(mkdir(targetPath, () => this.copy(sourcePath, targetPath, options)));
                    }
                    Promise.all(operations).then(() => resolve);
                });
            });
        });
    }
}
