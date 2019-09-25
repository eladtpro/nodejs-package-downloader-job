import { ListenAddress } from '@verdaccio/types';
import { ChildProcess, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Server } from 'http';
// @ts-ignore
import startServer from 'verdaccio';
import { VerdaccioConfiguration } from '../configuration';
import { Request } from '../models/request';
import { ExtendedError } from '../utils/extended-error';
import '../utils/string.prototype';
import { Disposable, TypedEvent } from '../utils/typed-event';
import { InstallationJob } from './installation-job';
import { InstallationStatus } from './installation-status';

// const ready: symbol = Symbol('ready');
// const completed: symbol = Symbol('completed');

export class VerdaccioWrapper /*extends EventEmitter*/ {
    constructor(config: VerdaccioConfiguration) {
        this.config = config;
    }

    private job!: InstallationJob;
    private _busy: boolean = false;
    private readonly ready = new TypedEvent<void>();
    private readonly error = new TypedEvent<ExtendedError>();
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
            this.error.on((error: ExtendedError) => {
                if (error.data && error.data.key)
                    this.job.statuses.set(error.data.key, InstallationStatus.faulted);
                this.job.errors.push(error);
            });
            this.ready.once(() => {
                requests.forEach(request => this.installOne(request));
            });
            this.completed.on((job: InstallationJob) => {
                console.log(job);
                this._busy = false;
            });
            this.startVerdaccio();
        } catch (error) {
            if (this.error)
                this.error.emit(new ExtendedError({ error }));
            else {
                console.error(error);
                this._busy = false;
            }
        }
    }

    private installOne(request: Request) {
        const version = request.package.version ? `@${request.package.version}` : '';
        const packageQDN = `${request.package.name}${version}`;
        const command = `npm install ${packageQDN} --registry ${this.config.url.href}`;
        console.info(command);
        const install = this.spawn(
            'npm',
            ['install', packageQDN, '--registry', this.config.url.href!]);

        install.stderr.on('data', (error: any) => {
            this.error.emit(new ExtendedError({ key: request.key, message: error.toString() }));
            // if (error.toString().contains('npm update check failed'))
            //     console.log('npm i -g npm');
        });
        install.stdout.on('data', (chunk: any) => {
            const message = chunk.toString();
            if (message && message.toString().startsWith(`+ ${packageQDN}`)) {
                this.installed.emit(request);
                install.kill('SIGSTOP');
            }
        });
        install.on('exit', (code: number | null, signal: string | null) => {
            if (code && 0 !== code)
                this.error.emit(new ExtendedError({ key: request.key, message: `Unknown error code ${code} - ${signal} for command '${command}'` }));
            else
                this.installed.emit(request);
        });
    }
    private spawn(command: string, args?: ReadonlyArray<string>): ChildProcessWithoutNullStreams {
        const install = spawn(command, args,
            { shell: true, cwd: this.config.workingDir.toString(), timeout: this.config.installTimeout });
        install.on('exit', (code: number | null, signal: string | null) => {
            console.warn(`spawn exit Unknown error code ${code} - ${signal}`)
        });

        install.stderr.on('data', (error: any) => {
            console.error(error.toString());
        });
        install.stdout.on('data', (chunk: any) => {
            console.info(chunk.toString());
        });

        return install;
    }


    private startVerdaccio(): void {
        startServer(
            this.config.serverConfig, undefined, this.config.serverConfigPath, this.config.serverVersion, this.config.serverTitle,
            (webServer: Server, addrs: ListenAddress, name: string, version: string) => {
                console.log('Verdaccio server created', webServer, addrs, name, version);
                webServer.on('error', (err: Error) => {
                    console.error(err);
                    this.error.emit(new ExtendedError({ error: err }));
                });
                webServer.listen(+this.config.url.port!, /*this.config.url.host,*/() => {
                    console.log('verdaccio running');
                    this.ready.emit();
                });
                this.completed.on(() => webServer.close());
            }
        );
    }
}
