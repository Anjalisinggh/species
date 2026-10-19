'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Result } from '@/app/actions';

type Ctx = { toast: (m: string) => void };
const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; m: string }[]>([]);
  const toast = useCallback((m: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, m }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toasts" aria-live="polite">{items.map((i) => <div key={i.id} className="toast">{i.m}</div>)}</div>
    </ToastCtx.Provider>
  );
}

/** Runs a server action, shows a toast, and redirects to sign-in when the user isn't authenticated. */
export function useAction() {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = useCallback((fn: () => Promise<Result>, after?: (r: Result) => void) => {
    start(async () => {
      const r = await fn();
      if (r.ok) { if (r.msg) toast(r.msg); after?.(r); router.refresh(); }
      else {
        toast(r.error ?? 'Something went wrong');
        if (r.error?.toLowerCase().includes('sign in')) router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      }
    });
  }, [toast, router]);
  return { run, pending };
}

export function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button:not(.x),input,textarea,select')?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} ref={ref}>
        <button className="iconbtn x" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}
