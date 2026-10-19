'use client';
import { Suspense, useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Scene } from '@/lib/creature';
import { signIn, signUp, type Result } from '../actions';

function Form() {
  const next = useSearchParams().get('next') ?? '/';
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [state, action, pending] = useActionState<Result | null, FormData>(mode === 'in' ? signIn : signUp, null);
  return (
    <div className="wrap">
      <div className="card authwrap">
        <Scene slug="page-login" type="alien" stage={0} color="#A59AF5" world="Cosmic" alt="" priority />
        <div className="authbox">
          <h1>{mode === 'in' ? 'Welcome back' : 'Join Firstform'}</h1>
          <p className="muted">{mode === 'in' ? 'Sign in to follow species, take on quests and publish your own.' : 'Just an email and a password. No wallet needed.'}</p>
          <form action={action}>
            <input type="hidden" name="next" value={next} />
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="field"><label htmlFor="pw">Password</label><input id="pw" name="password" type="password" required minLength={8} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />{mode === 'up' && <div className="hint">At least 8 characters</div>}</div>
            {state?.error && <div className="err" role="alert">{state.error}</div>}
            {state?.msg && <div className="ok" role="status">{state.msg}</div>}
            <button className="btn block" disabled={pending} aria-busy={pending}>{mode === 'in' ? 'Sign in' : 'Create account'}</button>
          </form>
          <p className="small muted" style={{ textAlign: 'center', margin: '18px 0 0' }}>
            {mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
            <button className="linkbtn" style={{ color: 'var(--ink)', fontWeight: 600 }} onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>{mode === 'in' ? 'Create an account' : 'Sign in'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default function Login() { return <Suspense><Form /></Suspense>; }
