import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Melarang Google mengintip ruang rahasia Boss
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
