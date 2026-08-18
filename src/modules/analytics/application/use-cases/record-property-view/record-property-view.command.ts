import { DeviceType } from '../../../domain/enums/device-type.enum';

export class RecordPropertyViewCommand {
  constructor(
    readonly propertyId: string,
    readonly deviceType: DeviceType,
  ) {}
}
