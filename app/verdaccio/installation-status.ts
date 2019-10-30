export enum InstallationStatus {
    // tslint:disable:no-bitwise
    pending        = 0,
    registered  = 1 << 0, // 00001
    in_process  = 1 << 1, // 00010
    warnings    = 1 << 2, // 00100
    success     = 1 << 3, // 01000
    error       = 1 << 4, // 10000
    completed   = InstallationStatus.success | InstallationStatus.error,
    all = ~(~0 << 4) // 1111
    // tslint:enable:no-bitwise
}
