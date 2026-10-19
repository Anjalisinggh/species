import Link from 'next/link';
import { EmptyState, SpeciesCard } from '@/components/cards';
import { PrivacyToggle } from '@/components/buttons';
import { Scene } from '@/lib/creature';
import { getMyFollows, getMySubmissions, getProfile, listSpecies } from '@/lib/data';

export const metadata = { title: 'My Collection' };
export default async function Collection({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = 'followed' } = await searchParams;
  const profile = await getProfile();
  if (!profile) {
    return (
      <div className="wrap">
        <div className="pagehead"><h1>My Collection</h1><p className="muted">Your personal sanctuary of creatures.</p></div>
        <div className="card authwrap" style={{ margin: '8px 0 0', maxWidth: 'none' }}>
          <Scene slug="page-collection" type="animal" stage={0} color="#4EB88A" world="Enchanted forest" alt="" priority />
          <div className="authbox" style={{ alignSelf: 'center' }}>
            <h2>Your little corner of the universe is waiting.</h2>
            <p className="muted">Sign in to follow species, keep track of the ones you create, and see your quest progress in one place.</p>
            <div className="btnrow"><Link className="btn" href="/login?next=/collection">Sign in</Link><Link className="btn sec" href="/explore">Explore species</Link></div>
          </div>
        </div>
      </div>
    );
  }
  const [all, follows, subs] = await Promise.all([listSpecies(), getMyFollows(), getMySubmissions()]);
  const followed = all.filter((s) => follows.includes(s.id));
  const created = all.filter((s) => s.creator_name === profile.display_name);
  const done = Object.values(subs).filter((s) => s.status === 'rewarded').length;
  const badges = [followed.length > 0 && 'First follow', Object.keys(subs).length > 0 && 'First quest', done >= 3 && 'Quest regular', created.length > 0 && 'Creator'].filter(Boolean) as string[];
  const list = t === 'created' ? created : followed;
  return (
    <div className="wrap">
      <div className="pagehead"><h1>My Collection</h1><p className="muted">{profile.display_name} · Level {Math.floor(profile.xp / 100) + 1} · {profile.xp.toLocaleString()} XP · {done} quest{done === 1 ? '' : 's'} completed</p></div>
      <nav className="tabs" aria-label="Collection sections">
        <Link className="tab" href="/collection" aria-current={t !== 'created' ? 'page' : undefined} scroll={false}>Followed ({followed.length})</Link>
        <Link className="tab" href="/collection?t=created" aria-current={t === 'created' ? 'page' : undefined} scroll={false}>Created ({created.length})</Link>
      </nav>
      {list.length ? <div className="grid">{list.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
        : t === 'created'
          ? <EmptyState title="You haven't created a species yet"><p className="muted">Give a creature a name, a personality and a world. It takes about two minutes.</p><Link className="btn" href="/create">Create a species</Link></EmptyState>
          : <EmptyState title="Your little corner of the universe is waiting." type="animal" color="#4EB88A" art="page-collection"><p className="muted">Follow a species to start building your collection.</p><Link className="btn" href="/explore">Explore species</Link></EmptyState>}
      <div className="two-col" style={{ marginTop: 32 }}>
        <div className="card pad"><h3>Badges</h3>{badges.length ? <div className="chips">{badges.map((b) => <span key={b} className="chip">{b}</span>)}</div> : <p className="muted small" style={{ margin: 0 }}>Follow a species or finish a quest to earn your first badge.</p>}</div>
        <div className="card pad"><h3>Privacy</h3><PrivacyToggle value={profile.is_private} /><p className="small muted" style={{ margin: 0 }}>Wallet connection is optional and not needed to play.</p></div>
      </div>
    </div>
  );
}
