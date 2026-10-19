import Link from 'next/link';
import { SpeciesCard } from '@/components/cards';
import { getMyFollows, listSpecies } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Explore' };
const TABS = [['all', 'All'], ['new', 'New'], ['active', 'Active'], ['evolving', 'Evolving'], ['seasonal', 'Seasonal']];

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; sort?: string }> }) {
  const { q = '', f = 'all', sort = 'activity' } = await searchParams;
  const [all, follows] = await Promise.all([listSpecies({ q, sort }), getMyFollows()]);
  let list = all;
  if (f === 'new') list = all.filter((s) => Date.now() - +new Date(s.created_at) < 30 * 864e5);
  if (f === 'active') list = all.filter((s) => s.members > 0).slice(0, Math.max(3, Math.ceil(all.length / 2)));
  if (f === 'evolving') list = all.filter((s) => s.progress >= 50 && s.stage < 3);
  if (f === 'seasonal') {
    const sb = await createClient();
    const { data } = await sb.from('quests').select('species_id').eq('kind', 'seasonal');
    const ids = new Set((data ?? []).map((r: { species_id: string | null }) => r.species_id));
    list = all.filter((s) => ids.has(s.id));
  }
  const href = (nf: string) => `/explore?${new URLSearchParams({ ...(q && { q }), f: nf, sort }).toString()}`;
  return (
    <div className="wrap">
      <div className="pagehead"><h1 style={{ fontSize: '2.4rem' }}>Explore the universe</h1><p className="muted">Sorted by real activity, never market cap.</p></div>
      <div className="tabs" role="tablist" aria-label="Filter species">
        {TABS.map(([k, l]) => <Link key={k} href={href(k)} className="tab" role="tab" aria-selected={f === k}>{l}</Link>)}
      </div>
      <form className="toolbar" action="/explore">
        <input name="q" type="search" aria-label="Search by name, creator or trait" placeholder="Search by name, creator or trait" defaultValue={q} />
        <input type="hidden" name="f" value={f} />
        <label className="small muted">Sort{' '}
          <select name="sort" defaultValue={sort}>
            <option value="activity">Verified engagement</option><option value="recent">Newest</option><option value="members">Members</option>
          </select>
        </label>
        <button className="btn sm sec">Apply</button>
      </form>
      {list.length ? (
        <div className="grid">{list.map((s) => <SpeciesCard key={s.id} s={s} following={follows.includes(s.id)} />)}</div>
      ) : (
        <div className="empty"><h3>No species match those filters</h3><p className="muted">Try clearing the search, or switch tabs. Can&apos;t find what you want?</p><Link className="btn" href="/create">Create a Species</Link></div>
      )}
    </div>
  );
}
