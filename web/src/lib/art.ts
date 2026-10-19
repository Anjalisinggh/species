import manifest from './art-manifest.json';

const KEYS = new Set<string>(manifest as string[]);

/** Painted artwork for a species form, if one exists (see scripts/build-art.mjs). Falls back to the drawn creature otherwise. */
export function artFor(slug: string | undefined, stage: number): { src: string; sm: string } | null {
  if (!slug) return null;
  const key = `${slug}-${stage}`;
  return KEYS.has(key) ? { src: `/art/${key}.webp`, sm: `/art/${key}-sm.webp` } : null;
}
