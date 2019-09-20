import { CosmosClient, Container, Database, SqlQuerySpec, FeedOptions, ContainerResponse, FeedResponse } from '@azure/cosmos';
import { CosmosConfiguration } from '../configuration';
import { RequestStatus } from '../models/request-status';
import { Request } from '../models/request';

export default class Adapter {
    readonly client: CosmosClient;
    readonly config: CosmosConfiguration;

    get database(): Database {
        return this.client.database(this.config.database);
    }

    get container(): Container {
        return this.database.container(this.config.container);
    }

    constructor(config: CosmosConfiguration) {
        this.config = config;
        this.client = new CosmosClient(this.config);
        
        this.createIfNotExists();
    }

    async createIfNotExists() : Promise<ContainerResponse> {
        const response = await this.client.databases.createIfNotExists({ id: this.config.database });
        return response.database.containers.createIfNotExists({ id: this.config.container });
    }

    async fetch(status: RequestStatus = RequestStatus.Pending, options: FeedOptions = { maxItemCount: 10 }): 
        Promise<FeedResponse<Request>> {
        const query: SqlQuerySpec = {
            query: `SELECT * FROM ${this.config.container} r WHERE r.status = @status`,
            parameters: [
                { name: '@status', value: status }
            ]
        };

        return this.container.items.query<Request>(query, options).fetchAll();
    }
}