'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV = [['/explore', 'Explore', '🧭'], ['/quests', 'Quests', '🎯'], ['/battles', 'Battles', '⚔️'], ['/create', 'Create', '✨'], ['/collection', 'Collection', '📚']] as const;
const active = (p: string, href: string) => p === href || p.startsWith(href + '/') || (href === '/explore' && p.startsWith('/species'));

export function NavLinks() {
  const p = usePathname();
  return (
    <nav className="nav" aria-label="Primary">
      {NAV.map(([h, l]) => <Link key={h} href={h} aria-current={active(p, h) ? 'page' : undefined}>{l}</Link>)}
    </nav>
  );
}

export function BottomNav() {
  const p = usePathname();
  return (
    <nav className="bottomnav" aria-label="Primary mobile">
      {NAV.filter(([h]) => h !== '/battles').map(([h, l, i]) => (
        <Link key={h} href={h} aria-current={active(p, h) ? 'page' : undefined}><b aria-hidden="true">{i}</b>{l}</Link>
      ))}
    </nav>
  );
}

export function LogoMark() {
  const face = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e: MouseEvent) => {
      const el = face.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy), near = dist < 320;
      const k = near ? Math.min(dist, 60) / 60 * 2.2 / (dist || 1) : 0;
      el.style.setProperty('--ex', `${dx * k}px`); el.style.setProperty('--ey', `${dy * k}px`);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <span className="logo-mark" ref={face} aria-hidden="true">
      <span className="eye" style={{ transform: 'translate(var(--ex,0px),var(--ey,0px))' }} />
      <span className="eye" style={{ transform: 'translate(var(--ex,0px),var(--ey,0px))' }} />
    </span>
  );
}

/** Moves every creature's pupils toward the mouse. Mounted once in the layout. */
export function EyeTracker() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let mx = 0, my = 0;
    const apply = () => {
      document.querySelectorAll<SVGGElement>('.pupil').forEach((g) => {
        const svg = g.ownerSVGElement; if (!svg) return;
        const r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const scale = r.width / 200;
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + 99 * scale);
        const dist = Math.hypot(dx, dy) || 1, amt = Math.min(dist / (120 * scale), 1) * 3.6;
        g.style.transform = `translate(${(dx / dist) * amt}px, ${(dy / dist) * amt}px)`;
      });
    };
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; apply(); };
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mousemove', move); };
  }, []);
  return null;
}
