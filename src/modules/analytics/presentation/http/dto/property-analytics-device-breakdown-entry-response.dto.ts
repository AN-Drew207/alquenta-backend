import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '../../../domain/enums/device-type.enum';

export class PropertyAnalyticsDeviceBreakdownEntryResponseDto {
  @ApiProperty({ enum: DeviceType })
  deviceType: DeviceType;

  @ApiProperty({
    description:
      'VIEW events recorded with this device type. Computed over VIEW events only — the only event type that ever records a deviceType.',
  })
  count: number;
}
