import Configuration from './app/configuration';
import { RequestStatus } from './app/models/request-status';
import Adapter from './app/db/adapter';

export default class App {
    readonly adapter: Adapter;

    constructor() {
        this.adapter = new Adapter(Configuration.current.cosmos);
        this.adapter.createIfNotExists();

        process
        .on('unhandledRejection', (reason, p) => {
          console.error(reason, 'Unhandled Rejection at Promise', p);
        })
        .on('uncaughtException', err => {
          console.error(err, 'Uncaught Exception thrown');
          process.exit(1);
        });
    }

    execute(){
        this.adapter.fetch(RequestStatus.Pending, { maxItemCount: 10 }).then(result => {
            console.log(result);
            
        });

    }
}

String.prototype.startsWith = function(suffix) {
    return this.indexOf(suffix, 0) !== -1;
};

const app = new App();
app.execute();