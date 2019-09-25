import { ChildProcess, exec, spawn } from 'child_process';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

// import { Monitor } from 'forever-monitor';
// import { EventEmitter } from 'events';
import { VerdaccioConfiguration } from '../configuration';
import { Request } from '../models/request';
import '../utils/string.prototype';
import { Disposable, TypedEvent } from '../utils/typed-event';
import { InstallationJob } from './installation-job';
import { InstallationStatus } from './installation-status';

import { join } from 'path';
import startServer from 'verdaccio';
// import * as verdaccioServer from 'verdaccio-server';

// const ready: symbol = Symbol('ready');
// const completed: symbol = Symbol('completed');

export class VerdaccioWrapper /*extends EventEmitter*/ {
    constructor(config: VerdaccioConfiguration) {
        this.config = config;
    }

    // private verdaccio?: Monitor;
    private job!: InstallationJob;
    private _busy: boolean = false;
    private readonly ready = new TypedEvent<void>();
    private readonly error = new TypedEvent<{ key: string, error: Error }>();
    private readonly installed = new TypedEvent<Request>();
    readonly completed = new TypedEvent<InstallationJob>();
    readonly config: VerdaccioConfiguration;

    get busy() {
        return this._busy;
    }

    install(requests: Request[]) {
        if (this._busy)
            throw Error(`Installation already in progress. ${this.job}`);

        try {
            this._busy = true;
            this.job = new InstallationJob(requests);

            // TODO: handle event handlers disposables
            this.installed.on(request => {
                this.job.statuses.set(request.key, InstallationStatus.completed);

                // EMIT COMPLETE OR TIMEOUT
                if (this.job.completed)
                    this.completed.emit(this.job);
            });
            this.error.on((req: { key: string, error: Error }) => {
                this.job.statuses.set(req.key, InstallationStatus.faulted);
                this.job.errors.set(req.key, req.error);
            });
            this.ready.once(() => {
                // requests.forEach(this.installOne);
                this.installOne(requests[0]);
            });
            this.completed.on(job => {
                this.shutdown();
                // if (this.verdaccio)
                //     this.verdaccio.stop();
            });
            // this.start();
            this.ready.emit();
        } catch (error) {
            console.error(error);
            this._busy = false;
        }
    }

    private async installOne(request: Request): Promise<void> {
        try {
            const version = request.package.version ? `${request.package.version}` : 'latest';
            // const storage = { store: { memory: { limit: 1000 } } };
            const port = 4873;
            const path = join(process.cwd(), 'config.verdaccio.yaml');
            const config = safeLoad(readFileSync(path, 'utf8'));

            startServer(
                config, undefined, path, version, request.package.name,
                (webServer, addrs, pkgName, pkgVersion) => {
                    webServer.listen(port, (err: any) => {
                        if (err)
                            return console.log('something bad happened', err);

                        console.log('verdaccio running');
                    });
                });
        } catch (e) {
            console.log(e);
        }

        // const command = `npm install ${request.package.name}${version} --registry ${this.config.host}:${this.config.port}`;
        // exec(command)
        //     .on('error', (error: Error) => {
        //         this.error.emit({ key: request.key, error });
        //     })
        //     .on('exit', (code: number | null, signal: string | null) => {
        //         if (code && 0 !== code)
        //             this.error.emit({ key: request.key, error: new Error(`Unknown error code ${code}`) });
        //         else
        //             this.installed.emit(request);
        //     });
    }

    // private start(): void {

    // startServer(
    //     {
    //         listen: 'http://localhost:4873/',
    //         server: { keepAliveTimeout: 10 }
    //     }, null, null, '1.0.0', 'bootstrap',
    //     (webServer, addrs, pkgName, pkgVersion) => {
    //         webServer.listen(addr.port || addr.path, addr.host, () => {
    //             console.log('verdaccio running');
    //         });
    //     });

    // verdaccioServer.start();
    // this.verdaccio = new Monitor(['node', this.config.app.toString(), '--listen', this.config.port.toString()], {
    //     max: 1,
    //     silent: true,
    //     killTree: true,
    //     minUptime: this.config.minUptime
    // });
    // this.verdaccio = spawn('node', [this.config.app.toString(), '--listen', this.config.port.toString()], { stdio: 'ignore' });
    // this.verdaccio.on('message', message => {
    //     console.log(message);
    //     if (message.startsWith('warn --- http address -', 0))
    //         this.ready.emit();
    // });
    // this.verdaccio.on('stdout', data => {
    //     console.log(data);
    //     if (data.startsWith('warn --- http address -', 0))
    //         this.ready.emit();
    // });
    // this.verdaccio.on('error', error => {
    //     this._busy = false;
    //     console.error('Forever error occur  ', error);
    // });
    // this.verdaccio.on('stderr', error => {
    //     this._busy = false;
    //     console.error('Forever error occur  ', error);
    // });
    // this.verdaccio.on('exit:code', (code, signal) => {
    //     console.error('Forever detected script exited with code ' + code, signal);
    // });
    // this.verdaccio.on('watch:restart', info => {
    //     console.error('Restarting script because ' + info.file + ' changed');
    // });
    // this.verdaccio.start();
    // }

    private shutdown() {
        this._busy = false;
        // verdaccioServer.stop();
    }
}
