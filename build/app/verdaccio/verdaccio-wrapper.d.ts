import { VerdaccioConfiguration } from '../configuration';
import { Request } from '../models/request';
import '../utils/string.prototype';
import { TypedEvent } from '../utils/typed-event';
import { InstallationJob } from './installation-job';
export declare class VerdaccioWrapper {
    constructor(config: VerdaccioConfiguration);
    private job;
    private _busy;
    private readonly ready;
    private readonly error;
    private readonly installed;
    readonly completed: TypedEvent<InstallationJob>;
    readonly config: VerdaccioConfiguration;
    readonly busy: boolean;
    install(requests: Request[]): void;
    private installOne;
    private shutdown;
}
