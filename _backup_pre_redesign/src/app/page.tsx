import { Fragment } from 'react';
import Link from 'next/link';
import { Creature } from '@/lib/creature';
import { SpeciesCard } from '@/components/cards';
import { RevealButton } from '@/components/reveal';
import { getAllCriteria, getMyFollows, listSpecies, STAGE_NAMES } from '@/lib/data';

export default async function Home() {
  const [all, follows] = await Promise.all([listSpecies(), getMyFollows()]);
  const featured = all.slice(0, 3);
  const demo = all.find((s) => s.stage >= 1);
  const demoCrit = demo ? (await getAllCriteria(demo.id)).filter((c) => c.stage === demo.stage) : [];
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow">A living universe of creatures</span>
            <h1>Every species <span>starts somewhere.</span></h1>
            <p className="lead">Create a creature, build its community, and watch it evolve.</p>
            <div className="btnrow"><Link className="btn" href="/create">Create a Species</Link><Link className="btn sec" href="/explore">Explore the Universe</Link></div>
            <p className="small muted" style={{ marginTop: 18 }}>No wallet needed to play. Tokens are an optional layer.</p>
          </div>
          <div className="evo-strip">
            {[0, 1, 2, 3].map((i) => (
              <figure key={i}><Creature type="animal" stage={i} color="#62B88A" alt={`Example evolution form ${i + 1}`} /><figcaption>{STAGE_NAMES[i]}</figcaption></figure>
            ))}
          </div>
        </div>
      </section>

      <section className="block"><div className="wrap">
        <span className="eyebrow">How it works</span><h2>Create → Complete quests → Evolve</h2>
        <div className="steps">
          <div className="step"><b>1</b><h3>Create</h3><p className="muted">Pick a name, personality and world. Shape the first form and write its origin story.</p></div>
          <div className="step"><b>2</b><h3>Complete quests</h3><p className="muted">Make art, vote on lore, welcome new members. Real contribution earns XP, not wallet size.</p></div>
          <div className="step"><b>3</b><h3>Evolve</h3><p className="muted">When the public milestone is verified, your species evolves and the reveal is yours to share.</p></div>
        </div>
      </div></section>

      <section className="block" style={{ paddingTop: 0 }}><div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div><span className="eyebrow">Featured species</span><h2 style={{ margin: 0 }}>Meet the community&apos;s favorites</h2></div>
          <Link className="btn sec sm" href="/explore">See all</Link>
        </div>
        {featured.length ? <div className="grid">{featured.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
          : <div className="empty"><h3>No species yet</h3><p className="muted">Be the first.</p><Link className="btn" href="/create">Create a Species</Link></div>}
      </div></section>

      {demo && (
        <section className="block" style={{ paddingTop: 0 }}><div className="wrap"><div className="band">
          <div>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Signature moment</span>
            <h2>The evolution reveal</h2>
            <p className="muted">A short, skippable cinematic. See which public criteria were met, and share it as a card.</p>
            <RevealButton className="btn" label="Watch a reveal" data={{ slug: demo.slug, name: demo.name, type: demo.creature_type, color: demo.color, stageNames: demo.stage_names, to: demo.stage, members: demo.members, criteria: demoCrit }} />
          </div>
          <div className="rival">
            {all.slice(0, 2).map((s, i) => (
              <Fragment key={s.id}>
                {i === 1 && <span key="vs" className="vs">VS</span>}
                <figure><Creature type={s.creature_type} stage={s.stage} color={s.color} alt={s.name} /><b>{s.name}</b></figure>
              </Fragment>
            ))}
          </div>
        </div></div></section>
      )}
    </>
  );
}
