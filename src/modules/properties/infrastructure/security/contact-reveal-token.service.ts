import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 90;

/**
 * Anti-scraping speed bump for exposing a property's WhatsApp number (see
 * api/CLAUDE.md's "Contact reveal" note). Not a security boundary — the
 * number is meant to become visible to any real visitor with one click, no
 * login. The point is to make bulk-harvesting a property's whole catalog of
 * phone numbers expensive (must load each property page for a fresh token,
 * then redeem it under a much stricter rate limit) instead of a single
 * unauthenticated GET per number.
 *
 * Stateless: the token embeds its own expiry and an HMAC over
 * (propertyId, expiry), so verifying it needs no DB/cache lookup. Reuses
 * JWT_SECRET instead of a dedicated env var — this isn't an auth token, just
 * a signed, short-lived proof "you loaded this property's page recently".
 */
@Injectable()
export class ContactRevealTokenService {
  constructor(private readonly configService: ConfigService) {}

  issue(propertyId: string): string {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const signature = this.sign(propertyId, expiresAt);
    return `${expiresAt}.${signature}`;
  }

  verify(propertyId: string, token: string | undefined | null): boolean {
    if (!token) return false;
    const [expiresAtRaw, signature] = token.split('.');
    if (!expiresAtRaw || !signature) return false;

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt)) return false;
    if (expiresAt < Math.floor(Date.now() / 1000)) return false;

    const expected = this.sign(propertyId, expiresAt);
    const provided = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (provided.length !== expectedBuf.length) return false;
    return timingSafeEqual(provided, expectedBuf);
  }

  private sign(propertyId: string, expiresAt: number): string {
    const secret = this.configService.get<string>('JWT_SECRET') ?? '';
    return createHmac('sha256', secret)
      .update(`${propertyId}.${expiresAt}`)
      .digest('hex');
  }
}
