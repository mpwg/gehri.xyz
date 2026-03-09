import { defineMiddleware } from 'astro:middleware';

const nonceDirective = (nonce: string) => `'nonce-${nonce}'`;

const ADMIN_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
  "connect-src 'self' https://api.github.com https://github.com https://cms-auth.gehri.xyz",
  "frame-src 'self' https://github.com",
  'upgrade-insecure-requests',
].join('; ');

const buildDefaultCsp = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' ${nonceDirective(nonce)}`,
    "connect-src 'self'",
    "frame-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

const generateNonce = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
};

export const onRequest = defineMiddleware(async (context, next) => {
  const nonce = generateNonce();
  context.locals.cspNonce = nonce;

  const response = await next();
  const headers = new Headers(response.headers);
  const isAdminRoute = context.url.pathname.startsWith('/admin');

  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  );
  headers.set('Cross-Origin-Resource-Policy', 'same-site');

  if (isAdminRoute) {
    headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
    headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  } else {
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  const contentType = headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    headers.set('Content-Security-Policy', isAdminRoute ? ADMIN_CSP : buildDefaultCsp(nonce));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
