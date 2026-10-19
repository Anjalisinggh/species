import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SpeciesCard } from '@/components/cards';
import { PrivacyToggle } from '@/components/buttons';
import { getMyFollows, getMySubmissions, getProfile, listSpecies } from '@/lib/data';

export const metadata = { title: 'My Collection' };
export default async function Collection() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/collection');
  const [all, follows, subs] = await Promise.all([listSpecies(), getMyFollows(), getMySubmissions()]);
  const mine = all.filter((s) => follows.includes(s.id));
  const done = Object.values(subs).filter((s) => s.status === 'rewarded').length;
  const badges = [mine.length > 0 && '🌱 First follow', Object.keys(subs).length > 0 && '🎯 First quest', done >= 3 && '⭐ Quest regular', mine.some((s) => s.creator_name === profile.display_name) && '✨ Creator'].filter(Boolean) as string[];
  return (
    <div className="wrap">
      <div className="pagehead"><h1 style={{ fontSize: '2.4rem' }}>My Collection</h1><p className="muted">{profile.display_name} · Level {Math.floor(profile.xp / 100) + 1} · {profile.xp} XP · {mine.length} species followed</p></div>
      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card pad"><h3>Badges</h3>{badges.length ? <div className="chips">{badges.map((b) => <span key={b} className="chip">{b}</span>)}</div> : <p className="muted small">Follow a species or finish a quest to earn your first badge.</p>}</div>
        <div className="card pad"><h3>Privacy</h3><PrivacyToggle value={profile.is_private} /><p className="small muted">Wallet connection is optional and not needed to play.</p></div>
      </div>
      <h2>Followed species</h2>
      {mine.length ? <div className="grid">{mine.map((s) => <SpeciesCard key={s.id} s={s} following />)}</div>
        : <div className="empty"><h3>Nothing collected yet</h3><p className="muted">Follow a species to see it here. No purchase needed.</p><Link className="btn" href="/explore">Explore</Link></div>}
    </div>
  );
}
