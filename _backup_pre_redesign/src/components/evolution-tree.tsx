'use client';
import { useState } from 'react';
import { creatureSvg } from '@/lib/creature';
import { RevealButton } from './reveal';

type Crit = { stage: number; label: string; target: number };
export function EvolutionTree({ slug, name, type, color, stage, stageNames, criteria, windowLabel, progress, members }: {
  slug: string; name: string; type: string; color: string; stage: number; stageNames: string[]; criteria: Crit[]; windowLabel: string; progress: number; members: number;
}) {
  const [sel, setSel] = useState(Math.min(stage + 1, 3));
  const unlocked = sel <= stage;
  const crit = criteria.filter((c) => c.stage === sel);
  const state = (i: number) => (i < stage ? 'done' : i === stage ? 'cur' : 'locked');
  return (
    <>
      <p className="muted">Select a form. Achieved forms are permanent; market-price changes never reverse them.</p>
      <div className="hpath" role="list">
        {[0, 1, 2, 3].map((i) => {
          const st = state(i);
          return (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className={`linkc ${i <= stage ? 'on' : ''}`} />}
              <button role="listitem" className={`node ${st} ${sel === i ? 'sel' : ''}`} onClick={() => setSel(i)}
                aria-label={`${stageNames[i]}, ${st === 'locked' ? 'locked' : st === 'cur' ? 'current form' : 'unlocked'}`}>
                <span className={`badge ${st === 'locked' ? 'line' : st === 'cur' ? '' : 'gold'}`}>{st === 'locked' ? '🔒 Locked' : st === 'cur' ? 'Current' : '✓ Unlocked'}</span>
                <div className="creature" dangerouslySetInnerHTML={{ __html: creatureSvg(type, i, color, stageNames[i] + (st === 'locked' ? ' silhouette' : '')) }} />
                <h4 style={{ margin: '6px 0 0' }}>{st === 'locked' && i > stage + 1 ? '???' : stageNames[i]}</h4>
              </button>
            </div>
          );
        })}
      </div>
      <div className="detail">
        <h3>{unlocked || sel === stage + 1 ? stageNames[sel] : 'Hidden form'}</h3>
        <p className="muted">{unlocked ? 'Unlocked. This is part of the permanent species history.' : 'Locked. Requirements are exact, public and verified by the server. Unlocking is not tied to any financial reward.'}</p>
        <dl className="kv">
          <dt>Requirements</dt><dd>{sel === 0 ? 'Starting form' : crit.map((c) => `${c.label}: ${c.target}`).join(' · ')}</dd>
          <dt>Qualifying window</dt><dd>{windowLabel}</dd>
          <dt>Status</dt><dd>{unlocked ? '✓ Verified' : sel === stage + 1 ? `${progress}% complete · pending verification` : 'Not yet reachable'}</dd>
        </dl>
        {unlocked && sel > 0 && (
          <div style={{ marginTop: 12 }}>
            <RevealButton className="btn sm violet" label="Replay reveal" data={{ slug, name, type, color, stageNames, to: sel, members, criteria: crit }} />
          </div>
        )}
      </div>
    </>
  );
}
