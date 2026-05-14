import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Gunakan domain yang sedang aktif atau fallback ke vercel domain Boss
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app'; 

  // Fetch all blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at')
    .eq('type', 'Blog Post')
    .order('created_at', { ascending: false });

  const blogEntries = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/newsroom`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...blogEntries,
  ];
}
