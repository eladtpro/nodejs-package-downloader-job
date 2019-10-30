import { DistributionType } from './distribution-type';
import { Package } from './package';
import { RequestStatus } from './request-status';

export interface Request {
  key: string;
  user: string;
  email: string;
  package: Package;
  submittedOn: Date;
  status: RequestStatus;
  statusChangedOn: Date | undefined;
  distribution: DistributionType | undefined;
}
