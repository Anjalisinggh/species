import { Fragment } from 'react';
import Link from 'next/link';
import { Creature, FormArt, habitatSvg } from '@/lib/creature';
import { artFor } from '@/lib/art';
import { EmptyState, SpeciesCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { RevealButton } from '@/components/reveal';
import { getAllCriteria, getMyFollows, listSpecies, STAGE_NAMES } from '@/lib/data';

export default async function Home() {
  const [all, follows] = await Promise.all([listSpecies(), getMyFollows()]);
  const featured = all.slice(0, 3);
  const cast = all.slice(0, 4);
  const lead = cast.find((s) => artFor(s.slug, s.stage)) ?? cast[0];
  const heroArt = lead ? artFor(lead.slug, lead.stage) : null;
  const closest = all.filter((s) => s.stage < 3 && s.progress > 0).sort((a, b) => b.progress - a.progress).slice(0, 4);
  const newest = [...all].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 4);
  const demo = all.find((s) => s.stage >= 1);
  const demoCrit = demo ? (await getAllCriteria(demo.id)).filter((c) => c.stage === demo.stage) : [];
  const stats: [string, number][] = [['Species', all.length], ['Members', all.reduce((n, s) => n + s.members, 0)], ['Forms unlocked', all.reduce((n, s) => n + s.stage, 0)]];
  return (
    <>
      <section className="hero"><div className="wrap">
        <div className={`hero-panel ${heroArt ? 'has-art' : ''}`}>
          {heroArt
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="hero-art" src={heroArt.src} srcSet={`${heroArt.sm} 640w, ${heroArt.src} 1280w`} sizes="(max-width: 900px) 100vw, 760px" alt={`${lead.name}, ${lead.stage_names[lead.stage]}`} width={1280} height={960} />
            : <div className="scene-bg" dangerouslySetInnerHTML={{ __html: habitatSvg(lead?.world ?? 'Enchanted forest') }} />}
          <div className="hero-copy">
            <span className="eyebrow tag"><Icon name="leaf" />A living ecosystem of digital creatures</span>
            <h1>Every species has a story.</h1>
            <p className="sub">Your community decides what comes next.</p>
            <p className="lead">Discover strange little creatures, join their communities, and help shape what they become.</p>
            <div className="btnrow"><Link className="btn" href="/explore">Explore species</Link><Link className="btn sec" href="/create">Create a species</Link></div>
            {all.length > 0 && <dl className="stats">{stats.filter(([, v]) => v > 0).map(([l, v]) => <div key={l}><dd>{v.toLocaleString()}</dd><dt>{l}</dt></div>)}</dl>}
          </div>
          <div className="cast">
            {!heroArt && cast.map((s, i) => (
              <Link key={s.id} href={`/species/${s.slug}`} className={`c${i} float`} aria-label={`${s.name}, ${s.stage_names[s.stage]}`}>
                <Creature type={s.creature_type} stage={s.stage} color={s.color} alt="" />
              </Link>
            ))}
          </div>
          {lead && <Link className="feat-tag" href={`/species/${lead.slug}`}><span className="badge gold">Featured</span><b>{lead.name}</b><span className="muted">Stage {lead.stage + 1} · {STAGE_NAMES[lead.stage]}</span><Icon name="arrow" /></Link>}
        </div>
      </div></section>

      <section className="block"><div className="wrap">
        <div className="sechead">
          <div><h2>Featured species</h2><p className="muted">The most active communities right now.</p></div>
          <Link className="more" href="/explore">View all <Icon name="arrow" /></Link>
        </div>
        {featured.length ? <div className="fgrid">{featured.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
          : <EmptyState title="No species yet"><p className="muted">This universe is still empty. Be the first to bring a creature to life.</p><Link className="btn" href="/create">Create a species</Link></EmptyState>}
      </div></section>

      {closest.length > 0 && (
        <section className="block" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sechead">
            <div><h2>Almost evolving</h2><p className="muted">Closest to their next verified milestone.</p></div>
            <Link className="more" href="/explore?sort=closest">See more <Icon name="arrow" /></Link>
          </div>
          <div className="grid">{closest.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
        </div></section>
      )}

      {all.length > 3 && (
        <section className="block" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sechead">
            <div><h2>New discoveries</h2><p className="muted">The latest creatures to join the ecosystem.</p></div>
            <Link className="more" href="/explore?sort=recent">See more <Icon name="arrow" /></Link>
          </div>
          <div className="grid">{newest.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
        </div></section>
      )}

      <section className="block" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sechead"><div><h2>How a species grows</h2><p className="muted">Evolution is earned by the community, and every rule is public.</p></div></div>
        <div className="steps">
          <div className="step"><h3>Discover or create</h3><p className="muted">Follow a creature you love, or give a new one a name, a personality and a world.</p></div>
          <div className="step"><h3>Take part</h3><p className="muted">Complete quests, share art and vote on lore. A moderator verifies contributions before they count.</p></div>
          <div className="step"><h3>Evolve together</h3><p className="muted">When the published milestone is met, the species evolves and its new form is revealed.</p></div>
        </div>
      </div></section>

      {demo && (
        <section className="block" style={{ paddingTop: 0 }}><div className="wrap"><div className="band">
          <div>
            <span className="eyebrow">The signature moment</span>
            <h2>The evolution reveal</h2>
            <p className="muted">A short, skippable moment that shows which public criteria were met. Replay {demo.name}&apos;s latest one.</p>
            <RevealButton className="btn accent" label="Watch a reveal" data={{ slug: demo.slug, name: demo.name, type: demo.creature_type, color: demo.color, stageNames: demo.stage_names, to: demo.stage, members: demo.members, criteria: demoCrit }} />
          </div>
          <div className="rival">
            {[Math.max(demo.stage - 1, 0), demo.stage].map((st, i) => (
              <Fragment key={i}>
                {i === 1 && <span className="vs" aria-hidden="true">→</span>}
                <figure><FormArt slug={demo.slug} type={demo.creature_type} stage={st} color={demo.color} alt={`${demo.name}, ${demo.stage_names[st]}`} /><b>{demo.stage_names[st]}</b></figure>
              </Fragment>
            ))}
          </div>
        </div></div></section>
      )}
    </>
  );
}
