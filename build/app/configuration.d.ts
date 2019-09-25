/// <reference types="node" />
import { CosmosClientOptions } from '@azure/cosmos';
import { PathLike } from 'fs';
export interface CosmosConfiguration extends CosmosClientOptions {
    database: string;
    container?: string;
}
export interface VerdaccioConfiguration {
    storage: PathLike;
    app: PathLike;
    host: PathLike;
    port: number;
    minUptime: number;
}
export declare class Configuration {
    private static _current;
    private _cosmos;
    private _verdaccio;
    private _downloadLocation;
    static readonly current: Configuration;
    readonly cosmos: CosmosConfiguration;
    readonly verdaccio: VerdaccioConfiguration;
    readonly downloadLocation: PathLike;
    static init(): Configuration;
}
