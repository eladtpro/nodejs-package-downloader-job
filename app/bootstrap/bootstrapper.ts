import { Adapter } from '../db/adapter';
import { Configuration } from './configuration';
import { NpmVersionUpdater } from './npm-version-updater';

export class Bootstrapper {
    static async bootstrap() {
        process
        .on('unhandledRejection', (reason, p) => {
          console.error(reason, 'Unhandled Rejection at Promise', p);
        })
        .on('uncaughtException', err => {
          console.error(err, 'Uncaught Exception thrown');
        });

        const cfg: Configuration = Configuration.init();
        // console.log(cfg);

        // check package update verdaccio npm

        await Adapter.createIfNotExists();

        const updater: NpmVersionUpdater  = new NpmVersionUpdater(process.cwd(), Configuration.current.npmsApi);
        await updater.matchVersions('verdaccio');
    }
}
