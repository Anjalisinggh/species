import { Creature } from '@/lib/creature';
import { listSpecies } from '@/lib/data';

export const metadata = { title: 'Battles' };
export default async function Battles() {
  const [a, b] = (await listSpecies()).slice(0, 2);
  return (
    <div className="wrap">
      <div className="pagehead"><span className="badge violet">Later phase</span><h1 style={{ fontSize: '2.4rem', marginTop: 8 }}>Battles</h1><p className="muted">Community challenges and species rivalries are planned after core validation.</p></div>
      {a && b && (
        <div className="card pad"><div className="rival">
          <figure><Creature type={a.creature_type} stage={a.stage} color={a.color} alt={a.name} /><h3>{a.name}</h3></figure>
          <span className="vs" style={{ color: 'var(--violet)' }}>VS</span>
          <figure><Creature type={b.creature_type} stage={b.stage} color={b.color} alt={b.name} /><h3>{b.name}</h3></figure>
        </div></div>
      )}
    </div>
  );
}
