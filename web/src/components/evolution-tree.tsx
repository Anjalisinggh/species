'use client';
import { useState } from 'react';
import { FormArt } from '@/lib/creature';
import { Icon } from './icons';
import { RevealButton } from './reveal';

type Crit = { stage: number; label: string; target: number };
export function EvolutionTree({ slug, name, type, color, stage, stageNames, criteria, windowLabel, progress, members }: {
  slug: string; name: string; type: string; color: string; stage: number; stageNames: string[]; criteria: Crit[]; windowLabel: string; progress: number; members: number;
}) {
  const [sel, setSel] = useState(Math.min(stage + 1, 3));
  const unlocked = sel <= stage;
  const next = sel === stage + 1;
  const crit = criteria.filter((c) => c.stage === sel);
  const state = (i: number) => (i < stage ? 'done' : i === stage ? 'cur' : 'locked');
  const hidden = (i: number) => i > stage + 1;
  return (
    <>
      <div className="sechead"><div><h2>Evolution journey</h2><p className="muted">Select a form to see what it takes. Forms the community has reached are permanent.</p></div></div>
      <div className="hpath" role="list">
        {[0, 1, 2, 3].map((i) => {
          const st = state(i);
          return (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className={`linkc ${i <= stage ? 'on' : ''}`} aria-hidden="true" />}
              <button role="listitem" className={`node ${st} ${sel === i ? 'sel' : ''}`} onClick={() => setSel(i)} aria-pressed={sel === i}
                aria-label={`Stage ${i + 1}, ${hidden(i) ? 'hidden form' : stageNames[i]}, ${st === 'locked' ? 'locked' : st === 'cur' ? 'current form' : 'reached'}`}>
                <span className={`badge ${st === 'locked' ? 'line' : st === 'cur' ? '' : 'gold'}`}>
                  <Icon name={st === 'locked' ? 'lock' : st === 'cur' ? 'star' : 'check'} />{st === 'locked' ? 'Locked' : st === 'cur' ? 'Current' : 'Reached'}
                </span>
                <FormArt slug={slug} type={type} stage={i} color={color} alt="" />
                <h4>{hidden(i) ? '???' : stageNames[i]}</h4>
                <div className="num">Stage {i + 1}</div>
              </button>
            </div>
          );
        })}
      </div>
      <div className="detail" aria-live="polite">
        <h3>{hidden(sel) ? 'Hidden form' : stageNames[sel]}</h3>
        <p className="muted">
          {unlocked ? (sel === stage ? `This is ${name} today.` : 'Reached. This form is part of the permanent species history.')
            : next ? `The next form. ${name} evolves the moment every requirement below is met.`
            : 'Not reachable yet. Its name is revealed once the form before it is reached, but the requirements are already public.'}
        </p>
        <dl className="kv">
          <dt>Requirements</dt>
          <dd>{sel === 0 ? 'Starting form, no requirements' : crit.length ? crit.map((c) => `${c.label}: ${c.target.toLocaleString()}`).join(' · ') : 'No criteria published'}</dd>
          <dt>Qualifying window</dt><dd>{windowLabel}</dd>
          <dt>Status</dt><dd>{unlocked ? 'Verified' : next ? `${progress}% of the way there` : 'Locked'}</dd>
        </dl>
        {next && <p className="small muted" style={{ margin: '12px 0 0' }}>Requirements are counted by the server from moderator-verified activity. They are not tied to any financial reward.</p>}
        {unlocked && sel > 0 && (
          <div style={{ marginTop: 14 }}>
            <RevealButton className="btn sm violet" label="Replay reveal" data={{ slug, name, type, color, stageNames, to: sel, members, criteria: crit }} />
          </div>
        )}
      </div>
    </>
  );
}
