import { PackageType } from './package-type';

export class Package {
  constructor(name: string, version?: string) {
    this.name = name;
    this.version = (version) ? version : 'latest';
    this.type = PackageType.npm;
  }

  name!: string;
  version: string | undefined;
  type!: PackageType;

  get qualifiedName(): string {
    return `${this.name}@${this.version}`;
  }

  toString(): string {
    return this.qualifiedName;
  }
}
