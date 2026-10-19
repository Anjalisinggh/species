'use client';
import { useAction } from './ui';
import { resolveReport, reviewContribution, reviewSubmission } from '@/app/actions';

export function ReviewButtons({ kind, id }: { kind: 'submission' | 'contribution' | 'report'; id: string }) {
  const { run, pending } = useAction();
  if (kind === 'report') return <button className="btn sm sec" disabled={pending} onClick={() => run(() => resolveReport(id))}>Resolve</button>;
  const act = (ok: boolean) => run(() => (kind === 'submission' ? reviewSubmission(id, ok) : reviewContribution(id, ok)));
  return (
    <div className="btnrow">
      <button className="btn sm" disabled={pending} onClick={() => act(true)}>Approve</button>
      <button className="btn sm sec" disabled={pending} onClick={() => act(false)}>Reject</button>
    </div>
  );
}
