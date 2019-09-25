import { Container, ContainerResponse, CosmosClient, Database, FeedOptions, FeedResponse, SqlQuerySpec } from '@azure/cosmos';
import { Configuration, CosmosConfiguration } from '../configuration';
import { Request } from '../models/request';
import { RequestStatus } from '../models/request-status';

export class Adapter {

    get database(): Database {
        return this.client.database(this.config.database);
    }

    get container(): Container {
        return this.database.container(this.config.container!);
    }

    constructor(config: CosmosConfiguration) {
        this.config = config;
        this.client = new CosmosClient(this.config);
    }
    readonly client: CosmosClient;
    readonly config: CosmosConfiguration;

    static async createIfNotExists(): Promise<ContainerResponse> {
        const adapter: Adapter = new Adapter(Configuration.current.cosmos);
        const response = await adapter.client.databases.createIfNotExists({ id: Configuration.current.cosmos.database });
        return response.database.containers.createIfNotExists({ id: Configuration.current.cosmos.container });
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
