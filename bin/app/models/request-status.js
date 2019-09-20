"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestStatus;
(function (RequestStatus) {
    RequestStatus[RequestStatus["Unknown"] = 0] = "Unknown";
    RequestStatus[RequestStatus["Pending"] = 1] = "Pending";
    RequestStatus[RequestStatus["InProgress"] = 2] = "InProgress";
    RequestStatus[RequestStatus["Completed"] = 4] = "Completed";
    RequestStatus[RequestStatus["Error"] = 8] = "Error";
})(RequestStatus = exports.RequestStatus || (exports.RequestStatus = {}));
//# sourceMappingURL=request-status.js.map