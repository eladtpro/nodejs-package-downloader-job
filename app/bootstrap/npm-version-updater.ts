import { execSync } from 'child_process';
import { PathLike, readdir } from 'fs';
import { ClientRequest, IncomingMessage } from 'http';
import { request, RequestOptions } from 'https';
import mkdirp from 'mkdirp';
import { join } from 'path';
import { Package } from '../models/package';
import { PackageType } from '../models/package-type';
import { NpmsApiConfiguration } from './configuration';
import { PackageInfo } from './package-info';
import { ExtendedError } from '../utils/extended-error';

export interface Versions {
    local: Package[];
    online: Package[];
}
export class NpmVersionUpdater {
    constructor(nodeModulesPath: PathLike, config: NpmsApiConfiguration) {
        this.baseUrl = nodeModulesPath;
        this.config = config;
    }

    private readonly baseUrl: PathLike;
    private readonly config: NpmsApiConfiguration;

    async matchVersions(...packageNames: string[]) {
        this.getVersions(...packageNames)
            .then((result: Package[][]) => {
                const versions = { local: result[0], online: result[1] };
                versions.local.forEach((pkg, index) => {
                    const onlinePackage = versions.online.find(p => p.name === pkg.name);
                    if (onlinePackage && pkg.version !== onlinePackage.version)
                        execSync(`npm install ${onlinePackage.name}@${onlinePackage.version}`, { stdio: 'inherit' });
                });
            })
            .catch(reason => {
                console.error(reason);
            });

        // const result: Package[][] = await this.getVersions(...packageNames);
        // const versions = { local: result[0], online: result[1] };
        // versions.local.forEach((pkg, index) => {
        //     const onlinePackage = versions.online.find(p => p.name === pkg.name);
        //     if (onlinePackage && pkg.version !== onlinePackage.version)
        //         execSync(`npm install ${onlinePackage.name}@${onlinePackage.version}`, { stdio: 'inherit' });
        // });
    }

    private async getVersions(...packageNames: string[]): Promise<Package[][]> {
        return Promise.all<Package[]>([
            this.getLocalVersion(...packageNames),
            this.getOnlineVersion(...packageNames)]
        );
    }

    private async getLocalVersion(...packageNames: string[]): Promise<Package[]> {
        return new Promise<Package[]>((resolve, reject) => {
            const packages: Package[] = [];
            const nodeModules = join(this.baseUrl.toString(), 'node_modules');
            mkdirp(nodeModules, (err, made) => {
                if (err)
                    return reject(err);
                readdir(nodeModules, (eErr, dirs) => {
                    if (eErr)
                        return reject(eErr);

                    dirs.filter(d => packageNames.includes(d)).forEach(dir => {
                        try {
                            const file = join(nodeModules, `/${dir}/package.json`);
                            const json = require(file);
                            packages.push(new Package(json.name, json.version));
                        } catch (error) {
                            if (error.code.toString() !== 'MODULE_NOT_FOUND')
                                throw error;
                            packages.push(new Package(dir, '0.0.1'));
                        }
                    });
                    return resolve(packages);
                });
            });
        });
    }

    private async getOnlineVersion(...packageNames: string[]): Promise<Package[]> {
        return new Promise<Package[]>((resolve, reject) => {
            let incoming: string = '';
            const postData = JSON.stringify(packageNames);
            const options: RequestOptions = {
                hostname: this.config.url.hostname,
                port: this.config.url.port || 443,
                path: this.config.url.path,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };

            const clientRequest: ClientRequest = request(options, (response: IncomingMessage) => {
                if (response.statusCode !== 200)
                    throw new ExtendedError({ message: `${response.statusCode}: ${response.statusMessage} - ${this.config.url.href}`, body: response })

                response.on('data', (chunk: any) => {
                    incoming += chunk.toString();
                });
                const packages: Package[] = [];
                response.on('end', () => {

                    const infos: Map<string, PackageInfo> = new Map(Object.entries((JSON.parse(incoming))));
                    Object.keys(infos).forEach(key => {
                        if (!key) return;
                        const info: PackageInfo | undefined = infos.get(key);

                        if (!info) return;
                        packages.push(new Package(info.collected.metadata.name, info.collected.metadata.version));
                    });

                    resolve([...packages]);
                });
            });
            clientRequest.on('error', (error: Error) => {
                reject(error);
            });

            clientRequest.write(postData);
            clientRequest.end();
        });
    }
}
