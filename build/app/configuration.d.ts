/// <reference types="node" />
import { CosmosClientOptions } from '@azure/cosmos';
import { Config } from '@verdaccio/types';
import { PathLike } from 'fs';
import { Url } from 'url';
export interface CosmosConfiguration extends CosmosClientOptions {
    database: string;
    container?: string;
}
export interface VerdaccioConfiguration {
    maxUptimeSec: number;
    workingDir: PathLike;
    installTimeout: number;
    serverConfig: Config;
    serverConfigPath: PathLike;
    serverVersion: string;
    serverTitle: string;
    url: Url;
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
