'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FormArt } from '@/lib/creature';
import { useToast } from './ui';

export type RevealData = {
  slug: string; name: string; type: string; color: string; stageNames: string[]; to: number; members: number;
  criteria: { label: string; target: number }[];
};

export function RevealButton({ data, label = 'Watch reveal', className = 'btn' }: { data: RevealData; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>{label}</button>
      {open && <Reveal data={data} onClose={() => setOpen(false)} />}
    </>
  );
}

function Reveal({ data, onClose }: { data: RevealData; onClose: () => void }) {
  const [go, setGo] = useState(false);
  const [card, setCard] = useState<'r11' | 'r169' | null>(null);
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const from = Math.max(data.to - 1, 0);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const name = data.stageNames[data.to];

  useEffect(() => {
    const t = setTimeout(() => setGo(true), reduced ? 0 : 700);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    return () => { clearTimeout(t); document.removeEventListener('keydown', key); };
  }, [onClose, reduced]);

  return createPortal(
    <div className={`reveal ${go ? 'go' : ''} ${reduced ? 'static' : ''}`} role="dialog" aria-modal="true" aria-label="Evolution reveal" ref={ref}>
      <button className="btn sec sm skip-r" onClick={onClose}>{reduced ? 'Close' : 'Skip'} ✕</button>
      <div className="stage creature">
        <div className="glow" />
        <FormArt className="old" slug={data.slug} type={data.type} stage={from} color={data.color} alt={data.stageNames[from]} />
        <FormArt className="new" slug={data.slug} type={data.type} stage={data.to} color={data.color} alt={name} />
      </div>
      <div className="info" style={{ maxWidth: 520 }}>
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>{data.name} evolved</span>
        <h2 style={{ marginBottom: 6 }}>{name}</h2>
        <div className="card pad" style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.2)', textAlign: 'left', margin: '12px 0', color: '#fff' }}>
          <b>Milestone criteria met</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '.9rem' }}>{data.criteria.map((c, i) => <li key={i}>{c.label} — {c.target.toLocaleString()} ✓</li>)}</ul>
        </div>
        <span className="badge gold">Community achievement · {data.members.toLocaleString()} member{data.members === 1 ? '' : 's'}</span>
        {card && (
          <div className={`sharecard ${card}`}>
            <FormArt slug={data.slug} type={data.type} stage={data.to} color={data.color} alt={name} />
            <div><b style={{ fontFamily: 'var(--h)', fontSize: '1.2rem' }}>{name}</b><div className="small">{data.name} evolved on Firstform</div></div>
          </div>
        )}
        <div className="btnrow" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="btn" onClick={async () => {
            setCard(card === 'r11' ? 'r169' : 'r11');
            try { await navigator.clipboard.writeText(`${location.origin}/species/${data.slug}`); toast('Link copied. Share cards never include account details.'); } catch { /* ignore */ }
          }}>Share Reveal</button>
          <Link className="btn sec" href={`/species/${data.slug}/evolution`} onClick={onClose}>View New Form</Link>
          <Link className="btn sec" href="/quests" onClick={onClose}>Continue to Quests</Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
