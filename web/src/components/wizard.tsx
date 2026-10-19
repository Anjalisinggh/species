'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { creatureSvg, Scene } from '@/lib/creature';
import { useAction } from './ui';
import { createSpecies } from '@/app/actions';
import { STAGE_NAMES } from '@/lib/constants';

const STEPS = ['Identity', 'Creature type', 'Personality', 'Habitat', 'Appearance', 'Evolution', 'Review'];
const TYPES: [string, string, string][] = [['animal', 'Animal', 'Furry, feathery or scaly'], ['amphibian', 'Amphibian', 'Hoppy and slippery'], ['alien', 'Alien', 'From beyond'], ['fantasy', 'Fantasy', 'Dragons, sprites, more'], ['robot', 'Robot', 'Beep boop'], ['custom', 'Custom concept', 'Describe your own']];
const PERS: [string, string][] = [['Chaotic', 'Unpredictable'], ['Wholesome', 'Kind and warm'], ['Competitive', 'Loves a challenge'], ['Mysterious', 'Speaks in riddles'], ['Curious', 'Asks everything']];
const WORLDS = ['Enchanted forest', 'Cosmic', 'Cyberpunk', 'Ocean', 'Custom'];
const COLORS: Record<string, string[]> = { 'Enchanted forest': ['#62B88A', '#8fb86a', '#4aa38a'], Cosmic: ['#9b8cf0', '#7774E8', '#c08be8'], Cyberpunk: ['#56c2d9', '#7774E8', '#e86fb3'], Ocean: ['#58b5d8', '#4a9fd0', '#62B88A'], Custom: ['#e9b44c', '#ef8f5e', '#62B88A'] };

type W = { step: number; name: string; desc: string; type: string; pers: string; world: string; variant: number; regens: number; story: string };
const blank: W = { step: 0, name: '', desc: '', type: '', pers: '', world: '', variant: 0, regens: 0, story: '' };
const art = (type: string, stage: number, color: string, alt: string) => ({ __html: creatureSvg(type || 'custom', stage, color, alt) });

export function Wizard() {
  const [w, setW] = useState<W>(blank);
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(false);
  const { run, pending } = useAction();
  const router = useRouter();

  useEffect(() => { try { const d = localStorage.getItem('sf:wiz'); if (d) setW({ ...blank, ...JSON.parse(d) }); } catch { /* ignore */ } setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem('sf:wiz', JSON.stringify(w)); } catch { /* ignore */ } }, [w, ready]);

  const set = (p: Partial<W>) => { setErr(''); setW((x) => ({ ...x, ...p })); };
  const palette = COLORS[w.world] ?? COLORS.Custom;
  const color = palette[w.variant] ?? palette[0];
  const draftStory = `${w.name || 'Your species'} was born in the ${(w.world || 'unknown').toLowerCase()}, a ${(w.pers || 'curious').toLowerCase()} ${w.type || 'creature'} with a story still waiting to be written by its community.`;

  function next() {
    if (w.step === 0 && w.name.trim().length < 2) return setErr('Give your species a name (at least 2 characters).');
    if (w.step === 1 && !w.type) return setErr('Choose a creature type to continue.');
    if (w.step === 2 && !w.pers) return setErr('Choose a personality to continue.');
    if (w.step === 3 && !w.world) return setErr('Choose a world to continue.');
    if (w.step < 6) return set({ step: w.step + 1, story: w.step === 3 ? '' : w.story });
    run(() => createSpecies({ name: w.name, description: w.desc, type: w.type, personality: w.pers, world: w.world, color, story: w.story || draftStory }),
      (r) => { try { localStorage.removeItem('sf:wiz'); } catch { /* ignore */ } router.push(`/species/${r.slug}`); });
  }

  const opt = (label: string, sub: string | undefined, on: boolean, click: () => void) => (
    <button key={label} className="opt" type="button" aria-pressed={on} onClick={click}>{label}{sub && <small>{sub}</small>}</button>
  );

  return (
    <div className="wrap">
      <div className="pagehead"><h1>Create a species</h1><p className="muted">Bring your creature to life in about two minutes. Your draft is saved on this device as you go.</p></div>
      <ol className="wsteps" aria-label="Steps">
        {STEPS.map((n, i) => <li key={n} className={i === w.step ? 'on' : i < w.step ? 'done' : ''} aria-current={i === w.step ? 'step' : undefined}><b>{i < w.step ? '✓' : i + 1}</b><span>{n}</span></li>)}
      </ol>
      <div className="wiz">
        <div className="card wpanel">
          <p className="small muted" style={{ margin: '0 0 6px' }}>Step {w.step + 1} of {STEPS.length}</p>
          {w.step === 0 && (
            <>
              <h2>Name your species</h2>
              <p className="muted">A good name is short and easy to say out loud.</p>
              <div className="field"><label htmlFor="w-name">Species name</label><input id="w-name" maxLength={24} value={w.name} aria-invalid={!!err} aria-describedby="w-name-hint" onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Lunari" /><div className="hint" id="w-name-hint"><span>2 to 24 characters</span><span>{w.name.length}/24</span></div></div>
              <div className="field"><label htmlFor="w-desc">Short description</label><textarea id="w-desc" rows={3} maxLength={140} value={w.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="One or two sentences about who they are" /><div className="hint"><span>Shown on cards and in search</span><span>{w.desc.length}/140</span></div></div>
            </>
          )}
          {w.step === 1 && <><h2>What kind of creature?</h2><div className="opts">{TYPES.map(([k, l, s]) => opt(l, s, w.type === k, () => set({ type: k })))}</div></>}
          {w.step === 2 && <><h2>Pick a personality</h2><div className="opts">{PERS.map(([k, s]) => opt(k, s, w.pers === k, () => set({ pers: k })))}</div></>}
          {w.step === 3 && <><h2>Choose its habitat</h2><div className="opts">{WORLDS.map((k) => opt(k, undefined, w.world === k, () => set({ world: k })))}</div></>}
          {w.step === 4 && (
            <>
              <h2>Choose a look</h2>
              <p className="muted">Pick a colour variation. You can shuffle up to 3 times to keep things fair ({3 - w.regens} left).</p>
              <div className="variants">{palette.map((c, i) => <button key={c} type="button" className="variant" aria-pressed={w.variant === i} aria-label={`Variation ${i + 1}`} onClick={() => set({ variant: i })} dangerouslySetInnerHTML={art(w.type, 0, c, `Concept variation ${i + 1}`)} />)}</div>
              <div className="btnrow" style={{ margin: '14px 0' }}><button className="btn sec sm" disabled={w.regens >= 3} onClick={() => set({ variant: (w.variant + 1) % 3, regens: w.regens + 1 })}>↻ Shuffle</button></div>
              <div className="field"><label htmlFor="w-story">Origin story (edit freely)</label><textarea id="w-story" rows={4} maxLength={1000} value={w.story || draftStory} onChange={(e) => set({ story: e.target.value })} /></div>
            </>
          )}
          {w.step === 5 && (
            <>
              <h2>Evolution journey</h2>
              <p className="muted">Criteria are published before anyone contributes, and can&apos;t be silently changed afterwards.</p>
              <div className="tree">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    {i > 0 && <span className="arrow">→</span>}
                    <div className="card" style={{ padding: 10, textAlign: 'center', minWidth: 130, flex: 1 }}>
                      <div style={{ width: 100, margin: 'auto' }} dangerouslySetInnerHTML={art(w.type, i, color, `Stage ${i + 1}`)} />
                      <b>{STAGE_NAMES[i]}</b>
                      <div className="small muted">{i === 0 ? 'Starting form' : ['5 verified quests · 3 contributors', '20 verified quests · 5 approved posts', '60 verified quests · 15 contributors'][i - 1]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {w.step === 6 && (
            <>
              <h2>Review and publish</h2>
              <dl className="kv" style={{ marginBottom: 16 }}>
                <dt>Name</dt><dd>{w.name}</dd>
                <dt>Description</dt><dd>{w.desc || 'None'}</dd>
                <dt>Creature type</dt><dd style={{ textTransform: 'capitalize' }}>{w.type}</dd>
                <dt>Personality</dt><dd>{w.pers}</dd>
                <dt>Habitat</dt><dd>{w.world}</dd>
                <dt>Origin story</dt><dd>{w.story || draftStory}</dd>
              </dl>
              <p className="notice violet small">Everything works without a token. Token details, if ever added, are a separate step with explicit risk disclosure. You need to be signed in to publish.</p>
            </>
          )}
          {err && <div className="field"><div className="err" role="alert">{err}</div></div>}
          <div className="wnav">
            <button className="btn sec" disabled={w.step === 0 || pending} onClick={() => set({ step: w.step - 1 })}>Back</button>
            <button className="btn" disabled={pending} aria-busy={pending} onClick={next}>{w.step === 6 ? (pending ? 'Publishing…' : 'Publish species') : 'Continue'}</button>
          </div>
        </div>
        <aside className="card wpreview" aria-label="Live preview">
          <Scene type={w.type || 'custom'} stage={0} color={color} world={w.world || 'Custom'} alt={`Preview of ${w.name || 'your species'}`} />
          <div className="body">
            <div className="small muted">Live preview</div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{w.name.trim() || 'Your species'}</h3>
            <div className="chips"><span className="badge mint">Stage 1 · {STAGE_NAMES[0]}</span>{w.pers && <span className="chip">{w.pers}</span>}{w.world && <span className="chip">{w.world}</span>}</div>
            <p className="small muted" style={{ margin: 0 }}>{w.desc || 'Your description will appear here.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
