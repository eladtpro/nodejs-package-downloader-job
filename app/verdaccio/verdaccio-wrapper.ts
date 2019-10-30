import { ListenAddress } from '@verdaccio/types';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Server } from 'http';
// @ts-ignore
import startServer from 'verdaccio';
import { NpmsApiConfiguration, VerdaccioConfiguration } from '../bootstrap/configuration';
import { NpmVersionUpdater } from '../bootstrap/npm-version-updater';
import { Package } from '../models/package';
import { PackageInstallationState } from '../models/package-installation-state';
import { Request } from '../models/request';
import { ExtendedError } from '../utils/extended-error';
import { Disposable, TypedEvent } from '../utils/typed-event';
import { InstallationJob } from './installation-job';
import { InstallationStatus } from './installation-status';

export class VerdaccioWrapper /*extends EventEmitter*/ {
    constructor(config: VerdaccioConfiguration, npmConfig: NpmsApiConfiguration) {
        this.config = config;
        this.npmConfig = npmConfig;
    }

    private job!: InstallationJob;
    private _busy: boolean = false;
    private readonly ready = new TypedEvent<void>();
    private readonly error = new TypedEvent<ExtendedError>();
    private readonly installed = new TypedEvent<PackageInstallationState>();
    private readonly _handlers: Disposable[] = [];
    private readonly npmConfig: NpmsApiConfiguration;
    readonly completed = new TypedEvent<InstallationJob>();
    readonly config: VerdaccioConfiguration;

    get busy() {
        return this._busy;
    }

    set disposable(handler: Disposable) {
        if (this._handlers.indexOf(handler) < 0)
            this._handlers.push(handler);
    }

    install(requests: Request[]) {
        if (this._busy)
            throw Error(`Installation already in progress. ${this.job}`);
        try {
            this._busy = true;
            this.job = new InstallationJob(requests.map(request => request.package));
            this.disposable = this.installed.on(state => {
                this.job.set(state);
                // TODO: EMIT COMPLETE OR TIMEOUT
                this.job.pending.forEach(pkg => this.installOne(pkg));
                if (this.job.completed)
                    this.completed.emit(this.job);
            }),
                this.disposable = this.error.on((error: ExtendedError) => {
                    if (error.data && error.data.key)
                        this.job.update(error.data.key, InstallationStatus.warnings, error);
                    else
                        throw error;
                }),
                this.disposable = this.completed.on((job: InstallationJob) => {
                    try {
                        // tslint:disable-next-line: curly
                        while (this._handlers.length > 0) {
                            try {
                                const dis: Disposable | undefined = this._handlers.shift();
                                if (dis)
                                    dis.dispose();
                            } catch (error) {
                                console.error(error);
                                throw error;
                            }
                        }
                    } finally {
                        this._busy = false;
                    }
                });
            this.ready.once(() => {
                const updater: NpmVersionUpdater = new NpmVersionUpdater(this.config.workingDir, this.npmConfig);
                updater.matchVersions('npm').then(() => {
                    this.job.pending.forEach(pkg => this.installOne(pkg));
                });
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

    private installOne(state: PackageInstallationState): ChildProcessWithoutNullStreams {
        const command = `npm install ${state.package.qualifiedName} --registry ${this.config.url.href}`;
        console.info(command);
        const install = spawn('npm', ['install', state.package.qualifiedName, '--registry', this.config.url.href!],
            { shell: true, cwd: this.config.workingDir.toString(), timeout: this.config.installTimeout });

        this.job.update(state.package.qualifiedName, InstallationStatus.in_process);

        install.stderr.on('data', (chunk: any) => {
            const message = chunk.toString();
            console.error(message);
            state.errors.push(new ExtendedError({ message }));
            state.status = (message && message.startsWith('ERR!')) ? InstallationStatus.error : InstallationStatus.warnings;
            this.installed.emit(state);
            if (InstallationStatus.error === state.status)
                install.kill('SIGTERM');
        }).pipe(process.stderr);

        install.stdout.on('data', (chunk: any) => {
            const message = chunk.toString();
            console.info(message);
            if (message && message.toString().startsWith(`+ ${state.package.qualifiedName}`)) {
                state.status = InstallationStatus.success;
                this.installed.emit(state);
                install.kill('SIGTERM');
            }
        });
        install.on('exit', (code: number | null, signal: string | null) => {
            console.warn(`spawn exit Unknown error code ${code} - ${signal}`);
            if (code && 0 !== code)
                this.error.emit(new ExtendedError({ key: state.package.qualifiedName, message: `Unknown error code ${code} - ${signal} for command '${command}'` }));
        });

        return install;
    }
    private onVerdaccioData(chunk: string): void {
        const template = (substitute: string) => `[^.?!]*(?<=[.?\s!])${substitute}(?=[\s.?!])[^.?!]*[.?!]`;
        try {
            if (chunk.includes('npm update check failed'))
                console.warn('npm i -g npm');
            // execSync('npm install npm', { stdio: 'inherit' });
            else if (chunk.match(template('You must install peer dependencies yourself'))) {
                const start: number = chunk.indexOf('requires a peer of') + 'requires a peer of'.length;
                const end: number = chunk.indexOf('- ', start);
                const dependency = chunk.substring(start, end).trim();

                const parts: string[] = dependency.split('@');

                let name: string = '';
                let version: string | undefined;
                // TODO: refactor
                if (parts.length < 1)
                    throw new Error(`Invalid package name '${dependency}'.`);
                if (parts.length === 1) {
                    name = parts[0];
                    version = 'latest';
                } else if (parts.length > 1) {
                    for (let i = 0; i < parts.length - 1; i++)
                        name += parts[i];
                    version = parts[parts.length - 1];
                }

                this.job.add(new PackageInstallationState(new Package(name, version), InstallationStatus.registered));
            }

        } catch (error) {
            this.error.emit(new ExtendedError({ error }));
        }
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
