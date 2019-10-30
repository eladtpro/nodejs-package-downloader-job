export interface PackageInfo {
    analyzedAt: Date,
    collected:
    {
        metadata: {
            name: string,
            scope: string,
            version: string,
            description: string,
            keywords: string[],
            date: Date,
            author: any
        }
    }
}
