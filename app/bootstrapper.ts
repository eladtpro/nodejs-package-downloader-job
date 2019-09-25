import { Configuration } from './configuration';
import { Adapter } from './db/adapter';

export class Bootstrapper {
    static async bootstrap() {
        process
        .on('unhandledRejection', (reason, p) => {
          console.error(reason, 'Unhandled Rejection at Promise', p);
        })
        .on('uncaughtException', err => {
          console.error(err, 'Uncaught Exception thrown');
          process.exit(1);
        });

        const cfg: Configuration = Configuration.init();
        console.log(cfg);

        await Adapter.createIfNotExists();
    }
}
