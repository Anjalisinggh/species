import Link from 'next/link';
import { Creature } from '@/lib/creature';
import { FollowButton, ReportButton } from './buttons';
import type { Species } from '@/lib/data';
import { STAGE_NAMES } from '@/lib/data';

export function Bar({ label, pct, gold }: { label: string; pct: number; gold?: boolean }) {
  return (
    <>
      <div className="plabel"><span>{label}</span><span>{pct}%</span></div>
      <div className={`progress ${gold ? 'gold' : ''}`} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
    </>
  );
}

export function SpeciesCard({ s, following }: { s: Species; following: boolean }) {
  const form = s.stage_names[s.stage] ?? STAGE_NAMES[s.stage];
  return (
    <article className="card scard">
      <ReportButton speciesId={s.id} name={s.name} />
      <div className="art"><Creature type={s.creature_type} stage={s.stage} color={s.color} alt={`${s.name}, ${form} form`} /></div>
      <div className="body">
        <div className="row"><h3><Link href={`/species/${s.slug}`}>{s.name}</Link></h3><span className={`badge ${s.stage >= 2 ? 'gold' : ''}`}>Stage {s.stage + 1} · {STAGE_NAMES[s.stage]}</span></div>
        <div className="chips"><span className="chip">{s.personality}</span><span className="chip">{s.world}</span></div>
        <p className="small muted" style={{ margin: 0 }}>{s.description}</p>
        <div><Bar label="Next milestone" pct={s.progress} /></div>
        <div className="row small muted"><span>👥 {s.members.toLocaleString()} member{s.members === 1 ? '' : 's'}</span><span>by {s.creator_name ?? 'the community'}</span></div>
        <div className="actions"><FollowButton speciesId={s.id} following={following} /></div>
      </div>
    </article>
  );
}
