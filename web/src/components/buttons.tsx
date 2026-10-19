'use client';
import { useState } from 'react';
import { Modal, useAction, useToast } from './ui';
import { toggleFollow, report, postContribution, voteLore, setPrivacy } from '@/app/actions';

export function FollowButton({ speciesId, following, className = '' }: { speciesId: string; following: boolean; className?: string }) {
  const { run, pending } = useAction();
  return (
    <button className={`btn sm ${following ? 'ghost' : 'accent'} ${className}`} aria-pressed={following} disabled={pending} aria-busy={pending}
      onClick={() => run(() => toggleFollow(speciesId, following))}>
      {following ? '✓ Following' : '+ Follow'}
    </button>
  );
}

export function ReportButton({ speciesId, name, variant = 'chip', contributionId }: { speciesId: string; name: string; variant?: 'chip' | 'btn' | 'link'; contributionId?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Spam or scam');
  const { run, pending } = useAction();
  const cls = variant === 'chip' ? 'report' : variant === 'btn' ? 'btn ghost' : 'linkbtn';
  return (
    <>
      <button className={cls} onClick={() => setOpen(true)} aria-label={`Report ${name}`}>Report</button>
      {open && (
        <Modal label="Report" onClose={() => setOpen(false)}>
          <h2>Report {name}</h2>
          <p className="muted">Tell us what&apos;s wrong. Reports are reviewed by moderators.</p>
          <div className="field"><label htmlFor="reason" className="sr">Reason</label>
            <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {['Spam or scam', 'Offensive content', 'Impersonation', 'Misleading financial claims', 'Other'].map((r) => <option key={r}>{r}</option>)}
            </select></div>
          <button className="btn" disabled={pending} onClick={() => run(() => report(speciesId, reason, contributionId), () => setOpen(false))}>Submit report</button>
        </Modal>
      )}
    </>
  );
}

export function ShareButton({ name }: { name: string }) {
  const { toast } = useToast();
  return (
    <button className="btn sec" onClick={async () => {
      const url = window.location.href;
      try { if (navigator.share) await navigator.share({ title: `${name} on Firstform`, url }); else { await navigator.clipboard.writeText(url); toast('Link copied'); } } catch { /* cancelled */ }
    }}>Share</button>
  );
}

export function ContributionForm({ speciesId }: { speciesId: string }) {
  const [body, setBody] = useState('');
  const { run, pending } = useAction();
  return (
    <>
      <div className="field"><label htmlFor="post">Share something (art link, meme, lore)</label>
        <textarea id="post" rows={2} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Be kind. Submissions are reviewed before they go public." /></div>
      <button className="btn sm" disabled={pending} onClick={() => run(() => postContribution(speciesId, body), () => setBody(''))}>Submit for review</button>
    </>
  );
}

export function LoreVote({ speciesId, options, counts }: { speciesId: string; options: string[]; counts: number[] }) {
  const { run, pending } = useAction();
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <>
      {options.map((o, i) => (
        <button key={o} className="btn ghost sm" style={{ display: 'flex', width: '100%', marginBottom: 8, justifyContent: 'space-between' }} disabled={pending} onClick={() => run(() => voteLore(speciesId, i))}>
          {o}<span>{total ? Math.round((counts[i] / total) * 100) : 0}%</span>
        </button>
      ))}
      <p className="small muted">{total} vote{total === 1 ? '' : 's'} so far. One vote per member.</p>
    </>
  );
}

export function PrivacyToggle({ value }: { value: boolean }) {
  const { run, pending } = useAction();
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
      <input type="checkbox" style={{ width: 20, height: 20 }} defaultChecked={value} disabled={pending} onChange={(e) => run(() => setPrivacy(e.target.checked))} /> Make my profile private
    </label>
  );
}
