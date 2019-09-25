"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
require("../utils/string.prototype");
const typed_event_1 = require("../utils/typed-event");
const installation_job_1 = require("./installation-job");
const installation_status_1 = require("./installation-status");
const path_1 = require("path");
const verdaccio_1 = __importDefault(require("verdaccio"));
// import * as verdaccioServer from 'verdaccio-server';
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
            this.error.on((req) => {
                this.job.statuses.set(req.key, installation_status_1.InstallationStatus.faulted);
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
        }
        catch (error) {
            console.error(error);
            this._busy = false;
        }
    }
    async installOne(request) {
        try {
            const version = request.package.version ? `${request.package.version}` : 'latest';
            // const storage = { store: { memory: { limit: 1000 } } };
            const port = 4873;
            const path = path_1.join(process.cwd(), 'config.verdaccio.yaml');
            const config = js_yaml_1.safeLoad(fs_1.readFileSync(path, 'utf8'));
            verdaccio_1.default(config, undefined, path, version, request.package.name, (webServer, addrs, pkgName, pkgVersion) => {
                webServer.listen(port, (err) => {
                    if (err)
                        return console.log('something bad happened', err);
                    console.log('verdaccio running');
                });
            });
        }
        catch (e) {
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
    shutdown() {
        this._busy = false;
        // verdaccioServer.stop();
    }
}
exports.VerdaccioWrapper = VerdaccioWrapper;
//# sourceMappingURL=verdaccio-wrapper.js.map