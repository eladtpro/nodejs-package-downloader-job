import { PackageType } from './package-type';

export class Package {
  name!: string;
  version: string | undefined;
  type!: PackageType;
}
