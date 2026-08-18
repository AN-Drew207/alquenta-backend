import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

/**
 * Production Neon host (just the host, no credentials) — confirmed
 * 2026-08-17. Used by assertNotPointingAtProductionDatabase below to refuse
 * booting a non-production process against it.
 */
const PRODUCTION_DB_HOST: string = 'ep-empty-shape-axezc2a4';

class EnvironmentVariables {
  /**
   * Which deployment tier this process is running as — distinct from
   * NODE_ENV, which only controls Node/framework runtime optimizations.
   * Render sets this per service (production vs -dev).
   */
  @IsIn(['development', 'production', 'test'])
  APP_ENV: string;

  @IsIn(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV?: string;

  @IsNumberString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  /**
   * Direct (non-pooled) connection used only by Prisma Migrate. PgBouncer's
   * transaction-mode pooling (the "-pooler" host in DATABASE_URL) can't hold
   * the session-level advisory lock migrate deploy needs, which times out
   * with P1002. Same credentials/db as DATABASE_URL, host without "-pooler".
   * Not needed locally against a non-pooled dev database — only required
   * where DATABASE_URL itself goes through a pooler (Render dev/prod, Neon).
   */
  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  @IsString()
  @IsNotEmpty()
  FRONT_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsNumberString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  /**
   * Folder prefix uploads are stored under (e.g. "alquenta/dev" vs
   * "alquenta/prod"), so environments never mix each other's media even
   * when they share the same Cloudinary account. Defaults to "alquenta".
   */
  @IsString()
  @IsOptional()
  CLOUDINARY_FOLDER_PREFIX?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  assertNotPointingAtProductionDatabase(validatedConfig);

  return validatedConfig;
}

/**
 * Refuses to boot a non-production process against the production
 * database — the most common way to accidentally wreck real data from a
 * dev/test environment. No-op until PRODUCTION_DB_HOST is filled in above.
 */
function assertNotPointingAtProductionDatabase(
  config: EnvironmentVariables,
): void {
  if (config.APP_ENV === 'production' || !PRODUCTION_DB_HOST) return;

  if (config.DATABASE_URL.includes(PRODUCTION_DB_HOST)) {
    throw new Error(
      `Refusing to start: APP_ENV is "${config.APP_ENV}" but DATABASE_URL points ` +
        `at the production database host (${PRODUCTION_DB_HOST}). Double-check which ` +
        'connection string was set for this environment.',
    );
  }
}
