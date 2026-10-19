import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Bar, EmptyState, Members, SpeciesCard, StageBadge } from '@/components/cards';
import { Icon } from '@/components/icons';
import { Scene } from '@/lib/creature';
import { ContributionForm, FollowButton, LoreVote, ReportButton, ShareButton } from '@/components/buttons';
import { EvolutionTree } from '@/components/evolution-tree';
import { QuestCard } from '@/components/quest-card';
import { RevealButton } from '@/components/reveal';
import { OnchainPanel } from '@/components/onchain-panel';
import { CHAIN, REGISTRY, TOKEN_PREFIX, explorer } from '@/lib/chain/config';
import { readOnchain } from '@/lib/chain/server';
import { ago, getAllCriteria, getContributions, getCriteria, getEvents, getMyFollows, getMySubmissions, getQuests, getSpecies, getVotes, getUser, listSpecies, STAGE_NAMES, type Species } from '@/lib/data';

type P = { params: Promise<{ slug: string; tab?: string[] }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSpecies(slug);
  return { title: s?.name ?? 'Species', description: s?.description };
}

const ICON: Record<string, string> = { evolution: 'star', contribution: 'image', created: 'leaf' };
// What each criterion kind means for a member. Mirrors the kinds enforced in supabase/schema.sql.
const HELP: Record<string, [string, string, string]> = {
  verified_quests: ['target', 'Complete quests', 'Every quest a moderator verifies counts toward the milestone.'],
  contributors: ['users', 'Bring your own work', 'Each new member with a verified quest adds one unique contributor.'],
  approved_contributions: ['image', 'Share art or lore', 'Posts in the community feed count once a moderator approves them.']
};

export default async function SpeciesPage({ params }: P) {
  const { slug, tab: t } = await params;
  const s = await getSpecies(slug);
  if (!s) notFound();
  const tabs: [string, string][] = [['overview', 'Overview'], ['evolution', 'Evolution'], ['quests', 'Quests'], ['lore', 'Lore'], ['community', 'Community'], ['onchain', 'Onchain']];
  const tab = tabs.find(([k]) => k === (t?.[0] ?? 'overview'))?.[0] ?? 'overview';
  const follows = await getMyFollows();
  const following = follows.includes(s.id);
  const form = s.stage_names[s.stage];
  const final = s.stage >= 3;

  return (
    <div className="wrap">
      <div className="phead">
        <Scene className="pscene" slug={s.slug} priority type={s.creature_type} stage={s.stage} color={s.color} world={s.world} alt={`${s.name} in its current form, ${form}`} />
        <div className="pinfo">
          <div className="titlerow"><h1>{s.name}</h1><StageBadge s={s} /></div>
          <div className="chips">
            <Link className="chip" href={`/explore?p=${encodeURIComponent(s.personality)}`}>{s.personality}</Link>
            <Link className="chip" href={`/explore?w=${encodeURIComponent(s.world)}`}>{s.world}</Link>
            <span className="chip" style={{ textTransform: 'capitalize' }}>{s.creature_type}</span>
          </div>
          <p className="lede">{s.description}</p>
          <div className="byline">
            <span className="av" aria-hidden="true">{(s.creator_name ?? 'C')[0].toUpperCase()}</span>
            <span>Created by <b>{s.creator_name ?? 'the community'}</b> · {new Date(s.created_at).toLocaleDateString('en', { dateStyle: 'medium' })}</span>
            <Members n={s.members} />
          </div>
          <div className="nextbox">
            <div className="small muted" style={{ marginBottom: 6 }}>{final ? 'Evolution' : 'Next evolution'}</div>
            <Bar label={final ? `${form} · final form reached` : `${form} → ${s.stage_names[s.stage + 1]}`} pct={final ? 100 : s.progress} gold={final} />
            {!final && <p className="small muted" style={{ margin: '8px 0 0' }}>Progress is the share of public milestone criteria the community has met. <Link href={`/species/${s.slug}/evolution`}>See the requirements</Link>.</p>}
          </div>
          <div className="btnrow"><FollowButton speciesId={s.id} following={following} className="" /><ShareButton name={s.name} /><ReportButton speciesId={s.id} name={s.name} variant="btn" /></div>
        </div>
      </div>
      <nav className="tabs" aria-label="Species sections" style={{ marginTop: 24 }}>
        {tabs.map(([k, l]) => <Link key={k} href={`/species/${s.slug}/${k}`} className="tab" aria-current={tab === k ? 'page' : undefined} scroll={false}>{l}</Link>)}
      </nav>
      {tab === 'overview' && <Overview s={s} />}
      {tab === 'quests' && <QuestsTab s={s} />}
      {tab === 'lore' && <Lore s={s} />}
      {tab === 'community' && <Community s={s} />}
      {tab === 'evolution' && <Evolution s={s} />}
      {tab === 'onchain' && <Onchain s={s} />}
    </div>
  );
}

async function Overview({ s }: { s: Species }) {
  const [crit, events, all, everyone, follows] = await Promise.all([getCriteria(s.id), getEvents(s.id), getAllCriteria(s.id), listSpecies(), getMyFollows()]);
  const demo = s.stage > 0 ? { slug: s.slug, name: s.name, type: s.creature_type, color: s.color, stageNames: s.stage_names, to: s.stage, members: s.members, criteria: all.filter((c) => c.stage === s.stage) } : null;
  const kinds = [...new Set(crit.map((c) => c.kind))].filter((k) => HELP[k]);
  const related = everyone.filter((o) => o.id !== s.id && (o.world === s.world || o.personality === s.personality)).slice(0, 4);
  return (
    <>
      <div className="two-col">
        <div className="stack">
          <div className="card pad">
            <h3>{s.stage >= 3 ? 'Evolution complete' : `What ${s.name} needs to become ${s.stage_names[s.stage + 1]}`}</h3>
            {s.stage >= 3 ? <p className="muted">This species reached its final form. Its history is permanent.</p> : (
              <>
                <ul className="crit">
                  {crit.map((c) => { const ok = c.current >= c.target; const pct = Math.min(100, Math.round((c.current / c.target) * 100)); return (
                    <li key={c.criterion_id} className={ok ? 'ok' : ''}><span className="st" aria-hidden="true">{ok ? <Icon name="check" /> : `${pct}%`}</span>
                      <div style={{ flex: 1 }}><b>{c.label}</b><div className="small muted">{c.current.toLocaleString()} of {c.target.toLocaleString()} · {ok ? 'Met' : 'In progress'}</div>
                        <div className="progress" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div></div></li>
                  ); })}
                </ul>
                <p className="small muted" style={{ margin: '12px 0 0' }}>Qualifying {s.window_label}. Counted by the server from verified activity only.</p>
              </>
            )}
            <div className="btnrow" style={{ marginTop: 16 }}>
              <Link className="btn sm sec" href={`/species/${s.slug}/evolution`}>View evolution journey</Link>
              {demo && <RevealButton className="btn sm violet" label="Replay latest reveal" data={demo} />}
            </div>
          </div>
          <div className="card pad">
            <h3>Origin</h3>
            <p style={{ margin: 0 }}>{s.origin_story || s.description}</p>
          </div>
        </div>
        <div className="stack">
          {kinds.length > 0 && s.stage < 3 && (
            <div className="card pad">
              <h3>How you can help</h3>
              <ul className="howto">{kinds.map((k) => <li key={k}><span className="ic"><Icon name={HELP[k][0]} /></span><div><b>{HELP[k][1]}</b><div className="small muted">{HELP[k][2]}</div></div></li>)}</ul>
              <div className="btnrow" style={{ marginTop: 16 }}><Link className="btn sm" href={`/species/${s.slug}/quests`}>See {s.name}&apos;s quests</Link></div>
              <p className="small muted" style={{ margin: '12px 0 0' }}>Following shows your support but does not move the milestone.</p>
            </div>
          )}
          <div className="card pad">
            <h3>Recent activity</h3>
            {events.length ? <ul className="feed">{events.map((e) => <li key={e.id}><span className="ic" aria-hidden="true"><Icon name={ICON[e.type] ?? 'leaf'} /></span><div><div>{e.text}</div><div className="small muted">{ago(e.created_at)}</div></div></li>)}</ul>
              : <p className="muted" style={{ margin: 0 }}>Nothing yet. The first verified quest will show up here.</p>}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div className="sechead"><div><h2>Related species</h2><p className="muted">Creatures that share {s.name}&apos;s habitat or temperament.</p></div></div>
          <div className="grid">{related.map((o) => <SpeciesCard key={o.id} s={o} following={follows.includes(o.id)} />)}</div>
        </section>
      )}
    </>
  );
}

async function QuestsTab({ s }: { s: Species }) {
  const [quests, subs] = await Promise.all([getQuests(s.id), getMySubmissions()]);
  return quests.length ? <div className="grid q">{quests.map((q) => <QuestCard key={q.id} q={q} sub={subs[q.id]} speciesName={s.name} />)}</div>
    : <EmptyState title="No quests yet" type={s.creature_type} color={s.color}><p className="muted">{s.name} has no open quests right now. Check the quest board for other ways to take part.</p><Link className="btn" href="/quests">Browse quests</Link></EmptyState>;
}

async function Lore({ s }: { s: Species }) {
  const counts = await getVotes(s.id);
  return (
    <div className="two-col">
      <div className="card pad"><h3>Origin story</h3><p>{s.origin_story || s.description}</p><p className="muted" style={{ margin: 0 }}>Chapter 2 unlocks at {s.stage_names[Math.min(s.stage + 1, 3)]}.</p></div>
      <div className="card pad"><h3>Chapter 1 vote</h3><p className="small muted">What does {s.name} do next?</p><LoreVote speciesId={s.id} options={['Follows the lantern', 'Hides and watches', 'Calls the others']} counts={counts} /></div>
    </div>
  );
}

async function Community({ s }: { s: Species }) {
  const [posts, user] = await Promise.all([getContributions(s.id), getUser()]);
  return (
    <div className="two-col">
      <div className="card pad">
        <h3>Community feed</h3>
        <ContributionForm speciesId={s.id} />
        <ul className="feed" style={{ marginTop: 14 }}>
          <li><span className="ic"><Icon name="flag" /></span><div><b>Pinned: origin story &amp; community rules</b><div className="small muted">Be kind, be original, no financial promises.</div></div></li>
          {posts.map((p) => (
            <li key={p.id}><span className="ic"><Icon name="image" /></span><div><div>{p.body}</div>
              <div className="small muted">{ago(p.created_at)}{p.status === 'pending' && p.user_id === user?.id ? ' · awaiting review' : ''} · <ReportButton speciesId={s.id} name="this post" variant="link" contributionId={p.id} /></div></div></li>
          ))}
        </ul>
        {!posts.length && <p className="small muted" style={{ margin: '8px 0 0' }}>No approved posts yet. Yours could be the first.</p>}
      </div>
      <div className="card pad"><h3>House rules</h3><p className="small muted" style={{ margin: 0 }}>Submissions are reviewed before they appear publicly or count toward evolution. Roles come from verified contribution, not token balance.</p></div>
    </div>
  );
}

async function Evolution({ s }: { s: Species }) {
  const all = await getAllCriteria(s.id);
  return <EvolutionTree slug={s.slug} name={s.name} type={s.creature_type} color={s.color} stage={s.stage} stageNames={s.stage_names ?? STAGE_NAMES} criteria={all} windowLabel={s.window_label} progress={s.progress} members={s.members} />;
}

const RISK = <div className="notice" style={{ marginBottom: 16 }}><b>Risk notice.</b> Tokens are volatile and can lose all value. Liquidity may be thin and smart contracts can have bugs. Nothing here is financial advice or a promise of returns. XP, evolution and collectibles are <b>separate</b> from any token.</div>;
const when = (t: number) => new Date(t * 1000).toLocaleDateString('en', { dateStyle: 'medium' });

async function Onchain({ s }: { s: Species }) {
  const chain = await readOnchain(s.id);
  if (chain.status === 'unconfigured') {
    return (
      <div className="card pad">
        <span className="badge violet">Not live yet</span>
        <h3 style={{ marginTop: 10 }}>On-chain records are not switched on</h3>
        <p className="muted" style={{ margin: 0 }}>Firstform can record each species and its evolution stages on Robinhood Chain. The registry contract has not been deployed for this site yet, so nothing about {s.name} is on-chain today.</p>
      </div>
    );
  }
  if (chain.status === 'error') {
    return <div className="card pad"><h3>Couldn&apos;t reach {CHAIN.name}</h3><p className="muted">The network did not answer, so on-chain details can&apos;t be shown right now. Nothing in the game is affected.</p><Link className="btn sm sec" href={`/species/${s.slug}/onchain`}>Try again</Link></div>;
  }
  const mint = chain.tokenRef.startsWith(TOKEN_PREFIX) ? chain.tokenRef.slice(TOKEN_PREFIX.length) : '';
  const inSync = chain.registered && chain.stage === s.stage;
  return (
    <>
      {mint && RISK}
      <div className="two-col">
        <div className="card pad">
          <h3>On-chain record</h3>
          <dl className="kv">
            <dt>Network</dt><dd>{CHAIN.name}{CHAIN.testnet ? ' (test network, no real value)' : ''}</dd>
            <dt>Registry</dt><dd><a href={explorer('address', REGISTRY!)} target="_blank" rel="noreferrer">{REGISTRY}</a></dd>
            <dt>Status</dt><dd>{chain.registered ? `Registered ${when(chain.registeredAt)}` : 'Not registered yet'}</dd>
            {chain.registered && (
              <>
                <dt>Registered by</dt><dd><a href={explorer('address', chain.creator)} target="_blank" rel="noreferrer">{chain.creator}</a></dd>
                <dt>Stage on-chain</dt><dd>Stage {chain.stage + 1} · {s.stage_names[chain.stage]}{chain.evolvedAt ? ` (recorded ${when(chain.evolvedAt)})` : ''}</dd>
                <dt>Stage in game</dt><dd>Stage {s.stage + 1} · {s.stage_names[s.stage]}{inSync ? ' · matches' : ' · not recorded on-chain yet'}</dd>
                <dt>Token</dt><dd>{mint ? <a href={`https://bags.fm/${mint}`} target="_blank" rel="noreferrer">{mint} on Bags (Solana)</a> : 'None linked'}</dd>
              </>
            )}
          </dl>
          <p className="small muted" style={{ margin: '14px 0 0' }}>Follows, quests and XP stay in the game. The chain holds a public, permanent record of who registered {s.name} and each stage it has reached.</p>
        </div>
        <OnchainPanel speciesId={s.id} name={s.name} gameStage={s.stage} stageNames={s.stage_names} chain={chain} />
      </div>
    </>
  );
}
