/// <reference types="node" />
import { PathLike } from 'fs';
import { VerdaccioConfiguration } from '../configuration';
import { Downloader } from '../downloader';
import { PackageType } from '../models/package-type';
import { Request } from '../models/request';
export declare class NpmDownloader implements Downloader {
    constructor(config: VerdaccioConfiguration);
    private verdaccio;
    packageType: PackageType;
    download(requests: Request[], target: PathLike): void;
    private copy;
}
