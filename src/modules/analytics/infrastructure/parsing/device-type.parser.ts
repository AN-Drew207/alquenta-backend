import { Injectable } from '@nestjs/common';
import { DeviceType } from '../../domain/enums/device-type.enum';

const MOBILE_USER_AGENT_PATTERN = /Mobi|Android|iPhone/i;

/** Best-effort MOBILE/DESKTOP classifier off the raw User-Agent header. */
@Injectable()
export class DeviceTypeParser {
  parse(userAgent: string | string[] | undefined | null): DeviceType {
    const value = Array.isArray(userAgent) ? userAgent[0] : userAgent;
    if (!value) return DeviceType.UNKNOWN;
    return MOBILE_USER_AGENT_PATTERN.test(value)
      ? DeviceType.MOBILE
      : DeviceType.DESKTOP;
  }
}
