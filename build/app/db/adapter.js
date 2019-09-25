"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cosmos_1 = require("@azure/cosmos");
const configuration_1 = require("../configuration");
const request_status_1 = require("../models/request-status");
class Adapter {
    constructor(config) {
        this.config = config;
        this.client = new cosmos_1.CosmosClient(this.config);
    }
    get database() {
        return this.client.database(this.config.database);
    }
    get container() {
        return this.database.container(this.config.container);
    }
    static async createIfNotExists() {
        const adapter = new Adapter(configuration_1.Configuration.current.cosmos);
        const response = await adapter.client.databases.createIfNotExists({ id: configuration_1.Configuration.current.cosmos.database });
        return response.database.containers.createIfNotExists({ id: configuration_1.Configuration.current.cosmos.container });
    }
    async fetch(status = request_status_1.RequestStatus.Pending, options = { maxItemCount: 10 }) {
        const query = {
            query: `SELECT * FROM ${this.config.container} r WHERE r.status = @status`,
            parameters: [
                { name: '@status', value: status }
            ]
        };
        return this.container.items.query(query, options).fetchAll();
    }
}
exports.Adapter = Adapter;
//# sourceMappingURL=adapter.js.map