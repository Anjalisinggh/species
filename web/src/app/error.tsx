'use client';
import { creatureSvg } from '@/lib/creature';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap" style={{ padding: '48px 16px' }}>
      <div className="empty" role="alert">
        <div className="creature" dangerouslySetInnerHTML={{ __html: creatureSvg('custom', 0, '#A59AF5', '') }} />
        <h3>Something went wrong</h3>
        <p className="muted">We couldn&apos;t load this page. Nothing was changed. Please try again.</p>
        <button className="btn" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
