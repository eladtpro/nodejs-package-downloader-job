"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cosmos_1 = require("@azure/cosmos");
var request_status_1 = require("../models/request-status");
var Adapter = /** @class */ (function () {
    function Adapter(config) {
        this.config = config;
        this.client = new cosmos_1.CosmosClient(this.config);
        this.createIfNotExists();
    }
    Object.defineProperty(Adapter.prototype, "database", {
        get: function () {
            return this.client.database(this.config.database);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Adapter.prototype, "container", {
        get: function () {
            return this.database.container(this.config.container);
        },
        enumerable: true,
        configurable: true
    });
    Adapter.prototype.createIfNotExists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.databases.createIfNotExists({ id: this.config.database })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.database.containers.createIfNotExists({ id: this.config.container })];
                }
            });
        });
    };
    Adapter.prototype.fetch = function (status, options) {
        if (status === void 0) { status = request_status_1.RequestStatus.Pending; }
        if (options === void 0) { options = { maxItemCount: 10 }; }
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = {
                    query: "SELECT * FROM " + this.config.container + " r WHERE r.status = @status",
                    parameters: [
                        { name: '@status', value: status }
                    ]
                };
                return [2 /*return*/, this.container.items.query(query, options).fetchAll()];
            });
        });
    };
    return Adapter;
}());
exports.default = Adapter;
//# sourceMappingURL=adapter.js.map