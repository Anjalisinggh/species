import Link from 'next/link';
import { EmptyState } from '@/components/cards';

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '48px 16px' }}>
      <EmptyState title="This creature wandered off">
        <p className="muted">We couldn&apos;t find that page. It may have moved, or never existed.</p>
        <Link className="btn" href="/explore">Explore species</Link>
      </EmptyState>
    </div>
  );
}
