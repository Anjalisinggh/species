'use client';
import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/** GET form that applies select changes immediately and still works with Enter / no JS. */
export function FilterForm({ action, children }: { action: string; children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, start] = useTransition();
  const submit = () => {
    const fd = new FormData(ref.current!);
    const qs = new URLSearchParams();
    fd.forEach((v, k) => { if (typeof v === 'string' && v && v !== 'all') qs.set(k, v); });
    start(() => router.push(`${action}${qs.size ? '?' + qs : ''}`, { scroll: false }));
  };
  return (
    <form ref={ref} className="filters" action={action} aria-busy={pending}
      onChange={(e) => { if ((e.target as HTMLElement).tagName === 'SELECT') submit(); }}
      onSubmit={(e) => { e.preventDefault(); submit(); }}>
      {children}
    </form>
  );
}
