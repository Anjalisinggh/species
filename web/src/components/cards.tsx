import Link from 'next/link';
import { Creature, FormArt, Scene } from '@/lib/creature';
import { FollowButton, ReportButton } from './buttons';
import { Icon } from './icons';
import type { Species } from '@/lib/data';
import { STAGE_NAMES } from '@/lib/data';

export function Bar({ label, pct, gold }: { label: string; pct: number; gold?: boolean }) {
  return (
    <>
      <div className="plabel"><span>{label}</span><b>{pct}%</b></div>
      <div className={`progress ${gold ? 'gold' : ''}`} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
    </>
  );
}

export function StageBadge({ s }: { s: Pick<Species, 'stage'> }) {
  return <span className={`badge ${s.stage >= 2 ? 'gold' : s.stage === 0 ? 'mint' : ''}`}>Stage {s.stage + 1} · {STAGE_NAMES[s.stage]}</span>;
}

export function Members({ n }: { n: number }) {
  return <span className="members"><Icon name="users" />{n.toLocaleString()} member{n === 1 ? '' : 's'}</span>;
}

export function SpeciesCard({ s, following }: { s: Species; following: boolean }) {
  const form = s.stage_names[s.stage] ?? STAGE_NAMES[s.stage];
  const next = s.stage_names[s.stage + 1] ?? STAGE_NAMES[s.stage + 1];
  return (
    <article className="card scard">
      <Scene slug={s.slug} type={s.creature_type} stage={s.stage} color={s.color} world={s.world} alt={`${s.name}, ${form} form`} />
      <div className="overflow"><ReportButton speciesId={s.id} name={s.name} /></div>
      <div className="body">
        <div className="row"><h3><Link href={`/species/${s.slug}`}>{s.name}</Link></h3><StageBadge s={s} /></div>
        <div className="chips"><span className="chip">{s.personality}</span><span className="chip">{s.world}</span></div>
        <p className="desc">{s.description}</p>
        <div>{s.stage >= 3 ? <Bar label="Final form reached" pct={100} gold /> : <Bar label={`Next: ${next}`} pct={s.progress} />}</div>
        <div className="foot"><Members n={s.members} /><FollowButton speciesId={s.id} following={following} /></div>
      </div>
    </article>
  );
}

export function EmptyState({ title, children, type = 'custom', color = '#A59AF5', art }: { title: string; children: React.ReactNode; type?: string; color?: string; art?: string }) {
  return (
    <div className="empty">
      {art ? <FormArt slug={art} type={type} stage={0} color={color} alt="" /> : <Creature type={type} stage={0} color={color} alt="" />}
      <h3>{title}</h3>
      {children}
    </div>
  );
}
