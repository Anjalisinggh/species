const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  // Browsers only use HTTPS for this site for the next 2 years (the host must also redirect HTTP -> HTTPS).
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' }
];

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: securityHeaders }]; }
};
