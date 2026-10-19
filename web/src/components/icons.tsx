const PATHS: Record<string, string> = {
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  swords: 'm4 4 9 9m-3 3 3-3m-6 6 3-3M20 4l-9 9m3 3-3-3m6 6-3-3M4 4v3m0-3h3m13 0v3m0-3h-3',
  sparkles: 'M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.200-1.8L10 3Zm8 11 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z',
  book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11M9 8h6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.500 4.500',
  users: 'M9 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7Zm-6 9c0-3.300 2.700-6 6-6s6 2.700 6 6M16 4.500a3.500 3.500 0 0 1 0 6.500m2 3.500c1.800.900 3 2.800 3 5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  star: 'm12 3 2.700 5.800 6.300.800-4.600 4.400 1.200 6.300L12 17.200 6.400 20.300l1.200-6.300L3 9.600l6.300-.800L12 3Z',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15m-1-1 8-8',
  image: 'M4 5h16v14H4V5Zm0 11 5-5 4 4 3-3 4 4M15.500 9.500a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  check: 'm5 12.500 4.500 4.500L19 7.500',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9Z',
  flag: 'M5 21V4m0 1h12l-2 4 2 4H5',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  x: 'M6 6l12 12M18 6 6 18',
  shield: 'M12 3 5 6v6c0 4.500 3 7.500 7 9 4-1.500 7-4.500 7-9V6l-7-3Z',
  out: 'M10 4H5v16h5m4-4 4-4-4-4m4 4H9',
  heart: 'M12 20s-7-4.300-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.700-7 10-7 10Z'
};

/** Decorative line icon. Always pair with visible or `.sr` text. */
export function Icon({ name, className = '' }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg className={`ico ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name] ?? PATHS.leaf} />
    </svg>
  );
}
