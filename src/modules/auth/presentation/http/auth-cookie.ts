import { ConfigService } from '@nestjs/config';

export const COOKIE_NAME = 'access_token';
export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions(configService: ConfigService): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'none' | 'lax';
} {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
}
