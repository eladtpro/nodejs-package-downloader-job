import { Adapter } from './db/adapter';
export default class App {
    private _adapter;
    readonly adapter: Adapter;
    execute(): void;
}
