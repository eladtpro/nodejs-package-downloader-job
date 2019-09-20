import { CosmosClientOptions } from '@azure/cosmos';
import { config } from 'dotenv';
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
}

export default class Configuration {
    private static _current: Configuration;
    private _cosmos!: CosmosConfiguration;
    private _verdaccio!: VerdaccioConfiguration;

    static get current(): Configuration {
        if (!Configuration._current)
            Configuration._current = Configuration.init();

        return Configuration._current;
    }

    get cosmos(): CosmosConfiguration {
        return this._cosmos;
    }

    get verdaccio(): VerdaccioConfiguration {
        return this._verdaccio;
    }

    private static init(): Configuration {
        config();

        const cfg = new Configuration();
        cfg._cosmos = {
            database: process.env.COSMOS_DATABASE!,
            container: process.env.COSMOS_CONTAINER,
            endpoint: process.env.COSMOS_ENDPOINT!,
            key: process.env.COSMOS_KEY
        };

        cfg._verdaccio = {
            storage: process.env.VERDACCIO_STORAGE!,
            app: process.env.VERDACCIO_APP!,
            host: process.env.VERDACCIO_HOST!,
            port: +process.env.VERDACCIO_PORT!
        };

        return cfg;
    }
}
