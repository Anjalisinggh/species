function mix(hex: string, to: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(to);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function creatureSvg(type: string, stage: number, color: string, alt: string) {
  const dk = mix(color, '#183B35', 0.55), lt = mix(color, '#ffffff', 0.55), eye = '#183B35';
  let back = '', body = '', head = '', front = '';
  if (stage >= 2) back += `<path d="M40 110 Q5 70 28 40 Q45 75 70 95Z M160 110 Q195 70 172 40 Q155 75 130 95Z" fill="${mix(color, '#7774E8', 0.5)}" opacity=".85"/>`;
  if (stage >= 1) back += `<path d="M150 150 Q195 150 188 118 Q170 130 148 135Z" fill="${dk}"/>`;
  if (type === 'robot') {
    body = `<rect x="45" y="55" width="110" height="105" rx="26" fill="${color}"/><rect x="58" y="72" width="84" height="52" rx="16" fill="${lt}"/>`;
    head = `<rect x="97" y="30" width="6" height="26" fill="${dk}"/><circle cx="100" cy="28" r="8" fill="#F2C66D"/>`;
  } else if (type === 'alien') {
    body = `<ellipse cx="100" cy="110" rx="58" ry="56" fill="${color}"/><ellipse cx="100" cy="124" rx="38" ry="30" fill="${lt}" opacity=".7"/>`;
    head = `<path d="M70 62 Q55 25 40 22 M130 62 Q145 25 160 22" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="40" cy="22" r="7" fill="#F2C66D"/><circle cx="160" cy="22" r="7" fill="#F2C66D"/>`;
  } else if (type === 'amphibian') {
    body = `<ellipse cx="100" cy="116" rx="62" ry="50" fill="${color}"/><ellipse cx="100" cy="132" rx="40" ry="26" fill="${lt}"/>`;
    head = `<circle cx="66" cy="64" r="22" fill="${color}"/><circle cx="134" cy="64" r="22" fill="${color}"/>`;
  } else if (type === 'fantasy') {
    body = `<ellipse cx="100" cy="112" rx="56" ry="54" fill="${color}"/><ellipse cx="100" cy="126" rx="36" ry="28" fill="${lt}" opacity=".7"/>`;
    head = `<path d="M72 64 L62 22 L90 56Z M128 64 L138 22 L110 56Z" fill="#F2C66D"/>`;
  } else if (type === 'animal') {
    body = `<ellipse cx="100" cy="112" rx="58" ry="54" fill="${color}"/><ellipse cx="100" cy="128" rx="36" ry="26" fill="${lt}"/>`;
    head = `<circle cx="58" cy="60" r="20" fill="${color}"/><circle cx="58" cy="60" r="10" fill="${lt}"/><circle cx="142" cy="60" r="20" fill="${color}"/><circle cx="142" cy="60" r="10" fill="${lt}"/>`;
  } else {
    body = `<path d="M100 48 C150 48 168 90 160 128 C152 165 50 165 40 128 C32 90 50 48 100 48Z" fill="${color}"/><ellipse cx="100" cy="130" rx="36" ry="26" fill="${lt}" opacity=".7"/>`;
    head = `<path d="M100 18 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#F2C66D"/>`;
  }
  const face = `<circle cx="78" cy="98" r="9" fill="#fff"/><circle cx="122" cy="98" r="9" fill="#fff"/><g class="pupil"><circle cx="80" cy="100" r="5" fill="${eye}"/><circle cx="124" cy="100" r="5" fill="${eye}"/></g><path d="M88 118 Q100 130 112 118" stroke="${eye}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (stage >= 1) front += `<circle cx="64" cy="116" r="7" fill="#ff9aa8" opacity=".55"/><circle cx="136" cy="116" r="7" fill="#ff9aa8" opacity=".55"/>`;
  if (stage >= 2) front += `<path d="M70 52 L78 40 L88 52 L100 36 L112 52 L122 40 L130 52" fill="none" stroke="${dk}" stroke-width="4" stroke-linejoin="round"/>`;
  if (stage >= 3) front += `<path d="M72 36 L80 18 L92 30 L100 12 L108 30 L120 18 L128 36Z" fill="#F2C66D" stroke="#d9a83f" stroke-width="2"/><ellipse cx="100" cy="14" rx="40" ry="7" fill="none" stroke="#F2C66D" stroke-width="3" opacity=".7"/>`;
  return `<svg viewBox="0 0 200 190" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="176" rx="52" ry="8" fill="#183B35" opacity=".1"/>${back}${body}${head}${face}${front}</svg>`;
}

export function Creature({ type, stage, color, alt, className = '' }: { type: string; stage: number; color: string; alt: string; className?: string }) {
  return <div className={`creature ${className}`} dangerouslySetInnerHTML={{ __html: creatureSvg(type, stage, color, alt) }} />;
}
