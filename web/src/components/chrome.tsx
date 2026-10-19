'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './icons';
import { creatureSvg } from '@/lib/creature';
import { suggestSpecies, type Suggestion } from '@/app/actions';

export const NAV = [['/explore', 'Explore', 'compass'], ['/quests', 'Quests', 'target'], ['/battles', 'Battles', 'swords'], ['/create', 'Create', 'sparkles'], ['/collection', 'Collection', 'book']] as const;
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
      {NAV.map(([h, l, i]) => (
        <Link key={h} href={h} aria-current={active(p, h) ? 'page' : undefined}><Icon name={i} />{l}</Link>
      ))}
    </nav>
  );
}

/** Header search: debounced suggestions from real species, recent searches kept on this device only. */
export function GlobalSearch() {
  const router = useRouter();
  const path = usePathname();
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [sel, setSel] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem('sf:recent') ?? '[]')); } catch { /* ignore */ } }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const term = q.trim();
    setSel(-1);
    if (term.length < 2) { setItems([]); setState('idle'); return; }
    setState('loading');
    let stale = false;
    const t = setTimeout(async () => {
      try { const r = await suggestSpecies(term); if (!stale) { setItems(r); setState('done'); } }
      catch { if (!stale) setState('error'); }
    }, 220);
    return () => { stale = true; clearTimeout(t); };
  }, [q]);
  useEffect(() => {
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecent(next); try { localStorage.setItem('sf:recent', JSON.stringify(next)); } catch { /* ignore */ }
  };
  const go = (term: string) => { const t = term.trim(); if (!t) return; remember(t); setOpen(false); router.push('/explore?q=' + encodeURIComponent(t)); };
  const pick = (s: Suggestion) => { remember(s.name); setOpen(false); setQ(''); router.push('/species/' + s.slug); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); setOpen(true); setSel((s) => (s + 1) % items.length); }
    if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); setSel((s) => (s <= 0 ? items.length - 1 : s - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0 && items[sel]) pick(items[sel]); else go(q); }
  };
  const show = open && (q.trim().length >= 2 || recent.length > 0);

  return (
    <div className="gsearch" ref={box} role="search">
      <Icon name="search" />
      <label className="sr" htmlFor={id}>Search species, creators and traits</label>
      <input id={id} ref={input} type="search" autoComplete="off" placeholder="Search species, creators, traits" value={q}
        role="combobox" aria-expanded={show} aria-controls={id + '-list'} aria-autocomplete="list" aria-activedescendant={sel >= 0 ? `${id}-o${sel}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={key} />
      {q && <button type="button" className="clear" aria-label="Clear search" onClick={() => { setQ(''); input.current?.focus(); }}><Icon name="x" /></button>}
      {show && (
        <div className="gpanel">
          {q.trim().length < 2 ? (
            <>
              <h4>Recent searches</h4>
              <div className="recent">{recent.map((r) => <button key={r} type="button" className="chip" style={{ border: 0, cursor: 'pointer' }} onClick={() => go(r)}>{r}</button>)}</div>
            </>
          ) : (
            <>
              <ul id={id + '-list'} role="listbox" aria-label="Species suggestions">
                {items.map((s, i) => (
                  <li key={s.slug} id={`${id}-o${i}`} role="option" aria-selected={sel === i} className="gopt" onMouseEnter={() => setSel(i)} onMouseDown={(e) => { e.preventDefault(); pick(s); }}>
                    <span className="thumb" dangerouslySetInnerHTML={{ __html: creatureSvg(s.type, s.stage, s.color, '') }} />
                    <span><b>{s.name}</b><span className="small muted">Stage {s.stage + 1} · {s.form} · {s.personality} · {s.world}</span></span>
                  </li>
                ))}
              </ul>
              <div className="gempty" role="status">
                {state === 'loading' && 'Searching…'}
                {state === 'error' && 'Search is unavailable right now. Press Enter to try the Explore page.'}
                {state === 'done' && !items.length && <>No species match “{q.trim()}”. Try a trait like “curious” or a habitat like “ocean”.</>}
                {state === 'done' && items.length > 0 && <>Press Enter to see all results</>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ProfileMenu({ name, moderator, signOut }: { name: string; moderator: boolean; signOut: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className="pmenu" ref={ref}>
      <button className="iconbtn avatar" aria-haspopup="true" aria-expanded={open} aria-label={`Account menu for ${name}`} onClick={() => setOpen(!open)}>{name[0]?.toUpperCase()}</button>
      {open && (
        <div className="pmenu-list">
          <div className="who"><b>{name}</b><div className="small muted">Signed in</div></div>
          <Link href="/collection"><Icon name="book" />My collection</Link>
          <Link href="/collection?t=created"><Icon name="sparkles" />Created species</Link>
          <Link href="/quests"><Icon name="target" />My quests</Link>
          {moderator && <Link href="/admin"><Icon name="shield" />Moderation queue</Link>}
          <form action={signOut}><button><Icon name="out" />Sign out</button></form>
        </div>
      )}
    </div>
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
      const k = near ? Math.min(dist, 60) / 60 * 1.5 / (dist || 1) : 0;
      el.style.setProperty('--ex', `${dx * k}px`); el.style.setProperty('--ey', `${dy * k}px`);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <span className="logo-mark" ref={face} aria-hidden="true">
      {/* A moss-capped cub with a sprout, after the Mossling paintings. The eyes follow the pointer. */}
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#2E2118" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="8.5" cy="15" r="5" fill="#8C5E3C" />
          <circle cx="31.5" cy="15" r="5" fill="#8C5E3C" />
          <circle cx="20" cy="23" r="14.2" fill="#A06F46" />
          <path d="M20 9.5V4.5" fill="none" />
          <path d="M20 5.2Q15.4 1 12.6 4.2Q15.8 8.2 20 5.2Z" fill="#86A856" />
          <path d="M20 6.6Q24.6 3.2 27.2 6.2Q24 9.6 20 6.6Z" fill="#6E8F45" />
          <path d="M6.6 19.6Q8 9.4 20 9.2Q32 9.4 33.4 19.6Q29.6 15.6 26 17.4Q23 14.6 20 17Q17 14.6 14 17.4Q10.4 15.6 6.6 19.6Z" fill="#6E8F45" />
        </g>
        <ellipse cx="20" cy="28.4" rx="9.4" ry="7.2" fill="#F6EAD3" />
        <ellipse cx="20" cy="26.4" rx="1.9" ry="1.4" fill="#2E2118" />
        <path d="M17.4 29.6Q20 31.8 22.6 29.6" fill="none" stroke="#2E2118" strokeWidth="1.3" strokeLinecap="round" />
        <g className="eyes" style={{ transform: 'translate(var(--ex,0px),var(--ey,0px))' }}>
          <ellipse cx="13.8" cy="23" rx="2" ry="2.5" fill="#2E2118" />
          <ellipse cx="26.2" cy="23" rx="2" ry="2.5" fill="#2E2118" />
        </g>
      </svg>
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
