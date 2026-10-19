import Link from 'next/link';
import { Bar } from '@/components/cards';
import { QuestCard } from '@/components/quest-card';
import { getMySubmissions, getProfile, getQuests, listSpecies } from '@/lib/data';

export const metadata = { title: 'Quests' };
const TABS = [['daily', 'Daily'], ['weekly', 'Weekly'], ['community', 'Community'], ['seasonal', 'Seasonal']];

export default async function Quests({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = 'daily' } = await searchParams;
  const [quests, subs, profile, species] = await Promise.all([getQuests(), getMySubmissions(), getProfile(), listSpecies()]);
  const names = Object.fromEntries(species.map((s) => [s.id, s.name]));
  const xp = profile?.xp ?? 0, lvl = Math.floor(xp / 100) + 1;
  const list = quests.filter((q) => q.kind === t);
  return (
    <div className="wrap">
      <div className="pagehead"><h1 style={{ fontSize: '2.4rem' }}>Quests</h1><p className="muted">Small, meaningful tasks. Nothing here costs money.</p></div>
      <div className="card xpbar">
        <div><div className="small muted">Your level</div><div className="lvl">{lvl}</div></div>
        <div style={{ flex: 1, minWidth: 200 }}>{profile ? <Bar label={`XP to level ${lvl + 1}`} pct={xp % 100} /> : <p className="small muted" style={{ margin: 0 }}><Link href="/login?next=/quests"><u>Sign in</u></Link> to track XP and progress.</p>}</div>
        {profile && <div className="small muted">{xp} XP total</div>}
      </div>
      <div className="tabs" role="tablist">{TABS.map(([k, l]) => <Link key={k} href={`/quests?t=${k}`} className="tab" role="tab" aria-selected={t === k}>{l}</Link>)}</div>
      {list.length ? <div className="grid">{list.map((q) => <QuestCard key={q.id} q={q} sub={subs[q.id]} speciesName={q.species_id ? names[q.species_id] : undefined} />)}</div>
        : <div className="empty"><h3>No {t} quests right now</h3><p className="muted">Check another tab.</p></div>}
    </div>
  );
}
