import { PackageType } from "./models/package-type";
import { Request } from './models/request';
import { PathLike  } from 'fs';

export interface Downloader {
    packageType: PackageType;
    /**
     * Asynchronous dowanload(1) - download and possibly create a file.
     * @param request A Requst definition object. The `request.Package.Type` property must match current downloader packageType.
     */
    download(request: Request[], target: PathLike): Promise<void>;
}