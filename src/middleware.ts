import type { MiddlewareHandler } from 'astro';

function buildCsp(pathname: string) {
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://github.com https://cms-auth.gehri.xyz",
      "script-src 'self' https://unpkg.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com https://github.com https://cms-auth.gehri.xyz",
      "frame-src 'self' https://github.com",
    ].join('; ');
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

function applySecurityHeaders(response: Response, pathname: string) {
  const isAdminRoute = pathname.startsWith('/admin');

  response.headers.set('Content-Security-Policy', buildCsp(pathname));
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  );
  response.headers.set(
    'Cross-Origin-Embedder-Policy',
    isAdminRoute ? 'unsafe-none' : 'require-corp',
  );
  response.headers.set(
    'Cross-Origin-Opener-Policy',
    isAdminRoute ? 'same-origin-allow-popups' : 'same-origin',
  );
  response.headers.set(
    'Cross-Origin-Resource-Policy',
    isAdminRoute ? 'same-site' : 'same-origin',
  );
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();
  applySecurityHeaders(response, context.url.pathname);
  return response;
};
