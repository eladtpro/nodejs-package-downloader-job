"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const installation_status_1 = require("./installation-status");
class InstallationJob {
    constructor(requests) {
        this.toString = () => {
            return JSON.stringify(this);
        };
        this.started = new Date();
        this.modified = new Date();
        this.statuses = new Map();
        this.errors = new Map();
        this.requests = requests;
        this.requests.forEach(request => {
            this.statuses.set(request.key, installation_status_1.InstallationStatus.registered);
        }, this);
    }
    get completed() {
        this.statuses.forEach(status => {
            // tslint:disable-next-line: no-bitwise
            if (~status & installation_status_1.InstallationStatus.completed)
                return false;
        });
        return true;
    }
}
exports.InstallationJob = InstallationJob;
//# sourceMappingURL=installation-job.js.map