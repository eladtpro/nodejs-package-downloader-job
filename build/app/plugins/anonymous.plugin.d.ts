import { Callback, IPluginAuth, Logger } from '@verdaccio/types';
export interface AnonymousConfig {
}
declare class AnonymousPlugin implements IPluginAuth<AnonymousConfig> {
    constructor(config: AnonymousConfig, opts: {
        logger: Logger;
    });
    private logger;
    authenticate(user: string, password: string, cb: Callback): void;
}
export default AnonymousPlugin;
