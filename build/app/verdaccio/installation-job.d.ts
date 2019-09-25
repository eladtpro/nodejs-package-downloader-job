import { Request } from '../models/request';
import { ExtendedError } from '../utils/extended-error';
import { InstallationStatus } from './installation-status';
export declare class InstallationJob {
    constructor(requests: Request[]);
    readonly started: Date;
    readonly requests: Request[];
    readonly statuses: Map<string, InstallationStatus>;
    readonly errors: ExtendedError[];
    modified: Date;
    readonly completed: boolean;
    toString: () => string;
}
