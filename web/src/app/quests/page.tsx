import Link from 'next/link';
import { Bar, EmptyState } from '@/components/cards';
import { QuestCard } from '@/components/quest-card';
import { getMySubmissions, getProfile, getQuests, listSpecies } from '@/lib/data';

export const metadata = { title: 'Quests' };
const TABS = [['all', 'All'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['community', 'Community'], ['seasonal', 'Seasonal'], ['done', 'Completed']];

export default async function Quests({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = 'all' } = await searchParams;
  const [quests, subs, profile, species] = await Promise.all([getQuests(), getMySubmissions(), getProfile(), listSpecies()]);
  const names = Object.fromEntries(species.map((s) => [s.id, s.name]));
  const xp = profile?.xp ?? 0, lvl = Math.floor(xp / 100) + 1;
  const isDone = (id: string) => subs[id]?.status === 'rewarded';
  const list = t === 'done' ? quests.filter((q) => isDone(q.id)) : quests.filter((q) => (t === 'all' || q.kind === t) && !isDone(q.id));
  const label = TABS.find(([k]) => k === t)?.[1].toLowerCase() ?? '';
  return (
    <div className="wrap">
      <div className="pagehead"><h1>Quests</h1><p className="muted">Small adventures that help a species evolve. A moderator verifies each one, and nothing here costs money.</p></div>
      <div className="card xpbar">
        {profile ? (
          <>
            <div><div className="small muted">Your level</div><div className="lvl">{lvl}</div></div>
            <div style={{ flex: 1, minWidth: 200 }}><Bar label={`XP to level ${lvl + 1}`} pct={xp % 100} /></div>
            <div className="small muted">{xp.toLocaleString()} XP total</div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 200 }}><b>Track your progress</b><div className="small muted">Sign in to start quests, earn XP and see what you have completed.</div></div>
            <Link className="btn sm" href="/login?next=/quests">Sign in</Link>
          </>
        )}
      </div>
      <nav className="tabs" aria-label="Quest categories">{TABS.map(([k, l]) => <Link key={k} href={k === 'all' ? '/quests' : `/quests?t=${k}`} className="tab" aria-current={t === k ? 'page' : undefined} scroll={false}>{l}</Link>)}</nav>
      {list.length ? <div className="grid q">{list.map((q) => <QuestCard key={q.id} q={q} sub={subs[q.id]} speciesName={q.species_id ? names[q.species_id] : undefined} />)}</div>
        : t === 'done'
          ? <EmptyState title="No completed quests yet"><p className="muted">{profile ? 'Quests show up here once a moderator verifies them and you claim the XP.' : 'Sign in to see the quests you have completed.'}</p><Link className="btn" href={profile ? '/quests' : '/login?next=/quests'}>{profile ? 'Browse quests' : 'Sign in'}</Link></EmptyState>
          : <EmptyState title={`No ${t === 'all' ? '' : label + ' '}quests right now`}><p className="muted">New quests appear as communities add them. Check another category in the meantime.</p>{t !== 'all' && <Link className="btn" href="/quests">See all quests</Link>}</EmptyState>}
    </div>
  );
}
