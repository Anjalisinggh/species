import { notFound } from 'next/navigation';
import { ReviewButtons } from '@/components/admin-actions';
import { ago, getProfile } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Moderation' };
export default async function Admin() {
  const profile = await getProfile();
  if (!profile || !['moderator', 'admin'].includes(profile.role)) notFound();
  const sb = await createClient();
  const [subs, posts, reports] = await Promise.all([
    sb.from('quest_submissions').select('id,evidence,updated_at,quests(title),profiles(display_name)').eq('status', 'submitted').order('updated_at'),
    sb.from('contributions').select('id,body,created_at,species(name),profiles(display_name)').eq('status', 'pending').order('created_at'),
    sb.from('reports').select('id,reason,created_at,species(name),contribution_id').eq('status', 'open').order('created_at')
  ]);
  type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const S = (subs.data ?? []) as Row[], P = (posts.data ?? []) as Row[], R = (reports.data ?? []) as Row[];
  return (
    <div className="wrap">
      <div className="pagehead"><h1 style={{ fontSize: '2.4rem' }}>Moderation queue</h1><p className="muted">XP and evolution progress only count after approval.</p></div>
      <Section title={`Quest submissions (${S.length})`} empty={!S.length}>
        <table className="table"><tbody>{S.map((r) => <tr key={r.id}><td><b>{r.quests?.title}</b><div className="small muted">{r.profiles?.display_name} · {ago(r.updated_at)}</div><p style={{ margin: '6px 0 0' }}>{r.evidence}</p></td><td style={{ width: 190 }}><ReviewButtons kind="submission" id={r.id} /></td></tr>)}</tbody></table>
      </Section>
      <Section title={`Community posts (${P.length})`} empty={!P.length}>
        <table className="table"><tbody>{P.map((r) => <tr key={r.id}><td><b>{r.species?.name}</b><div className="small muted">{r.profiles?.display_name} · {ago(r.created_at)}</div><p style={{ margin: '6px 0 0' }}>{r.body}</p></td><td style={{ width: 190 }}><ReviewButtons kind="contribution" id={r.id} /></td></tr>)}</tbody></table>
      </Section>
      <Section title={`Open reports (${R.length})`} empty={!R.length}>
        <table className="table"><tbody>{R.map((r) => <tr key={r.id}><td><b>{r.species?.name}</b>{r.contribution_id ? ' · post' : ''}<div className="small muted">{r.reason} · {ago(r.created_at)}</div></td><td style={{ width: 120 }}><ReviewButtons kind="report" id={r.id} /></td></tr>)}</tbody></table>
      </Section>
    </div>
  );
}
function Section({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return <section className="card pad" style={{ marginBottom: 20 }}><h3>{title}</h3>{empty ? <p className="muted small">Nothing waiting.</p> : children}</section>;
}
