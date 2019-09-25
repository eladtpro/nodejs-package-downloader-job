import { copyFile, Dirent, mkdirSync, PathLike, readdir, rename } from 'fs';
import { promisify } from 'util';
import { VerdaccioConfiguration } from '../configuration';
import { Downloader } from '../downloader';
import { PackageType } from '../models/package-type';
import { Request } from '../models/request';
import { ExtendedError } from '../utils/extended-error';
import { join } from '../utils/Join';
import { VerdaccioWrapper } from '../verdaccio/verdaccio-wrapper';

export class NpmDownloader implements Downloader {
    constructor(config: VerdaccioConfiguration) {
        this.verdaccio = new VerdaccioWrapper(config);
    }
    private verdaccio: VerdaccioWrapper;

    packageType = PackageType.npm;

    download(requests: Request[], target: PathLike): void {
        this.verdaccio.completed.on(job => {
            if (!this.verdaccio.config.serverConfig.storage)
                throw new Error('this.verdaccio.config.serverConfig.storage must be valid directory path');
            this.copy(this.verdaccio.config.serverConfig.storage, target, { move: true, recursive: true });
        });

        this.verdaccio.install(requests);
    }

    private copy(source: PathLike | string, target: PathLike, options: { move: boolean, recursive: boolean }): Promise<void> {
        return new Promise((resolve, reject) => {
            readdir(source, { withFileTypes: true }, (error: NodeJS.ErrnoException | null, files: Dirent[]) => {
                if (error) {
                    reject(new ExtendedError({ message: `'${source}' is not a valid directory path.`, error }));
                    return;
                }

                const operations: Array<Promise<void>> = [];
                const operation = options.move ? promisify(rename) : promisify(copyFile);

                files.forEach((dirnet: Dirent) => {
                    const sourcePath: PathLike = join(source.toString(), dirnet.name);
                    const targetPath: PathLike = join(target.toString(), dirnet.name);

                    if (dirnet.isFile())
                        operations.push(operation(sourcePath, targetPath));
                    else if (dirnet.isDirectory()) {
                        mkdirSync(targetPath); // TODO: make async
                        operations.push(this.copy(sourcePath, targetPath, options));
                    }
                });
                Promise.all(operations).then(() => resolve);
            });
        });
    }
}
