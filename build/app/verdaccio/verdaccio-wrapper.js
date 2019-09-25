"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
// @ts-ignore
const verdaccio_1 = __importDefault(require("verdaccio"));
const extended_error_1 = require("../utils/extended-error");
require("../utils/string.prototype");
const typed_event_1 = require("../utils/typed-event");
const installation_job_1 = require("./installation-job");
const installation_status_1 = require("./installation-status");
// const ready: symbol = Symbol('ready');
// const completed: symbol = Symbol('completed');
class VerdaccioWrapper /*extends EventEmitter*/ {
    constructor(config) {
        this._busy = false;
        this.ready = new typed_event_1.TypedEvent();
        this.error = new typed_event_1.TypedEvent();
        this.installed = new typed_event_1.TypedEvent();
        this.completed = new typed_event_1.TypedEvent();
        this.config = config;
    }
    get busy() {
        return this._busy;
    }
    install(requests) {
        if (this._busy)
            throw Error(`Installation already in progress. ${this.job}`);
        try {
            this._busy = true;
            this.job = new installation_job_1.InstallationJob(requests);
            // TODO: handle event handlers disposables
            this.installed.on(request => {
                this.job.statuses.set(request.key, installation_status_1.InstallationStatus.completed);
                // EMIT COMPLETE OR TIMEOUT
                if (this.job.completed)
                    this.completed.emit(this.job);
            });
            this.error.on((error) => {
                if (error.data && error.data.key)
                    this.job.statuses.set(error.data.key, installation_status_1.InstallationStatus.faulted);
                this.job.errors.push(error);
            });
            this.ready.once(() => {
                requests.forEach(request => this.installOne(request));
            });
            this.completed.on((job) => {
                console.log(job);
                this._busy = false;
            });
            this.startVerdaccio();
        }
        catch (error) {
            if (this.error)
                this.error.emit(new extended_error_1.ExtendedError({ error }));
            else {
                console.error(error);
                this._busy = false;
            }
        }
    }
    installOne(request) {
        const version = request.package.version ? `@${request.package.version}` : '';
        const packageQDN = `${request.package.name}${version}`;
        const command = `npm install ${packageQDN} --registry ${this.config.url.href}`;
        const install = child_process_1.spawn('npm', ['install', packageQDN, '--registry', this.config.url.href], { shell: true, cwd: this.config.workingDir.toString(), timeout: this.config.installTimeout });
        install.on('exit', (code, signal) => {
            if (code && 0 !== code)
                this.error.emit(new extended_error_1.ExtendedError({ key: request.key, message: `Unknown error code ${code} - ${signal} for command '${command}'` }));
            else
                this.installed.emit(request);
        });
        install.stderr.on('data', (error) => {
            console.error(error.toString());
            this.error.emit(new extended_error_1.ExtendedError({ key: request.key, message: error.toString() }));
        });
        install.stdout.on('data', (chunk) => {
            console.info(chunk.toString());
            const message = chunk.toString();
            if (message && message.toString().startsWith(`+ ${packageQDN}`)) {
                this.installed.emit(request);
                install.kill('SIGSTOP');
            }
        });
        return install;
    }
    startVerdaccio() {
        verdaccio_1.default(this.config.serverConfig, undefined, this.config.serverConfigPath, this.config.serverVersion, this.config.serverTitle, (webServer, addrs, name, version) => {
            console.log('Verdaccio server created', webServer, addrs, name, version);
            webServer.on('error', (err) => {
                console.error(err);
                this.error.emit(new extended_error_1.ExtendedError({ error: err }));
            });
            webServer.listen(+this.config.url.port, /*this.config.url.host,*/ () => {
                console.log('verdaccio running');
                this.ready.emit();
            });
            this.completed.on(() => webServer.close());
        });
    }
}
exports.VerdaccioWrapper = VerdaccioWrapper;
//# sourceMappingURL=verdaccio-wrapper.js.map