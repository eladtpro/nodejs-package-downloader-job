import { ChildProcess, exec, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { PathLike } from 'fs';
import { VerdaccioConfiguration } from '../configuration';
import { Request } from '../models/request';
import { TypedEvent } from '../utils/typed-event';

// const ready: symbol = Symbol('ready');
// const completed: symbol = Symbol('completed');
enum InstallationStatus {
    // tslint:disable:no-bitwise
    idle = 0,
    registered = 1 << 0, // 0001
    in_process = 1 << 1, // 0010
    faulted = 1 << 2, // 0100
    success = 1 << 3, // 1000
    completed = InstallationStatus.faulted | InstallationStatus.success, // 1100
    all = ~(~0 << 4) // 1111
    // tslint:enable:no-bitwise
}

interface InstallationJob {
    started: Date;
    modified: Date;
    requests: Request[];
    statuses: { [requestId: string]: [InstallationStatus, Error?] };
}

export class VerdaccioWrapper /*extends EventEmitter*/ {
    constructor(config: VerdaccioConfiguration) {
        this.config = config;
    }

    private readonly config: VerdaccioConfiguration;
    private verdaccio?: ChildProcess;
    private requests: { [key: string]: InstallationResult } = {};

    private readonly ready = new TypedEvent<void>();
    private readonly error = new TypedEvent<{ key: string, error: Error }>();
    private readonly installed = new TypedEvent<Request>();
    readonly completed = new TypedEvent<{ result: InstallationResult[], location: PathLike }>();

    install(requests: Request[]): void {


        // TODO: handle disposables
        requests.forEach(req => {
            this.requests[req.key] = { request: req, status: InstallationStatus.registered };
        });
        this.installed.on(req => {
            this.requests[req.key].status = InstallationStatus.completed;
            // tslint:disable-next-line: no-bitwise
            const left = [...this.requests.values()].filter((stat: InstallationResult) => ~stat.status & InstallationStatus.completed).length;
            if (left < 1)
                this.completed.emit({ result: this.requests.values(), location: this.config.storage });
            // EMIT COMPLETE OR TIMEOUT
        });
        this.error.on((req: { key: string, error: Error }) => {
            this.requests[req.key].status = InstallationStatus.faulted;
            this.requests[req.key].error = req.error;
        });
        this.ready.once(() => {
            requests.forEach(this.installOne);
        });
        this.start();
    }
    private start(): void {
        // TODO: handle already started scenario
        this.verdaccio = spawn('node', [this.config.app.toString(), '--listen', this.config.port.toString()], { stdio: 'ignore' });
        this.verdaccio.on('message', message => {
            console.log(message);
            if (message && message.indexOf('warn --- http address -', 0) !== -1)
                this.ready.emit();
        });
    }

    private installOne(request: Request): void {
        const version = request.package.version ? `@${request.package.version}` : '';
        const command = `npm install ${request.package.name}${version} --registry ${this.config.host}:${this.config.port}`;
        exec(command)
            .on('error', (error: Error) => {
                this.error.emit({ key: request.key, error });
            })
            .on('exit', (code: number | null, signal: string | null) => {
                if (code && 0 !== code)
                    this.error.emit({ key: request.key, error: new Error(`Unknown error code ${code}`) });
                else
                    this.installed.emit(request);
            });
    }

    private shutdown() {
        if (this.verdaccio)
            this.verdaccio.kill();
    }
}
