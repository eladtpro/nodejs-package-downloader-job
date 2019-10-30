import { Package } from '../models/package';
import { PackageInstallationState } from '../models/package-installation-state';
import { InstallationStatus } from './installation-status';

export class InstallationJob {
    constructor(packages: Package[]) {
        this.started = new Date();
        this._packages = new Map<string, PackageInstallationState>();
        packages.forEach(pkg => {
            this.add(new PackageInstallationState(pkg, InstallationStatus.registered));
        }, this);
    }

    private readonly _packages: Map<string, PackageInstallationState>;
    readonly started: Date;

    get modified(): Date {
        // To find the maximum modified value of the objects in this._packages.values():
        return new Date(Math.max.apply(this, [...this._packages.values()].map(p => p.modified.getMilliseconds())));
    }

    get pending(): PackageInstallationState[] {
        const pending: PackageInstallationState[] = [];
        for (const [qualifiedName, state] of this._packages)
            // tslint:disable-next-line: no-bitwise
            if (state.status & InstallationStatus.registered)
                pending.push(state);
        return pending;
    }

    get completed(): boolean {
        for (const state of this._packages.values())
            // tslint:disable-next-line: no-bitwise
            if (~state.status & InstallationStatus.success | InstallationStatus.error)
                return false;
        return true;
    }

    add(state: PackageInstallationState) {
        const existing: PackageInstallationState | undefined = this._packages.get(state.package.qualifiedName);
        if (existing)
            return;
        this._packages.set(state.package.qualifiedName, state);
    }

    set(state: PackageInstallationState): void {
        state.modified = new Date();
        this._packages.set(state.package.qualifiedName, state);
    }

    update(qualifiedName: string, status: InstallationStatus, error?: Error): void {
        const state = this._packages.get(qualifiedName);
        if (!state)
            throw Error(`${qualifiedName} not registered - use add before set.`);

        state.modified = new Date();
        state.status = status;
        if (error)
            state.errors.push(error);
    }

    toString = () => {
        return JSON.stringify(this._packages.values());
    }
}
