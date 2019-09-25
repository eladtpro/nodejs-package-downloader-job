import { Request } from '../models/request';
import { ExtendedError } from '../utils/extended-error';
import { InstallationStatus } from './installation-status';

export class InstallationJob {
    constructor(requests: Request[]) {
        this.started = new Date();
        this.modified = new Date();
        this.statuses = new Map<string, InstallationStatus>();
        this.errors = [];
        this.requests = requests;

        this.requests.forEach(request => {
            this.statuses.set(request.key, InstallationStatus.registered);
        }, this);
    }

    readonly started: Date;
    readonly requests: Request[];
    readonly statuses: Map<string, InstallationStatus>;
    readonly errors: ExtendedError[];
    modified: Date;

    get completed(): boolean {
        [...this.statuses.values()].forEach(status => {
            // tslint:disable-next-line: no-bitwise
            if (~status & InstallationStatus.completed)
                return false;
        });
        return true;
    }

    toString = () => {
        return JSON.stringify(this);
    }
}
