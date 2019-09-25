import { Request } from '../models/request';
import { InstallationStatus } from './installation-status';
export declare class InstallationJob {
    constructor(requests: Request[]);
    readonly started: Date;
    readonly requests: Request[];
    readonly statuses: Map<string, InstallationStatus>;
    readonly errors: Map<string, Error>;
    modified: Date;
    readonly completed: boolean;
    toString: () => string;
}
