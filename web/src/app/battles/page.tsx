import Link from 'next/link';
import { Scene } from '@/lib/creature';
import { EmptyState, StageBadge } from '@/components/cards';
import { listSpecies } from '@/lib/data';

export const metadata = { title: 'Battles' };
// Battles have no backend yet (see README "Not built yet"). This page is an honest preview: no scores, timers or results.
export default async function Battles() {
  const [a, b] = (await listSpecies()).slice(0, 2);
  return (
    <div className="wrap">
      <div className="pagehead"><span className="badge violet">Coming later</span><h1 style={{ marginTop: 10 }}>Battles</h1><p className="muted">Friendly community matchups between species are planned, but not built yet. There are no live battles, scores or results today.</p></div>
      {a && b ? (
        <>
          <div className="versus" aria-label={`Preview matchup: ${a.name} versus ${b.name}`}>
            {[a, b].map((s) => (
              <figure key={s.id}>
                <Scene slug={s.slug} type={s.creature_type} stage={s.stage} color={s.color} world={s.world} alt={s.name} />
                <figcaption><b>{s.name}</b><StageBadge s={s} /></figcaption>
              </figure>
            ))}
            <span className="vs" aria-hidden="true">VS</span>
          </div>
          <p className="small muted" style={{ textAlign: 'center', margin: '12px 0 28px' }}>Illustrative preview using two real species. This is not a scheduled battle.</p>
        </>
      ) : null}
      <div className="two-col">
        <div className="card pad">
          <h3>What battles will be</h3>
          <p className="muted">Two communities take on the same challenge over a fixed window. The outcome will come from verified participation, with public rules, in the same way evolution works today.</p>
          <p className="muted" style={{ margin: 0 }}>Battles will never involve wagers or financial stakes.</p>
        </div>
        <div className="card pad">
          <h3>In the meantime</h3>
          <p className="muted">Quests are live and count toward real evolution milestones.</p>
          <div className="btnrow"><Link className="btn sm" href="/quests">Browse quests</Link><Link className="btn sm sec" href="/explore">Explore species</Link></div>
        </div>
      </div>
      {!a && <EmptyState title="No species yet"><p className="muted">Battles need species. Create the first one.</p><Link className="btn" href="/create">Create a species</Link></EmptyState>}
    </div>
  );
}
