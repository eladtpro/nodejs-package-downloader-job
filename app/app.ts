import { Bootstrapper } from './bootstrap/bootstrapper';
import { Configuration } from './bootstrap/configuration';
import { Adapter } from './db/adapter';
import { NpmDownloader } from './downloaders/npm-downloader';
import { Package } from './models/package';
import { RequestStatus } from './models/request-status';

export default class App {
  private _adapter: Adapter | undefined;
  get adapter(): Adapter {
    if (!this._adapter)
      this._adapter = new Adapter(Configuration.current.cosmos);
    return this._adapter;
  }

  execute() {
    this.adapter.fetch(RequestStatus.Pending, { maxItemCount: 10 }).then(result => {
      const downloader: NpmDownloader = new NpmDownloader(Configuration.current.verdaccio, Configuration.current.npmsApi);
      result.resources.forEach(r => r.package = new Package(r.package.name, r.package.version));
      // downloader.download(result.resources, Configuration.current.downloadLocation);
      downloader.download([result.resources[0]], Configuration.current.downloadLocation);
      console.log(result);
    });
  }
}

Bootstrapper.bootstrap()
  .then(() => {
    const app = new App();
    app.execute();
  }).catch(e => console.log(e));
