// Canonical site URL used for SEO metadata, sitemap and robots.
// Set NEXT_PUBLIC_SITE_URL in your environment / hosting dashboard,
// e.g. NEXT_PUBLIC_SITE_URL=https://dl.example.com
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://example.com';

export const siteName = 'DownX';
