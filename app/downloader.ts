import { PathLike  } from 'fs';
import { PackageType } from './models/package-type';
import { Request } from './models/request';

export interface Downloader {
    packageType: PackageType;
    /**
     * Asynchronous download - download and possibly create a file.
     * @param request A Request definition object. The `request.Package.Type` property must match current downloader packageType.
     */
    download(request: Request[], target: PathLike): void;
}
