import { artFor } from './art';
function mix(hex: string, to: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(to);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const INK = '#2E2118', PAPER = '#FBF6EC', OCHRE = '#DF9C45';
/** Ink outline shared by every creature shape. */
const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const line = (d: string, w = 3, o = 1) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;

/**
 * Creature art in a flat, ink-outlined print style: solid fills, one outline weight, hand-drawn marks, no gradients.
 * Eyes stay at (78,98)/(122,98) in a 200-wide viewBox: EyeTracker relies on it.
 * Each type has its own silhouette; stages add a tail (1), wings + crest (2) and a crown (3).
 */
export function creatureSvg(type: string, stage: number, color: string, alt: string) {
  const c = /^#[0-9a-f]{6}$/i.test(color) ? color : '#6FA287';
  const dk = mix(c, INK, 0.38), lt = mix(c, PAPER, 0.62);
  let back = '', body = '', head = '', front = '', mouth = '';
  const feet = (x1: number, x2: number, rx: number) => `<ellipse cx="${x1}" cy="166" rx="${rx}" ry="7" fill="${dk}" ${S3}/><ellipse cx="${x2}" cy="166" rx="${rx}" ry="7" fill="${dk}" ${S3}/>`;

  if (stage >= 2) back += `<path d="M46 114 Q4 80 24 36 Q46 68 76 94Z" fill="${lt}" ${S}/><path d="M154 114 Q196 80 176 36 Q154 68 124 94Z" fill="${lt}" ${S}/>${line('M34 62 Q40 84 56 98 M166 62 Q160 84 144 98', 2.5, 0.6)}`;

  if (type === 'robot') {
    if (stage >= 1) back += `<path d="M150 148 Q192 150 190 118 Q172 130 148 134Z" fill="${dk}" ${S}/>`;
    back += `<rect x="28" y="92" width="18" height="36" rx="7" fill="${dk}" ${S}/><rect x="154" y="88" width="18" height="36" rx="7" fill="${dk}" ${S}/>`;
    head = `${line('M100 54 V32', 4)}<circle cx="100" cy="26" r="8" fill="${OCHRE}" ${S3}/>`;
    body = `<rect x="44" y="54" width="112" height="108" rx="26" fill="${c}" ${S}/><rect x="57" y="74" width="86" height="60" rx="14" fill="${lt}" ${S3}/><circle cx="64" cy="148" r="3" fill="${INK}"/><circle cx="136" cy="148" r="3" fill="${INK}"/>${line('M88 148 H112', 2.5, 0.55)}`;
    mouth = line('M88 120 H112 M94 116 V124 M100 116 V124 M106 116 V124', 2.5);
    front = `<rect x="64" y="160" width="26" height="12" rx="5" fill="${dk}" ${S3}/><rect x="110" y="160" width="26" height="12" rx="5" fill="${dk}" ${S3}/>`;
  } else if (type === 'alien') {
    if (stage >= 1) back += `<path d="M150 150 Q196 148 186 114 Q170 130 146 136Z" fill="${dk}" ${S}/>`;
    head = `${line('M72 64 Q58 30 38 22 M128 62 Q140 40 158 32', 4)}<circle cx="38" cy="22" r="8" fill="${OCHRE}" ${S3}/><circle cx="158" cy="32" r="6.5" fill="${OCHRE}" ${S3}/>`;
    body = `<ellipse cx="100" cy="112" rx="60" ry="56" fill="${c}" ${S}/><ellipse cx="100" cy="134" rx="34" ry="22" fill="${lt}"/><circle cx="56" cy="124" r="6" fill="${dk}"/><circle cx="68" cy="142" r="4" fill="${dk}"/><circle cx="148" cy="130" r="5" fill="${dk}"/>`;
    mouth = `<ellipse cx="100" cy="121" rx="4.5" ry="5.5" fill="${INK}"/>`;
    front = feet(78, 122, 14);
  } else if (type === 'amphibian') {
    if (stage >= 1) back += `<path d="M152 148 Q196 144 190 114 Q172 128 148 134Z" fill="${dk}" ${S}/>`;
    head = `<circle cx="64" cy="66" r="24" fill="${c}" ${S}/><circle cx="136" cy="66" r="24" fill="${c}" ${S}/>`;
    body = `<ellipse cx="100" cy="118" rx="66" ry="50" fill="${c}" ${S}/><ellipse cx="100" cy="140" rx="40" ry="20" fill="${lt}"/><circle cx="46" cy="118" r="5" fill="${dk}"/><circle cx="154" cy="112" r="6" fill="${dk}"/><circle cx="150" cy="130" r="3.5" fill="${dk}"/>`;
    mouth = line('M70 122 Q100 142 130 122', 3.5);
    front = feet(60, 140, 20);
  } else if (type === 'fantasy') {
    back += `<path d="M146 150 Q202 150 184 90 Q178 116 164 110 Q172 136 142 136Z" fill="${mix(c, OCHRE, 0.5)}" ${S}/>`;
    if (stage >= 1) back += line('M160 142 Q180 136 180 112', 2.5, 0.6);
    head = `<path d="M66 72 L50 18 L96 58Z" fill="${c}" ${S}/><path d="M134 72 L152 22 L104 58Z" fill="${c}" ${S}/><path d="M66 60 L58 32 L80 54Z M134 60 L144 34 L120 54Z" fill="${lt}"/>`;
    body = `<path d="M100 50 C148 50 162 88 158 124 C154 164 46 164 42 124 C38 88 52 50 100 50Z" fill="${c}" ${S}/><path d="M100 110 Q130 118 124 142 Q100 158 76 142 Q70 118 100 110Z" fill="${lt}"/>`;
    mouth = `${line('M88 118 Q100 128 112 118', 3.5)}<path d="M93 121 l3.5 7 l3.5 -6z" fill="${PAPER}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    front = feet(78, 122, 14);
  } else if (type === 'animal') {
    if (stage >= 1) back += `<path d="M150 148 Q198 150 190 110 Q176 132 148 134Z" fill="${dk}" ${S}/>`;
    head = `<circle cx="56" cy="58" r="21" fill="${c}" ${S}/><circle cx="144" cy="60" r="21" fill="${c}" ${S}/><circle cx="56" cy="58" r="9" fill="${lt}"/><circle cx="144" cy="60" r="9" fill="${lt}"/>`;
    body = `<ellipse cx="100" cy="112" rx="60" ry="56" fill="${c}" ${S}/><ellipse cx="100" cy="136" rx="36" ry="22" fill="${lt}"/>${line('M86 144 l6 -6 M97 148 l6 -6 M108 144 l6 -6', 2.5, 0.45)}`;
    mouth = `<ellipse cx="100" cy="112" rx="5" ry="3.5" fill="${INK}"/>${line('M100 115 V120 M91 121 Q95.5 126 100 120 Q104.5 126 109 121', 3)}`;
    front = `${line('M92 56 Q94 42 100 48 Q104 38 110 56', 3.5)}${feet(76, 124, 15)}`;
  } else {
    if (stage >= 1) back += `<path d="M150 148 Q194 148 188 116 Q170 130 148 134Z" fill="${dk}" ${S}/>`;
    head = `${line('M100 42 V24', 4)}<path d="M100 26 Q86 22 82 8 Q98 8 100 26Z" fill="${lt}" ${S3}/><path d="M100 30 Q114 28 120 16 Q104 14 100 30Z" fill="${lt}" ${S3}/>`;
    body = `<path d="M100 40 C132 62 164 92 160 128 C154 168 46 168 40 128 C36 92 68 62 100 40Z" fill="${c}" ${S}/><ellipse cx="100" cy="138" rx="34" ry="20" fill="${lt}"/>${line('M52 118 q4 -5 8 0 M142 126 q4 -5 8 0', 2.5, 0.5)}`;
    mouth = line('M90 120 Q102 127 112 116', 3.5);
    front = feet(78, 122, 14);
  }

  const eyes = type === 'robot'
    ? `<rect x="67" y="87" width="22" height="22" rx="5" fill="${PAPER}" ${S3}/><rect x="111" y="87" width="22" height="22" rx="5" fill="${PAPER}" ${S3}/><g class="pupil"><rect x="74" y="94" width="10" height="10" rx="2" fill="${INK}"/><rect x="118" y="94" width="10" height="10" rx="2" fill="${INK}"/></g>`
    : `<circle cx="78" cy="98" r="10.5" fill="${PAPER}" ${S3}/><circle cx="122" cy="98" r="10.5" fill="${PAPER}" ${S3}/><g class="pupil"><circle cx="79" cy="99" r="5.5" fill="${INK}"/><circle cx="123" cy="99" r="5.5" fill="${INK}"/></g>`;
  if (stage >= 2) front += `<path d="M72 52 L80 38 L90 50 L100 34 L110 50 L120 38 L128 52Z" fill="${dk}" ${S3}/>`;
  if (stage >= 3) front += `<path d="M72 36 L78 14 L91 28 L100 8 L109 28 L122 14 L128 36Z" fill="${OCHRE}" ${S3}/><circle cx="100" cy="27" r="3" fill="${INK}"/>`;
  return `<svg viewBox="0 0 200 190" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="178" rx="52" ry="6" fill="${INK}" opacity=".18"/>${back}${head}${body}${eyes}${mouth}${front}</svg>`;
}

export function Creature({ type, stage, color, alt, className = '' }: { type: string; stage: number; color: string; alt: string; className?: string }) {
  return <div className={`creature ${className}`} dangerouslySetInnerHTML={{ __html: creatureSvg(type, stage, color, alt) }} />;
}

/** One form of a species at thumbnail size: the painting when it exists, otherwise the drawn creature. */
export function FormArt({ slug, type, stage, color, alt, className = '' }: { slug?: string; type: string; stage: number; color: string; alt: string; className?: string }) {
  const art = artFor(slug, stage);
  if (!art) return <div className={`creature ${className}`} dangerouslySetInnerHTML={{ __html: creatureSvg(type, stage, color, alt) }} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <div className={`creature art-thumb ${className}`}><img src={art.sm} alt={alt} width={640} height={480} loading="lazy" decoding="async" /></div>;
}

/* ---------- habitats ---------- */
export type HabitatKey = 'forest' | 'cosmic' | 'cyber' | 'ocean' | 'meadow';
export const habitatKey = (world: string): HabitatKey => {
  const w = world.toLowerCase();
  return w.includes('forest') ? 'forest' : w.includes('cosmic') ? 'cosmic' : w.includes('cyber') ? 'cyber' : w.includes('ocean') ? 'ocean' : 'meadow';
};

/**
 * Decorative habitat backdrop, 4:3, drawn to be cropped (`slice`) into any frame. No text, always aria-hidden.
 * Flat cut-paper shapes with a thin ink outline and a halftone dot screen for texture; muted so creatures stay the focus.
 */
export function habitatSvg(world: string) {
  const k = habitatKey(world);
  const O = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const dots = (id: string, col: string, o: number) => `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><circle cx="2" cy="2" r="1.3" fill="${col}" opacity="${o}"/></pattern>`;
  const open = (bg: string, defs: string) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs><rect width="400" height="300" fill="${bg}"/>`;

  if (k === 'forest') {
    const pine = (x: number, y: number, s: number, col: string) => `<path d="M${x} ${y - 78 * s} L${x + 26 * s} ${y - 26 * s} H${x + 12 * s} L${x + 32 * s} ${y} H${x - 32 * s} L${x - 12 * s} ${y - 26 * s} H${x - 26 * s}Z" fill="${col}" ${O}/><path d="M${x} ${y} V${y + 22 * s}" ${O} fill="none"/>`;
    return `${open('#F1E6D6', dots('df', INK, 0.16))}<circle cx="314" cy="70" r="40" fill="${OCHRE}" ${O}/><path d="M0 196 Q80 140 160 180 T310 158 T400 184 V300 H0Z" fill="#C2CDA9" ${O}/><path d="M0 196 Q80 140 160 180 T310 158 T400 184 V300 H0Z" fill="url(#df)"/>${pine(52, 186, 1.15, '#7C9A72')}${pine(350, 190, 1, '#6B8B66')}${pine(112, 204, 0.7, '#8FAA82')}${pine(296, 208, 0.62, '#8FAA82')}<path d="M0 240 Q120 204 220 234 T400 222 V300 H0Z" fill="#9DB48B" ${O}/><path d="M0 270 Q140 248 260 266 T400 258 V300 H0Z" fill="#7C9A72" ${O}/><path d="M60 262 v-12 M54 250 q6 -12 12 0z M338 268 v-10 M333 258 q5 -10 10 0z" fill="#C9717A" ${O}/></svg>`;
  }
  if (k === 'cosmic') {
    const plus = [[40, 40], [150, 30], [236, 96], [92, 128], [372, 150], [200, 58], [20, 150], [286, 24]].map(([x, y], i) => `<path d="M${x - 4} ${y} h8 M${x} ${y - 4} v8" stroke="#F4DEDA" stroke-width="${i % 3 ? 1.6 : 2.2}" stroke-linecap="round" opacity="${i % 2 ? 0.55 : 0.9}"/>`).join('');
    return `${open('#2F2A40', dots('dc', '#F4DEDA', 0.14))}${plus}<circle cx="318" cy="72" r="36" fill="#F4DEDA" ${O}/><circle cx="306" cy="62" r="7" fill="#E7CBC7"/><circle cx="330" cy="84" r="5" fill="#E7CBC7"/><circle cx="324" cy="58" r="3" fill="#E7CBC7"/><circle cx="74" cy="78" r="16" fill="${OCHRE}" ${O}/><ellipse cx="74" cy="78" rx="30" ry="7" fill="none" stroke="${OCHRE}" stroke-width="2.5" transform="rotate(-18 74 78)"/><path d="M0 236 Q60 200 124 230 Q174 192 236 228 Q304 196 400 232 V300 H0Z" fill="#5E4C6E" ${O}/><path d="M0 236 Q60 200 124 230 Q174 192 236 228 Q304 196 400 232 V300 H0Z" fill="url(#dc)"/><path d="M0 266 Q110 240 220 262 T400 254 V300 H0Z" fill="#45384F" ${O}/><circle cx="96" cy="270" r="9" fill="#3A2F44" ${O}/><circle cx="300" cy="276" r="13" fill="#3A2F44" ${O}/></svg>`;
  }
  if (k === 'cyber') {
    const tower = (x: number, w: number, h: number, col: string) => {
      let win = '';
      for (let r = 0; r < Math.floor(h / 20) - 1; r++) for (let q = 0; q < Math.floor(w / 14); q++) if ((r * 3 + q * 5 + x) % 3 === 0) win += `<rect x="${x + 6 + q * 14}" y="${246 - h + 10 + r * 20}" width="6" height="9" fill="${OCHRE}"/>`;
      return `<rect x="${x}" y="${246 - h}" width="${w}" height="${h + 6}" fill="${col}" ${O}/>${win}`;
    };
    return `${open('#E7CBC7', dots('dy', INK, 0.2))}<circle cx="292" cy="112" r="64" fill="#7D2936" ${O}/><circle cx="292" cy="112" r="64" fill="url(#dy)"/>${tower(6, 46, 150, '#4A4D54')}${tower(58, 36, 104, '#373A40')}${tower(302, 42, 128, '#373A40')}${tower(350, 50, 176, '#4A4D54')}${tower(112, 32, 70, '#5B5E66')}${tower(262, 32, 84, '#5B5E66')}<rect x="-4" y="246" width="408" height="60" fill="#35151B"/><path d="M30 270 H150 M210 280 H370" stroke="#E7CBC7" stroke-width="3" stroke-linecap="round" stroke-dasharray="18 12"/></svg>`;
  }
  if (k === 'ocean') {
    const bub = [[54, 72, 9], [84, 122, 5], [332, 62, 11], [356, 116, 6], [124, 46, 4], [250, 38, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" ${O} opacity=".55"/>`).join('');
    const wave = (y: number) => `M0 ${y} ` + Array.from({ length: 10 }, (_, i) => `q20 -14 40 0`).join(' ') + ` V300 H0Z`;
    return `${open('#D5E3E0', dots('do', INK, 0.14))}${bub}<path d="${wave(168)}" fill="#A9C7C8" ${O}/><path d="${wave(168)}" fill="url(#do)"/><path d="${wave(214)}" fill="#7FA9AE" ${O}/><path d="M42 262 Q30 214 46 194 Q50 222 60 206 Q66 234 56 262Z" fill="#C9717A" ${O}/><path d="M348 264 Q338 220 354 200 Q358 228 368 212 Q374 240 364 264Z" fill="${OCHRE}" ${O}/><path d="M86 266 Q80 232 92 218 Q98 240 96 266Z M314 266 Q308 236 320 224 Q326 244 324 266Z" fill="#5E8C7A" ${O}/><path d="M0 262 Q120 242 240 260 T400 254 V300 H0Z" fill="#EAD9B8" ${O}/><circle cx="110" cy="280" r="4" fill="${INK}" opacity=".35"/><circle cx="292" cy="284" r="5" fill="${INK}" opacity=".35"/></svg>`;
  }
  const cloud = (x: number, y: number, s: number) => `<path d="M${x - 34 * s} ${y} a${14 * s} ${14 * s} 0 0 1 ${16 * s} ${-14 * s} a${20 * s} ${20 * s} 0 0 1 ${36 * s} ${-4 * s} a${14 * s} ${14 * s} 0 0 1 ${18 * s} ${18 * s}Z" fill="${PAPER}" ${O}/>`;
  return `${open('#F6EBD9', dots('dm', INK, 0.14))}<circle cx="88" cy="74" r="34" fill="${OCHRE}" ${O}/>${cloud(280, 84, 1.1)}${cloud(160, 126, 0.7)}<path d="M0 218 Q90 176 190 212 T400 192 V300 H0Z" fill="#CBD6B1" ${O}/><path d="M0 218 Q90 176 190 212 T400 192 V300 H0Z" fill="url(#dm)"/><path d="M0 254 Q120 228 240 250 T400 242 V300 H0Z" fill="#A9BF8E" ${O}/><path d="M60 270 v-14 M330 268 v-12 M112 280 v-10" ${O} fill="none"/><circle cx="60" cy="254" r="5" fill="#C9717A" ${O}/><circle cx="330" cy="254" r="5" fill="${PAPER}" ${O}/><circle cx="112" cy="268" r="4" fill="${OCHRE}" ${O}/></svg>`;
}

/** A creature in its habitat: the painted artwork when it exists (pass `slug`), otherwise the drawn creature on a drawn backdrop. */
export function Scene({ type, stage, color, world, alt, className = '', slug, priority = false }: { type: string; stage: number; color: string; world: string; alt: string; className?: string; slug?: string; priority?: boolean }) {
  const art = artFor(slug, stage);
  if (art) {
    return (
      <div className={`scene scene-art ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art.src} srcSet={`${art.sm} 640w, ${art.src} 1280w`} sizes="(max-width: 600px) 100vw, (max-width: 1080px) 50vw, 640px" alt={alt} width={1280} height={960} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      </div>
    );
  }
  return (
    <div className={`scene scene-${habitatKey(world)} ${className}`}>
      <div className="scene-bg" dangerouslySetInnerHTML={{ __html: habitatSvg(world) }} />
      <Creature type={type} stage={stage} color={color} alt={alt} />
    </div>
  );
}
