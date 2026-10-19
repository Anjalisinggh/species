import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { isConfigured } from '@/lib/supabase/server';
import { listSpecies } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/explore', '/quests', '/battles', '/create', '/safety', '/privacy', '/terms'];
  const base: MetadataRoute.Sitemap = pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: p === '' || p === '/explore' ? 'daily' : 'monthly', priority: p === '' ? 1 : 0.6 }));
  if (!isConfigured()) return base;
  try {
    const species = await listSpecies();
    return [...base, ...species.map((s) => ({ url: `${SITE_URL}/species/${s.slug}`, lastModified: new Date(s.created_at), changeFrequency: 'weekly' as const, priority: 0.7 }))];
  } catch { return base; }
}
