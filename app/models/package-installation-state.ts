import { InstallationStatus } from '../verdaccio/installation-status';
import { Package } from './package';

export class PackageInstallationState {
    constructor(pkg: Package, status: InstallationStatus = InstallationStatus.pending) {
        this.created = new Date();
        this.modified = new Date();
        this.package = pkg;
        this.errors = [];
        this.status = status;
    }

    readonly created: Date;
    modified: Date;
    package: Package;
    status: InstallationStatus;
    errors: Error[];
}
