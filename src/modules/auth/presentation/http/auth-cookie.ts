export const COOKIE_NAME = 'access_token';
export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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
