export const COOKIE_NAME = 'access_token';

// Same default (seconds) as auth.module.ts's JwtModule signOptions.expiresIn
// — both read JWT_EXPIRES_IN, so the cookie's lifetime never drifts from the
// JWT's actual expiration.
export const JWT_EXPIRES_IN_DEFAULT_SECONDS = 604800;

export function cookieMaxAgeMs(): number {
  const seconds =
    Number(process.env.JWT_EXPIRES_IN) || JWT_EXPIRES_IN_DEFAULT_SECONDS;
  return seconds * 1000;
}

export function cookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'none' | 'lax';
} {
  // Front and backend always live on different domains once deployed (Vercel
  // vs Render), in both the dev preview and production — so the cookie needs
  // SameSite=None there regardless of deployment tier. Only a bare local run
  // (front and backend both on localhost, so same-site) can use Lax. Render
  // sets RENDER=true on every service it hosts, which is the one reliable
  // signal for "not running on localhost" here — APP_ENV/NODE_ENV don't work
  // since the dev preview's tier is legitimately "development" too.
  const isDeployed = process.env.RENDER === 'true';
  return {
    httpOnly: true,
    secure: isDeployed,
    sameSite: isDeployed ? 'none' : 'lax',
  };
}
