import type { MetadataRoute } from 'next';

const SITE_URL = 'https://homereach.site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/results`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    // Wizard steps are intentionally excluded — see robots: noindex in
    // src/app/wizard/layout.tsx (session-scoped flow, no standalone content).
  ];
}
