import { Container, ContainerResponse, CosmosClient, Database, FeedOptions, FeedResponse } from '@azure/cosmos';
import { CosmosConfiguration } from '../configuration';
import { Request } from '../models/request';
import { RequestStatus } from '../models/request-status';
export declare class Adapter {
    readonly database: Database;
    readonly container: Container;
    constructor(config: CosmosConfiguration);
    readonly client: CosmosClient;
    readonly config: CosmosConfiguration;
    static createIfNotExists(): Promise<ContainerResponse>;
    fetch(status?: RequestStatus, options?: FeedOptions): Promise<FeedResponse<Request>>;
}
