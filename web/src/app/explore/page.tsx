import Link from 'next/link';
import { EmptyState, SpeciesCard } from '@/components/cards';
import { FilterForm } from '@/components/filters';
import { Scene } from '@/lib/creature';
import { getMyFollows, listSpecies, STAGE_NAMES } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Explore' };
const TABS = [['all', 'All'], ['new', 'New'], ['active', 'Active'], ['evolving', 'Evolving'], ['seasonal', 'Seasonal']];
const SORTS = [['activity', 'Most active'], ['members', 'Most followed'], ['recent', 'Recently created'], ['closest', 'Closest to evolution']];
type Params = { q?: string; f?: string; sort?: string; p?: string; w?: string; st?: string };

export default async function Explore({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = '', f = 'all', sort = 'activity', p = '', w = '', st = '' } = await searchParams;
  const [found, everything, follows] = await Promise.all([listSpecies({ q, sort }), listSpecies(), getMyFollows()]);
  let list = found;
  if (f === 'new') list = list.filter((s) => Date.now() - +new Date(s.created_at) < 30 * 864e5);
  if (f === 'active') list = list.filter((s) => s.members > 0);
  if (f === 'evolving') list = list.filter((s) => s.progress >= 50 && s.stage < 3);
  if (f === 'seasonal') {
    const sb = await createClient();
    const { data } = await sb.from('quests').select('species_id').eq('kind', 'seasonal');
    const ids = new Set((data ?? []).map((r: { species_id: string | null }) => r.species_id));
    list = list.filter((s) => ids.has(s.id));
  }
  if (p) list = list.filter((s) => s.personality === p);
  if (w) list = list.filter((s) => s.world === w);
  if (st !== '') list = list.filter((s) => String(s.stage) === st);

  // Filter options come from species that actually exist, so no option leads to a dead end by design.
  const uniq = (k: 'personality' | 'world') => [...new Set(everything.map((s) => s[k]))].sort();
  const stages = [...new Set(everything.map((s) => s.stage))].sort();
  const keep = { ...(q && { q }), ...(sort !== 'activity' && { sort }), ...(p && { p }), ...(w && { w }), ...(st && { st }) };
  const href = (nf: string) => { const qs = new URLSearchParams({ ...keep, ...(nf !== 'all' && { f: nf }) }).toString(); return `/explore${qs ? '?' + qs : ''}`; };
  const filtered = !!(q || p || w || st || f !== 'all');
  const hero = everything[0];

  return (
    <div className="wrap">
      <div className="pagehead banner">
        <div>
          <h1>Explore species</h1>
          <p className="muted">Discover unique creatures, join their communities, and help them evolve. Ranked by real activity, never by market value.</p>
        </div>
        {hero && <Scene slug={hero.slug} priority type={hero.creature_type} stage={hero.stage} color={hero.color} world={hero.world} alt="" />}
      </div>

      <nav className="tabs" aria-label="Species categories">
        {TABS.map(([k, l]) => <Link key={k} href={href(k)} className="tab" aria-current={f === k ? 'page' : undefined} scroll={false}>{l}</Link>)}
      </nav>

      <FilterForm key={[q, f, sort, p, w, st].join("|")} action="/explore">
        <input id="search" name="q" type="search" aria-label="Search by name, creator or trait" placeholder="Search by name, creator or trait" defaultValue={q} />
        <input type="hidden" name="f" value={f} />
        <select name="p" aria-label="Personality" defaultValue={p}><option value="">Any personality</option>{uniq('personality').map((v) => <option key={v}>{v}</option>)}</select>
        <select name="w" aria-label="Habitat" defaultValue={w}><option value="">Any habitat</option>{uniq('world').map((v) => <option key={v}>{v}</option>)}</select>
        <select name="st" aria-label="Evolution stage" defaultValue={st}><option value="">Any stage</option>{stages.map((v) => <option key={v} value={v}>Stage {v + 1} · {STAGE_NAMES[v]}</option>)}</select>
        <label className="sort">Sort
          <select name="sort" defaultValue={sort}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        <button className="btn sm sec">Search</button>
      </FilterForm>

      <div className="results" role="status">
        <span>{list.length} species{filtered ? ' match' : ''}</span>
        {filtered && <Link className="more" href="/explore" scroll={false}>Clear filters</Link>}
      </div>

      {list.length ? (
        <div className="grid">{list.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
      ) : (
        <EmptyState title="No species found">
          <p className="muted">Nothing matches those filters yet. Try a different search, or bring a new creature to life.</p>
          <div className="btnrow" style={{ justifyContent: 'center' }}><Link className="btn" href="/explore">Clear filters</Link><Link className="btn sec" href="/create">Create a species</Link></div>
        </EmptyState>
      )}
    </div>
  );
}
