import { getInternalError } from '@verdaccio/commons-api';
import { Callback, IPluginAuth, Logger } from '@verdaccio/types';


// interface IPluginAuth extends IPlugin {
//     login_url?: string;
//     authenticate(user: string, password: string, cb: Callback): void;
//     adduser(user: string, password: string, cb: Callback): void;
//     allow_access(user: RemoteUser, pkg: $Subtype<PackageAccess>, cb: Callback): void;
//     apiJWTmiddleware(user: RemoteUser, pkg: $Subtype<PackageAccess>, cb: Callback): void;
//     allow_publish(helpers): void;
//   }

// tslint:disable-next-line: no-empty-interface
export interface AnonymousConfig { }

class AnonymousPlugin implements IPluginAuth<AnonymousConfig> {
    constructor(config: AnonymousConfig, opts: { logger: Logger }) {
        this.logger = opts.logger;
    }

    private logger: Logger;

    authenticate(user: string, password: string, cb: Callback): void {
        try {
            this.logger.info(`AnonymousPlugin called - next parameters should be null - user:${user}, password:${password}`);
            cb(null, [user]);
        } catch (error) {
            this.logger.error(`AnonymousPlugin Error:${error}`);
            return cb(getInternalError(error));
        }
    }
}

export default AnonymousPlugin;
