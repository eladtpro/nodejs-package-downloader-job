// import './app/global';
import { Bootstrapper } from './app/bootstrapper';
import { Configuration } from './app/configuration';
import { Adapter } from './app/db/adapter';
import { NpmDownloader } from './app/downloaders/npm-downloader';
import { RequestStatus } from './app/models/request-status';

export default class App {
  private _adapter: Adapter | undefined;
  get adapter(): Adapter {
    if (!this._adapter)
      this._adapter = new Adapter(Configuration.current.cosmos);
    return this._adapter;
  }

  execute() {
    this.adapter.fetch(RequestStatus.Pending, { maxItemCount: 10 }).then(result => {
      const downloader: NpmDownloader = new NpmDownloader(Configuration.current.verdaccio);
      downloader.download(result.resources, Configuration.current.downloadLocation);
      console.log(result);
    });
  }
}

Bootstrapper.bootstrap()
  .then(() => {
    const app = new App();
    app.execute();
  }).catch(e => console.log(e));
