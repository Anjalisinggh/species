'use client';
import { Suspense, useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, signUp, type Result } from '../actions';

function Form() {
  const next = useSearchParams().get('next') ?? '/';
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [state, action, pending] = useActionState<Result | null, FormData>(mode === 'in' ? signIn : signUp, null);
  return (
    <div className="authbox card pad">
      <h1 style={{ fontSize: '1.8rem' }}>{mode === 'in' ? 'Welcome back' : 'Join Species.family'}</h1>
      <p className="muted">No wallet needed. Just an email and a password.</p>
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="pw">Password</label><input id="pw" name="password" type="password" required minLength={8} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></div>
        {state?.error && <div className="err" role="alert">{state.error}</div>}
        {state?.msg && <div className="ok" role="status">{state.msg}</div>}
        <button className="btn" style={{ width: '100%' }} disabled={pending}>{mode === 'in' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
        {mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
        <button className="linkbtn" style={{ color: 'var(--ink)' }} onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>{mode === 'in' ? 'Create an account' : 'Sign in'}</button>
      </p>
    </div>
  );
}
export default function Login() { return <Suspense><Form /></Suspense>; }
