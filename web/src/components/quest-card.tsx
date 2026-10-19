'use client';
import { useState } from 'react';
import { Modal, useAction } from './ui';
import { Icon } from './icons';
import { claimReward, startQuest, submitQuest } from '@/app/actions';
import { SUBMISSION_STEPS, submissionIndex, type Quest, type Submission } from '@/lib/constants';

const KIND_ICON: Record<string, string> = { daily: 'target', weekly: 'star', community: 'users', seasonal: 'leaf' };

export function QuestCard({ q, sub, speciesName }: { q: Quest; sub?: Submission; speciesName?: string }) {
  const [open, setOpen] = useState(false);
  const [evidence, setEvidence] = useState('');
  const { run, pending } = useAction();
  const i = submissionIndex(sub);
  const rejected = sub?.status === 'rejected';
  const status = rejected ? 'Needs changes' : SUBMISSION_STEPS[i];
  const cta = rejected ? 'Resubmit' : ['Start quest', 'Continue', 'View status', 'Claim reward', 'Completed'][i];
  return (
    <article className="card qcard">
      <div className="qtop">
        <span className={`qicon ${q.kind}`} aria-hidden="true"><Icon name={KIND_ICON[q.kind] ?? 'target'} /></span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 2px' }}>{q.title}</h3>
          <p className="small muted" style={{ margin: 0 }}>{speciesName ? `Helps ${speciesName} evolve` : 'Open quest'} · {q.eligibility}</p>
        </div>
      </div>
      <div className="qmeta"><span className="badge mint" style={{ textTransform: 'capitalize' }}>{q.kind}</span><span>{q.difficulty}</span><span><Icon name="clock" />{q.time_estimate}</span><span><b>+{q.xp} XP</b></span></div>
      <div className="stepper" aria-label={`Progress: ${status}`}>
        {SUBMISSION_STEPS.map((n, k) => <span key={n} className={k <= i ? 'on' : ''}>{n}</span>)}
      </div>
      {rejected && <p className="small" style={{ margin: 0, color: 'var(--danger)' }}>A moderator asked for changes.</p>}
      <button className={`btn sm ${i >= 4 ? 'ghost' : i === 3 ? 'gold' : i === 0 ? 'accent' : ''}`} onClick={() => setOpen(true)}>{cta}</button>
      {open && (
        <Modal label={q.title} onClose={() => setOpen(false)}>
          <span className="badge mint" style={{ textTransform: 'capitalize' }}>{q.kind}</span>
          <h2 style={{ margin: '10px 0 6px' }}>{q.title}</h2>
          <p>{q.objective}</p>
          <dl className="kv" style={{ marginBottom: 14 }}>
            <dt>Reward</dt><dd>{q.xp} XP (no financial value)</dd>
            <dt>Eligibility</dt><dd>{q.eligibility}</dd>
            <dt>Status</dt><dd>{status}</dd>
          </dl>
          {rejected && sub?.moderation_note && <p className="notice small">Moderator note: {sub.moderation_note}</p>}
          {i === 0 && <><p className="muted small">Ready when you are. Sign-in is required.</p><button className="btn" disabled={pending} aria-busy={pending} onClick={() => run(() => startQuest(q.id))}>Start quest</button></>}
          {(i === 1) && (
            <>
              <p className="muted small">Do the task, then submit your evidence for review.</p>
              <div className="field"><label htmlFor="qev">Your submission</label><textarea id="qev" rows={3} maxLength={2000} value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Paste a link or describe what you made" /></div>
              <button className="btn" disabled={pending} aria-busy={pending} onClick={() => run(() => submitQuest(q.id, evidence), () => setOpen(false))}>Submit for review</button>
            </>
          )}
          {i === 2 && <p className="muted small">Submitted. A moderator verifies it before any XP is awarded.</p>}
          {i === 3 && <button className="btn gold" disabled={pending} aria-busy={pending} onClick={() => run(() => claimReward(sub!.id), () => setOpen(false))}>Claim +{q.xp} XP</button>}
          {i === 4 && <button className="btn sec" onClick={() => setOpen(false)}>Done</button>}
        </Modal>
      )}
    </article>
  );
}
