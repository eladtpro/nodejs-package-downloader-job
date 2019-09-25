import { Adapter } from './app/db/adapter';
export default class App {
    private _adapter;
    readonly adapter: Adapter;
    execute(): void;
}
