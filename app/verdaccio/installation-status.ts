export enum InstallationStatus {
    // tslint:disable:no-bitwise
    idle        = 0,
    registered  = 1 << 0, // 0001
    in_process  = 1 << 1, // 0010
    faulted     = 1 << 2, // 0100
    success     = 1 << 3, // 1000
    completed   = InstallationStatus.faulted | InstallationStatus.success, // 1100
    all = ~(~0 << 4) // 1111
    // tslint:enable:no-bitwise
}
