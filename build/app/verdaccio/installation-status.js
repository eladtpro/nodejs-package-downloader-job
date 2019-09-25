"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstallationStatus;
(function (InstallationStatus) {
    // tslint:disable:no-bitwise
    InstallationStatus[InstallationStatus["idle"] = 0] = "idle";
    InstallationStatus[InstallationStatus["registered"] = 1] = "registered";
    InstallationStatus[InstallationStatus["in_process"] = 2] = "in_process";
    InstallationStatus[InstallationStatus["faulted"] = 4] = "faulted";
    InstallationStatus[InstallationStatus["success"] = 8] = "success";
    InstallationStatus[InstallationStatus["completed"] = 12] = "completed";
    InstallationStatus[InstallationStatus["all"] = 15] = "all"; // 1111
    // tslint:enable:no-bitwise
})(InstallationStatus = exports.InstallationStatus || (exports.InstallationStatus = {}));
//# sourceMappingURL=installation-status.js.map