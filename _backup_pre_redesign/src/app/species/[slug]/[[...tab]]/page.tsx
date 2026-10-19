import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Bar } from '@/components/cards';
import { Creature } from '@/lib/creature';
import { ContributionForm, FollowButton, LoreVote, ReportButton, ShareButton } from '@/components/buttons';
import { EvolutionTree } from '@/components/evolution-tree';
import { QuestCard } from '@/components/quest-card';
import { RevealButton } from '@/components/reveal';
import { ago, getAllCriteria, getContributions, getCriteria, getEvents, getMyFollows, getMySubmissions, getQuests, getSpecies, getVotes, getUser, STAGE_NAMES, type Species } from '@/lib/data';

type P = { params: Promise<{ slug: string; tab?: string[] }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSpecies(slug);
  return { title: s?.name ?? 'Species', description: s?.description };
}

const ICON: Record<string, string> = { evolution: '⭐', contribution: '🖼️', created: '🌱' };

export default async function SpeciesPage({ params }: P) {
  const { slug, tab: t } = await params;
  const s = await getSpecies(slug);
  if (!s) notFound();
  const tabs: [string, string][] = [['overview', 'Overview'], ['quests', 'Quests'], ['lore', 'Lore'], ['community', 'Community'], ['evolution', 'Evolution']];
  if (s.has_token) tabs.push(['onchain', 'Onchain']);
  const tab = tabs.find(([k]) => k === (t?.[0] ?? 'overview'))?.[0] ?? 'overview';
  const follows = await getMyFollows();
  const following = follows.includes(s.id);
  const form = s.stage_names[s.stage];

  return (
    <div className="wrap">
      <div className="phead">
        <div className="pstage"><Creature type={s.creature_type} stage={s.stage} color={s.color} alt={`${s.name} current form: ${form}`} /><span className={`badge ${s.stage >= 2 ? 'gold' : ''}`}>{form}</span></div>
        <div>
          <span className="eyebrow">{s.world} · {s.creature_type}</span>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '.2em' }}>{s.name}</h1>
          <div className="chips" style={{ marginBottom: 12 }}><span className="chip">{s.personality}</span><span className="chip">Created {new Date(s.created_at).toLocaleDateString('en', { dateStyle: 'medium' })}</span><span className="chip">by {s.creator_name ?? 'the community'}</span><span className="chip">👥 {s.members}</span></div>
          <p>{s.description}</p>
          <div style={{ maxWidth: 440, marginBottom: 16 }}><Bar label={s.stage >= 3 ? 'Final form reached' : `Next evolution: ${s.stage_names[s.stage + 1]}`} pct={s.stage >= 3 ? 100 : s.progress} gold /></div>
          <div className="btnrow"><FollowButton speciesId={s.id} following={following} className="" /><ShareButton name={s.name} /><ReportButton speciesId={s.id} name={s.name} variant="btn" /></div>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Species sections" style={{ marginTop: 22 }}>
        {tabs.map(([k, l]) => <Link key={k} href={`/species/${s.slug}/${k}`} className="tab" role="tab" aria-selected={tab === k}>{l}</Link>)}
      </div>
      {tab === 'overview' && <Overview s={s} />}
      {tab === 'quests' && <QuestsTab s={s} />}
      {tab === 'lore' && <Lore s={s} />}
      {tab === 'community' && <Community s={s} />}
      {tab === 'evolution' && <Evolution s={s} />}
      {tab === 'onchain' && s.has_token && <Onchain s={s} />}
    </div>
  );
}

async function Overview({ s }: { s: Species }) {
  const [crit, events, all] = await Promise.all([getCriteria(s.id), getEvents(s.id), getAllCriteria(s.id)]);
  const demo = s.stage > 0 ? { slug: s.slug, name: s.name, type: s.creature_type, color: s.color, stageNames: s.stage_names, to: s.stage, members: s.members, criteria: all.filter((c) => c.stage === s.stage) } : null;
  return (
    <div className="two-col">
      <div className="card pad">
        <h3>Evolution progress</h3>
        {s.stage >= 3 ? <p className="muted">This species reached its final form.</p> : (
          <>
            <ul className="crit">
              {crit.map((c) => { const ok = c.current >= c.target; return (
                <li key={c.criterion_id} className={ok ? 'ok' : ''}><span className="st" aria-hidden="true">{ok ? '✓' : '…'}</span>
                  <div style={{ flex: 1 }}><b>{c.label}</b><div className="small muted">{c.current} / {c.target} · {ok ? 'Verified by server' : 'Pending'}</div></div><span className="sr">{ok ? 'Complete' : 'Incomplete'}</span></li>
              ); })}
            </ul>
            <p className="small muted" style={{ margin: '10px 0 0' }}>Qualifying {s.window_label}. Verified by application logic, not AI.</p>
          </>
        )}
        <div className="btnrow" style={{ marginTop: 14 }}>
          <Link className="btn sm sec" href={`/species/${s.slug}/evolution`}>View evolution tree</Link>
          {demo && <RevealButton className="btn sm violet" label="Replay latest reveal" data={demo} />}
        </div>
      </div>
      <div className="card pad">
        <h3>Activity</h3>
        {events.length ? <ul className="feed">{events.map((e) => <li key={e.id}><span className="ic" aria-hidden="true">{ICON[e.type] ?? '•'}</span><div><div>{e.text}</div><div className="small muted">{ago(e.created_at)}</div></div></li>)}</ul>
          : <p className="muted">Nothing yet. Complete a quest to get things moving.</p>}
      </div>
    </div>
  );
}

async function QuestsTab({ s }: { s: Species }) {
  const [quests, subs] = await Promise.all([getQuests(s.id), getMySubmissions()]);
  return quests.length ? <div className="grid">{quests.map((q) => <QuestCard key={q.id} q={q} sub={subs[q.id]} speciesName={s.name} />)}</div>
    : <div className="empty"><h3>No active quests yet</h3><p className="muted">Check the global Quests page for open challenges.</p><Link className="btn" href="/quests">Browse quests</Link></div>;
}

async function Lore({ s }: { s: Species }) {
  const counts = await getVotes(s.id);
  return (
    <div className="two-col">
      <div className="card pad"><h3>Origin story</h3><p>{s.origin_story || s.description}</p><p className="muted">Chapter 2 unlocks at {s.stage_names[Math.min(s.stage + 1, 3)]}.</p></div>
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
          <li><span className="ic">📌</span><div><b>Pinned: origin story &amp; community rules</b><div className="small muted">Be kind, be original, no financial promises.</div></div></li>
          {posts.map((p) => (
            <li key={p.id}><span className="ic">🖼️</span><div><div>{p.body}</div>
              <div className="small muted">{ago(p.created_at)}{p.status === 'pending' && p.user_id === user?.id ? ' · awaiting review' : ''} · <ReportButton speciesId={s.id} name="this post" variant="link" contributionId={p.id} /></div></div></li>
          ))}
        </ul>
      </div>
      <div className="card pad"><h3>House rules</h3><p className="small muted">Submissions are reviewed before they appear publicly or count toward evolution. Roles come from verified contribution, not token balance.</p></div>
    </div>
  );
}

async function Evolution({ s }: { s: Species }) {
  const all = await getAllCriteria(s.id);
  return <EvolutionTree slug={s.slug} name={s.name} type={s.creature_type} color={s.color} stage={s.stage} stageNames={s.stage_names ?? STAGE_NAMES} criteria={all} windowLabel={s.window_label} progress={s.progress} members={s.members} />;
}

function Onchain({ s }: { s: Species }) {
  const t = s.token_info;
  return (
    <>
      <div className="notice" style={{ marginBottom: 16 }}><b>Risk notice.</b> Tokens are volatile and can lose all value. Liquidity may be thin and smart contracts can have bugs. Nothing here is financial advice or a promise of returns. XP, evolution and collectibles are <b>separate</b> from any token.</div>
      <div className="card pad">
        <h3>Token details (read-only)</h3>
        <dl className="kv">
          <dt>Network</dt><dd>{t?.network ?? '—'}</dd>
          <dt>Contract</dt><dd>{t?.contract ?? 'Not published yet'}</dd>
          <dt>Verification</dt><dd>{t?.verified ? 'Verified' : 'Unverified'}</dd>
          <dt>Price / supply</dt><dd>Shown only when sourced and timestamped</dd>
        </dl>
        <p className="small muted" style={{ marginTop: 12 }}>No wallet connection is needed to browse. We never ask for seed phrases or private keys.</p>
      </div>
    </>
  );
}
