/* Species.family — clickable prototype (vanilla JS, hash routing) */
(function () {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('sf:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sf:' + k, JSON.stringify(v)); } catch (e) {} }
};
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function mix(hex, to, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 3 - 1), 16));
  const a = p(hex), b = p(to);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2600);
}

/* ---------- creature art ---------- */
function creature(type, stage, color, alt) {
  const dk = mix(color, '#183B35', .55), lt = mix(color, '#ffffff', .55), eye = '#183B35';
  let back = '', body = '', head = '', front = '';
  const S = stage || 0;
  if (S >= 2) back += `<path d="M40 110 Q5 70 28 40 Q45 75 70 95Z M160 110 Q195 70 172 40 Q155 75 130 95Z" fill="${mix(color, '#7774E8', .5)}" opacity=".85"/>`;
  if (S >= 1) back += `<path d="M150 150 Q195 150 188 118 Q170 130 148 135Z" fill="${dk}"/>`;
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
  const face = `<circle cx="78" cy="98" r="9" fill="#fff"/><circle cx="122" cy="98" r="9" fill="#fff"/><circle cx="80" cy="100" r="5" fill="${eye}"/><circle cx="124" cy="100" r="5" fill="${eye}"/>
    <path d="M88 118 Q100 130 112 118" stroke="${eye}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (S >= 1) front += `<circle cx="64" cy="116" r="7" fill="#ff9aa8" opacity=".55"/><circle cx="136" cy="116" r="7" fill="#ff9aa8" opacity=".55"/>`;
  if (S >= 2) front += `<path d="M70 52 L78 40 L88 52 L100 36 L112 52 L122 40 L130 52" fill="none" stroke="${dk}" stroke-width="4" stroke-linejoin="round"/>`;
  if (S >= 3) front += `<path d="M72 36 L80 18 L92 30 L100 12 L108 30 L120 18 L128 36Z" fill="#F2C66D" stroke="#d9a83f" stroke-width="2"/><ellipse cx="100" cy="14" rx="40" ry="7" fill="none" stroke="#F2C66D" stroke-width="3" opacity=".7"/>`;
  return `<svg viewBox="0 0 200 190" role="img" aria-label="${esc(alt || 'Creature artwork')}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="176" rx="52" ry="8" fill="#183B35" opacity=".1"/>${back}${body}${head}${face}${front}</svg>`;
}

/* ---------- data ---------- */
const STAGE_NAMES = ['Hatchling', 'Sprout', 'Wanderer', 'Ascended'];
const SPECIES = [
  { id: 'mossling', name: 'Mossling', type: 'animal', personality: 'Wholesome', world: 'Enchanted forest', color: '#62B88A', stage: 1, members: 1284, progress: 72, creator: 'fernwright', tags: ['Wholesome', 'Creative'], filters: ['new', 'active', 'creative'], act: 94, created: 'Aug 12, 2026', token: false,
    desc: 'A shy forest cub who grows moss wherever friends gather. Mossling remembers every kindness.',
    names: ['Mossling Pup', 'Mossling Sprout', 'Elder Moss', 'Grove Guardian'],
    crit: [['Verified quests completed by community', 780, 1000], ['Original art submissions approved', 41, 50], ['Unique contributors this window', 128, 150]], window: '14-day window · closes Oct 21' },
  { id: 'zapkin', name: 'Zapkin', type: 'robot', personality: 'Chaotic', world: 'Cyberpunk', color: '#7774E8', stage: 2, members: 3420, progress: 91, creator: 'volt.hex', tags: ['Chaotic', 'Competitive'], filters: ['active', 'evolving', 'creative'], act: 99, created: 'Jun 30, 2026', token: true,
    desc: 'A pocket-sized bot that rewrites its own jokes. Nobody knows what Zapkin will say next — including Zapkin.',
    names: ['Zap Chip', 'Zapkin', 'Overclock Zapkin', 'Zapkin Prime'],
    crit: [['Verified quests completed by community', 4550, 5000], ['Lore chapters voted on', 3, 3], ['Unique contributors this window', 410, 450]], window: '30-day window · closes Oct 14' },
  { id: 'nebulo', name: 'Nebulo', type: 'alien', personality: 'Mysterious', world: 'Cosmic', color: '#9b8cf0', stage: 0, members: 612, progress: 34, creator: 'starloom', tags: ['Mysterious', 'Curious'], filters: ['new', 'seasonal'], act: 61, created: 'Oct 02, 2026', token: false,
    desc: 'Nebulo drifts between constellations, collecting forgotten wishes. It speaks only in riddles.',
    names: ['Nebulo Spark', 'Nebulo Drift', 'Nebulo Nova', 'Nebulo Eternal'],
    crit: [['Verified quests completed by community', 170, 500], ['Riddles solved together', 12, 40], ['Unique contributors this window', 38, 100]], window: '14-day window · closes Oct 24' },
  { id: 'bubblix', name: 'Bubblix', type: 'amphibian', personality: 'Curious', world: 'Ocean', color: '#58b5d8', stage: 1, members: 905, progress: 58, creator: 'tidepool', tags: ['Curious', 'Wholesome'], filters: ['active', 'creative', 'seasonal'], act: 78, created: 'Sep 05, 2026', token: false,
    desc: 'A tiny tide-pool frog that blows bubbles shaped like questions. Every bubble holds a secret.',
    names: ['Bubblix Egg', 'Bubblix', 'Tidal Bubblix', 'Abyss Oracle'],
    crit: [['Verified quests completed by community', 580, 1000], ['Community stories approved', 19, 30], ['Unique contributors this window', 77, 120]], window: '14-day window · closes Oct 28' },
  { id: 'emberfox', name: 'Emberfox', type: 'fantasy', personality: 'Competitive', world: 'Enchanted forest', color: '#ef8f5e', stage: 2, members: 2210, progress: 83, creator: 'cinder.cat', tags: ['Competitive', 'Chaotic'], filters: ['active', 'evolving'], act: 88, created: 'Jul 19, 2026', token: true,
    desc: 'A flame-tailed trickster who challenges every species it meets. Emberfox never loses gracefully.',
    names: ['Ember Kit', 'Emberfox', 'Blazefox', 'Solar Kitsune'],
    crit: [['Verified quests completed by community', 2490, 3000], ['Rivalry challenges won', 4, 5], ['Unique contributors this window', 240, 300]], window: '30-day window · closes Oct 19' },
  { id: 'glimmer', name: 'Glimmer', type: 'custom', personality: 'Wholesome', world: 'Cosmic', color: '#e9b44c', stage: 0, members: 248, progress: 18, creator: 'lumenly', tags: ['Wholesome', 'Creative'], filters: ['new', 'creative'], act: 40, created: 'Oct 06, 2026', token: false,
    desc: 'A drop of starlight that learned to smile. Glimmer glows brighter with every shared drawing.',
    names: ['Glimmer Drop', 'Glimmer Flare', 'Glimmer Aura', 'Glimmer Sun'],
    crit: [['Verified quests completed by community', 45, 250], ['Original art submissions approved', 6, 25], ['Unique contributors this window', 21, 60]], window: '14-day window · closes Oct 30' }
];
const CUSTOM = store.get('custom', []);
CUSTOM.forEach(s => SPECIES.unshift(s));
const byId = id => SPECIES.find(s => s.id === id);

const QUESTS = [
  { id: 'q1', kind: 'daily', title: 'Original meme for Zapkin', diff: 'Easy', time: '5 min', xp: 40, species: 'zapkin', obj: 'Submit one original meme starring Zapkin. No reposts — we check for duplicates.', elig: 'Open to all members' },
  { id: 'q2', kind: 'daily', title: 'Welcome a new member', diff: 'Easy', time: '2 min', xp: 20, species: 'mossling', obj: 'Say hello to someone who joined this week in the Mossling community feed.', elig: 'Open to all members' },
  { id: 'q3', kind: 'daily', title: 'Vote on a story choice', diff: 'Easy', time: '1 min', xp: 15, species: 'bubblix', obj: 'Pick what Bubblix does next in Chapter 3. Voting is open to followers.', elig: 'Followers of Bubblix' },
  { id: 'q4', kind: 'weekly', title: 'Solve the Nebulo riddle', diff: 'Medium', time: '15 min', xp: 90, species: 'nebulo', obj: 'Decode three constellation riddles and submit your reasoning, not just the answer.', elig: 'Level 2 or higher' },
  { id: 'q5', kind: 'weekly', title: 'Draw Emberfox mid-leap', diff: 'Medium', time: '30 min', xp: 120, species: 'emberfox', obj: 'Original artwork only. Entries pass quality review before they appear publicly.', elig: 'Open to all members' },
  { id: 'q6', kind: 'community', title: 'Mossling: 1,000 kindness notes', diff: 'Team', time: 'Ongoing', xp: 60, species: 'mossling', obj: 'The community writes 1,000 kindness notes together. Your notes count toward the shared bar.', elig: 'Open to all members' },
  { id: 'q7', kind: 'seasonal', title: 'Harvest Moon lore trail', diff: 'Hard', time: '45 min', xp: 250, species: 'glimmer', obj: 'Follow six hidden lore clues across species profiles and assemble the Harvest Moon story.', elig: 'Season 1 · ends Nov 15' },
  { id: 'q8', kind: 'seasonal', title: 'Spooky forms fan art', diff: 'Medium', time: '30 min', xp: 150, species: 'zapkin', obj: 'Reimagine any species in a spooky-season costume. Cosmetic only, no rewards beyond XP.', elig: 'Season 1 · ends Oct 31' }
];
const QSTATES = ['Not started', 'In progress', 'Submitted', 'Verified', 'Rewarded'];
const ACTIVITY = [
  ['🎯', 'ember_ryn completed “Draw Emberfox mid-leap”', '12 min ago'],
  ['🖼️', 'New artwork approved: “Moss under moonlight”', '1 h ago'],
  ['🗳️', '214 members voted on Chapter 3 direction', '3 h ago'],
  ['⭐', 'Milestone reached: 700 verified quests', 'Yesterday'],
  ['🌱', 'Evolution to the next form is 72% unlocked', 'Yesterday']
];

/* ---------- state ---------- */
const S = {
  follows: store.get('follows', ['mossling']),
  qstate: store.get('qstate', {}),
  xp: store.get('xp', 135),
  filter: 'all', q: '', sort: 'activity',
  qtab: 'daily',
  chat: {},
  wiz: null
};
const save = () => { store.set('follows', S.follows); store.set('qstate', S.qstate); store.set('xp', S.xp); };
const level = () => Math.floor(S.xp / 100) + 1;

/* ---------- shared components ---------- */
function speciesCard(s) {
  const f = S.follows.includes(s.id);
  return `<article class="card scard">
    <button class="report" data-act="report" data-id="${s.id}" aria-label="Report ${esc(s.name)}">⚑ Report</button>
    <div class="art creature">${creature(s.type, s.stage, s.color, s.name + ', ' + s.names[s.stage] + ' form')}</div>
    <div class="body">
      <div class="row"><h3><a href="#/species/${s.id}">${esc(s.name)}</a></h3><span class="badge ${s.stage >= 2 ? 'gold' : ''}">Stage ${s.stage + 1} · ${esc(STAGE_NAMES[s.stage])}</span></div>
      <div class="chips">${s.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <p class="small muted" style="margin:0">${esc(s.desc.split('.')[0])}.</p>
      <div><div class="plabel"><span>Next milestone</span><span>${s.progress}%</span></div><div class="progress" role="progressbar" aria-label="${esc(s.name)} next milestone progress" aria-valuenow="${s.progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${s.progress}%"></i></div></div>
      <div class="row small muted"><span>👥 ${s.members.toLocaleString()} members</span><span>by ${esc(s.creator)}</span></div>
      <div class="actions"><button class="btn sm ${f ? 'ghost' : ''}" data-act="follow" data-id="${s.id}" aria-pressed="${f}">${f ? '✓ Following' : '+ Follow'}</button></div>
    </div></article>`;
}
function bar(label, pct, gold) {
  return `<div class="plabel"><span>${label}</span><span>${pct}%</span></div><div class="progress ${gold ? 'gold' : ''}" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>`;
}
function modal(html) {
  const o = $('#overlay'); o.hidden = false;
  o.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="iconbtn x" data-act="close" aria-label="Close">✕</button>${html}</div>`;
  const f = o.querySelector('button:not(.x),input,textarea'); (f || o.querySelector('.x')).focus();
}
function closeModal() { const o = $('#overlay'); o.hidden = true; o.innerHTML = ''; }

/* ---------- chrome ---------- */
const NAV = [['explore', 'Explore', '🧭'], ['quests', 'Quests', '🎯'], ['battles', 'Battles', '⚔️'], ['create', 'Create', '✨'], ['collection', 'Collection', '📚']];
function chrome(route) {
  $('#topbar').innerHTML = `<div class="wrap"><a class="logo" href="#/"><i></i><span>Species<em>.family</em></span></a>
    <nav class="nav" aria-label="Primary">${NAV.map(n => `<a href="#/${n[0]}" ${route === n[0] ? 'aria-current="page"' : ''}>${n[1]}</a>`).join('')}</nav>
    <div class="tools">
      <label class="search"><span class="sr">Search species</span><input id="gsearch" type="search" placeholder="Search species, creators, traits" value="${esc(S.q)}"></label>
      <button class="iconbtn" data-act="notifs" aria-label="Notifications, 3 new">🔔<span class="dot"></span></button>
      <button class="iconbtn" data-act="help" aria-label="Help and risk information">?</button>
      <a class="iconbtn avatar" href="#/collection" aria-label="Profile and wallet">S</a>
    </div></div>`;
  $('#bottomnav').innerHTML = NAV.filter(n => n[0] !== 'battles').map(n => `<a href="#/${n[0]}" ${route === n[0] ? 'aria-current="page"' : ''}><b aria-hidden="true">${n[2]}</b>${n[1]}</a>`).join('');
  $('#footer').innerHTML = `<div class="wrap"><div><div class="logo" style="color:#fff"><i></i>Species<em>.family</em></div><p style="max-width:34ch;margin-top:10px">Create a species. Raise it together. Shape its evolution.</p></div>
    <div><h4>Learn</h4><a href="#/" data-act="soon">Docs</a><a href="#/" data-act="soon">FAQ</a><a href="#/" data-act="help">Safety &amp; risks</a></div>
    <div><h4>Legal</h4><a href="#/" data-act="soon">Terms</a><a href="#/" data-act="soon">Privacy</a></div>
    <div><h4>Community</h4><a href="#/" data-act="soon">X</a><a href="#/" data-act="soon">Discord</a></div>
    <p class="small" style="flex-basis:100%;margin:0;opacity:.8">Prototype. No financial returns are promised. Token features are optional, separate from gameplay, and carry risk.</p></div>`;
}

/* ---------- pages ---------- */
function landing() {
  const feat = SPECIES.filter(s => ['zapkin', 'mossling', 'emberfox'].includes(s.id));
  const z = byId('zapkin'), e = byId('emberfox');
  return `<section class="hero"><div class="wrap">
    <div><span class="eyebrow">A living universe of creatures</span>
      <h1>Every species <span>starts somewhere.</span></h1>
      <p class="lead">Create a creature, build its community, and watch it evolve.</p>
      <div class="btnrow"><a class="btn" href="#/create">Create a Species</a><a class="btn sec" href="#/explore">Explore the Universe</a></div>
      <p class="small muted" style="margin-top:18px">No wallet needed to play. Tokens are an optional layer.</p></div>
    <div class="evo-strip creature">${[0, 1, 2, 3].map(i => `<figure>${creature('animal', i, '#62B88A', 'Mossling evolution form ' + (i + 1))}<figcaption>${STAGE_NAMES[i]}</figcaption></figure>`).join('')}</div>
  </div></section>
  <section class="block"><div class="wrap"><span class="eyebrow">How it works</span><h2>Create → Complete quests → Evolve</h2>
    <div class="steps">
      <div class="step"><b>1</b><h3>Create</h3><p class="muted">Pick a name, personality and world. AI draws the first form and drafts its origin story.</p></div>
      <div class="step"><b>2</b><h3>Complete quests</h3><p class="muted">Make art, vote on lore, welcome new members. Real contribution earns XP, not wallet size.</p></div>
      <div class="step"><b>3</b><h3>Evolve</h3><p class="muted">When the public milestone is verified, your species evolves and the reveal is yours to share.</p></div>
    </div></div></section>
  <section class="block" style="padding-top:0"><div class="wrap"><div class="row" style="display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:10px"><div><span class="eyebrow">Featured species</span><h2 style="margin:0">Meet the community's favorites</h2></div><a class="btn sec sm" href="#/explore">See all</a></div><br>
    <div class="grid">${feat.map(speciesCard).join('')}</div></div></section>
  <section class="block" style="padding-top:0"><div class="wrap"><div class="band">
    <div><span class="eyebrow" style="color:var(--gold)">Signature moment</span><h2>The evolution reveal</h2><p class="muted">A short, skippable cinematic. See which public criteria were met, who helped, and share it as a card.</p>
      <button class="btn" style="background:var(--gold)" data-act="reveal" data-id="zapkin">Watch a reveal</button></div>
    <div><div class="rival"><figure class="creature">${creature(z.type, z.stage, z.color, 'Zapkin')}<b>Zapkin</b></figure><span class="vs">VS</span><figure class="creature">${creature(e.type, e.stage, e.color, 'Emberfox')}<b>Emberfox</b></figure></div><p class="muted small" style="text-align:center;margin:10px 0 0">Community rivalries — coming in a later phase.</p></div>
  </div></div></section>`;
}

function explore() {
  const tabs = [['all', 'All'], ['new', 'New'], ['active', 'Active'], ['evolving', 'Evolving'], ['creative', 'Creative'], ['seasonal', 'Seasonal']];
  return `<div class="wrap"><div class="pagehead"><h1 style="font-size:2.4rem">Explore the universe</h1><p class="muted">Sorted by real activity, never market cap.</p></div>
    <div class="tabs" role="tablist" aria-label="Filter species">${tabs.map(t => `<button class="tab" role="tab" data-act="filter" data-v="${t[0]}" aria-selected="${S.filter === t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="toolbar"><input id="esearch" type="search" aria-label="Search by species name, creator or trait" placeholder="Search by name, creator or trait" value="${esc(S.q)}">
      <label class="small muted">Sort <select id="esort"><option value="activity" ${S.sort === 'activity' ? 'selected' : ''}>Verified engagement</option><option value="recent" ${S.sort === 'recent' ? 'selected' : ''}>Recent activity</option><option value="members" ${S.sort === 'members' ? 'selected' : ''}>Members</option></select></label></div>
    <div id="egrid"></div></div>`;
}
function exploreGrid() {
  const q = S.q.trim().toLowerCase();
  let list = SPECIES.filter(s => (S.filter === 'all' || s.filters.includes(S.filter)) &&
    (!q || [s.name, s.creator, s.personality, s.world, s.type, ...s.tags].join(' ').toLowerCase().includes(q)));
  list.sort((a, b) => S.sort === 'members' ? b.members - a.members : S.sort === 'recent' ? new Date(b.created) - new Date(a.created) : b.act - a.act);
  $('#egrid').innerHTML = list.length ? `<div class="grid">${list.map(speciesCard).join('')}</div>` :
    `<div class="empty"><h3>No species match those filters</h3><p class="muted">Try clearing the search, or switch tabs. Can't find what you want?</p><a class="btn" href="#/create">Create a Species</a></div>`;
}

/* wizard */
const WSTEPS = ['Name', 'Creature type', 'Personality', 'World / theme', 'Generate concept', 'Preview evolution', 'Publish'];
const TYPES = [['animal', 'Animal', 'Furry, feathery or scaly'], ['amphibian', 'Amphibian', 'Hoppy and slippery'], ['alien', 'Alien', 'From beyond'], ['fantasy', 'Fantasy', 'Dragons, sprites, more'], ['robot', 'Robot', 'Beep boop'], ['custom', 'Custom concept', 'Describe your own']];
const PERS = [['Chaotic', 'Unpredictable'], ['Wholesome', 'Kind and warm'], ['Competitive', 'Loves a challenge'], ['Mysterious', 'Speaks in riddles'], ['Curious', 'Asks everything']];
const WORLDS = [['Enchanted forest', ''], ['Cosmic', ''], ['Cyberpunk', ''], ['Ocean', ''], ['Custom', 'Your own setting']];
const WCOL = { 'Enchanted forest': ['#62B88A', '#8fb86a', '#4aa38a'], Cosmic: ['#9b8cf0', '#7774E8', '#c08be8'], Cyberpunk: ['#56c2d9', '#7774E8', '#e86fb3'], Ocean: ['#58b5d8', '#4a9fd0', '#62B88A'], Custom: ['#e9b44c', '#ef8f5e', '#62B88A'] };
function newWiz() { return { step: 0, name: '', ticker: '', desc: '', type: '', pers: '', world: '', variant: 0, seed: 0, story: '', token: false, errors: {} }; }
function wizColors(w) { return WCOL[w.world] || WCOL.Custom; }
function wizSpecies(w) { return { type: w.type || 'custom', color: wizColors(w)[w.variant] }; }
function create() {
  if (!S.wiz) S.wiz = store.get('wiz', null) || newWiz();
  const w = S.wiz, st = w.step, er = w.errors;
  let body = '';
  const opts = (list, key, withSub) => `<div class="opts">${list.map(o => `<button class="opt" type="button" data-act="wopt" data-k="${key}" data-v="${esc(o[0])}" aria-pressed="${w[key] === o[0]}">${esc(o[1] && key === 'type' ? o[1] : o[0])}${o[2] || (key !== 'type' && o[1]) ? `<small>${esc(o[2] || o[1])}</small>` : ''}</button>`).join('')}</div>${er[key] ? `<div class="field"><div class="err" role="alert">${er[key]}</div></div>` : ''}`;
  if (st === 0) body = `<h2>Name your species</h2><div class="field"><label for="w-name">Species name</label><input id="w-name" maxlength="24" value="${esc(w.name)}" placeholder="e.g. Mossling">${er.name ? `<div class="err" role="alert">${er.name}</div>` : ''}</div>
    <div class="field"><label for="w-desc">Short description</label><textarea id="w-desc" rows="3" maxlength="140" placeholder="One or two sentences about who they are">${esc(w.desc)}</textarea><div class="small muted">${w.desc.length}/140</div></div>
    <div class="field"><label for="w-ticker">Ticker <span class="muted">(only needed if you enable a token later)</span></label><input id="w-ticker" maxlength="6" value="${esc(w.ticker)}" placeholder="Optional"></div>`;
  if (st === 1) body = `<h2>What kind of creature?</h2>${opts(TYPES, 'type')}`;
  if (st === 2) body = `<h2>Pick a personality</h2>${opts(PERS, 'pers')}`;
  if (st === 3) body = `<h2>Choose its world</h2>${opts(WORLDS, 'world')}`;
  if (st === 4) {
    if (!w.story) w.story = `${w.name || 'Your species'} was born in the ${String(w.world || 'unknown').toLowerCase()}, a ${String(w.pers || 'curious').toLowerCase()} ${w.type || 'creature'} with a story still waiting to be written by its community.`;
    body = `<h2>Generate the concept</h2><p class="muted">Choose a variation. Regeneration is limited to keep things fair (${3 - w.seed} left today).</p>
      <div class="variants creature">${[0, 1, 2].map(i => { const c = wizColors(w)[i]; return `<button class="variant" type="button" data-act="wopt" data-k="variant" data-v="${i}" aria-pressed="${w.variant === i}" aria-label="Variation ${i + 1}">${creature(w.type || 'custom', 0, c, 'Concept variation ' + (i + 1))}</button>`; }).join('')}</div>
      <div class="btnrow" style="margin:14px 0"><button class="btn sec sm" data-act="regen" ${w.seed >= 3 ? 'disabled' : ''}>↻ Regenerate</button><span class="badge violet" style="align-self:center">AI-generated artwork</span></div>
      <div class="field"><label for="w-story">Origin story (edit freely)</label><textarea id="w-story" rows="4">${esc(w.story)}</textarea></div>`;
  }
  if (st === 5) {
    const sp = wizSpecies(w);
    body = `<h2>Proposed evolution tree</h2><p class="muted">Criteria are published before anyone contributes, and can't be silently changed afterwards.</p>
      <div class="tree creature">${[0, 1, 2, 3].map(i => `${i ? '<span class="arrow">→</span>' : ''}<div class="card" style="padding:10px;text-align:center;min-width:130px;flex:1"><div style="width:100px;margin:auto">${creature(sp.type, i, sp.color, 'Stage ' + (i + 1))}</div><b>${STAGE_NAMES[i]}</b><div class="small muted">${i === 0 ? 'Starting form' : ['500', '2,000', '5,000'][i - 1] + ' verified quests'}</div></div>`).join('')}</div>`;
  }
  if (st === 6) body = `<h2>Publish your species</h2><p class="muted">Publish the preview first. Everything works without a token.</p>
    <div class="card pad" style="margin-bottom:14px"><b>${esc(w.name)}</b> · ${esc(w.pers)} ${esc(w.type)} · ${esc(w.world)}<p class="small muted" style="margin:6px 0 0">${esc(w.desc || w.story)}</p></div>
    <div class="notice violet"><label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer"><input type="checkbox" id="w-token" ${w.token ? 'checked' : ''} style="margin-top:4px;width:20px;height:20px"><span><b>Prepare an optional token later</b><br>This is a separate step after publishing, with chain, fees, risk details and explicit wallet confirmation. Nothing is sent now.</span></label></div>`;
  return `<div class="wrap"><div class="pagehead"><h1 style="font-size:2.4rem">Create a species</h1><p class="muted">About two minutes. Your progress is saved as you go.</p></div>
    <div class="wiz"><ol class="wsteps card" aria-label="Steps">${WSTEPS.map((n, i) => `<li class="${i === st ? 'on' : i < st ? 'done' : ''}" ${i === st ? 'aria-current="step"' : ''}><b>${i < st ? '✓' : i + 1}</b><span>${n}</span></li>`).join('')}</ol>
    <div class="card wpanel">${body}<div class="wnav"><button class="btn sec" data-act="wback" ${st === 0 ? 'disabled' : ''}>← Back</button>
      <button class="btn" data-act="wnext">${st === 6 ? 'Publish species' : 'Next →'}</button></div></div></div></div>`;
}
function wizSync() {
  const w = S.wiz; if (!w) return;
  const g = id => $(id);
  if (g('#w-name')) { w.name = g('#w-name').value; w.desc = g('#w-desc').value; w.ticker = g('#w-ticker').value; }
  if (g('#w-story')) w.story = g('#w-story').value;
  if (g('#w-token')) w.token = g('#w-token').checked;
}
function wizNext() {
  wizSync(); const w = S.wiz; w.errors = {};
  if (w.step === 0 && w.name.trim().length < 2) w.errors.name = 'Give your species a name (at least 2 characters).';
  if (w.step === 1 && !w.type) w.errors.type = 'Choose a creature type to continue.';
  if (w.step === 2 && !w.pers) w.errors.pers = 'Choose a personality to continue.';
  if (w.step === 3 && !w.world) w.errors.world = 'Choose a world to continue.';
  if (Object.keys(w.errors).length) return render();
  if (w.step === 3) w.story = '';
  if (w.step < 6) { w.step++; store.set('wiz', w); return render(); }
  const sp = wizSpecies(w), id = (w.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new') + '-' + Date.now().toString(36).slice(-3);
  const s = { id, name: w.name.trim(), type: sp.type, personality: w.pers, world: w.world, color: sp.color, stage: 0, members: 1, progress: 0, creator: 'you', tags: [w.pers], filters: ['new'], act: 30, created: 'Today', token: false,
    desc: w.desc.trim() || w.story, names: STAGE_NAMES.map(n => w.name.trim() + ' ' + n),
    crit: [['Verified quests completed by community', 0, 500], ['Original art submissions approved', 0, 20], ['Unique contributors this window', 1, 50]], window: '14-day window · opens with first quest', story: w.story };
  CUSTOM.unshift(s); SPECIES.unshift(s); store.set('custom', CUSTOM);
  S.follows.push(id); save(); S.wiz = null; store.set('wiz', null);
  toast('Species published! Invite your community.'); location.hash = '#/species/' + id;
}

/* profile */
function profile(id, tab) {
  const s = byId(id); if (!s) return notFound();
  const tabs = [['overview', 'Overview'], ['quests', 'Quests'], ['lore', 'Lore'], ['community', 'Community'], ['evolution', 'Evolution']];
  if (s.token) tabs.push(['onchain', 'Onchain']);
  if (!tabs.find(t => t[0] === tab)) tab = 'overview';
  const f = S.follows.includes(s.id);
  const ready = s.progress >= 100;
  return `<div class="wrap"><div class="phead">
    <div class="pstage creature">${creature(s.type, s.stage, s.color, s.name + ' current form: ' + s.names[s.stage])}<span class="badge ${s.stage >= 2 ? 'gold' : ''}">${esc(s.names[s.stage])}</span></div>
    <div><span class="eyebrow">${esc(s.world)} · ${esc(s.type)}</span><h1 style="font-size:2.8rem;margin-bottom:.2em">${esc(s.name)}</h1>
      <div class="chips" style="margin-bottom:12px">${s.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}<span class="chip">Created ${esc(s.created)}</span><span class="chip">by ${esc(s.creator)}</span></div>
      <p>${esc(s.desc)}</p>
      <div style="max-width:440px;margin-bottom:16px">${bar('Next evolution: ' + (s.names[s.stage + 1] || 'Final form'), s.progress, true)}</div>
      <div class="btnrow"><button class="btn" data-act="follow" data-id="${s.id}" aria-pressed="${f}">${f ? '✓ Following' : '+ Follow'}</button>
      <button class="btn sec" data-act="share" data-id="${s.id}">Share</button><button class="btn sec" data-act="join" data-id="${s.id}">Join community</button>
      <button class="btn ghost" data-act="report" data-id="${s.id}">⚑ Report</button></div></div></div>
    <div class="tabs" role="tablist" aria-label="Species sections" style="margin-top:22px">${tabs.map(t => `<a class="tab" role="tab" href="#/species/${s.id}/${t[0]}" aria-selected="${tab === t[0]}" style="text-decoration:none">${t[1]}</a>`).join('')}</div>
    ${profileTab(s, tab)}</div>`;
}
function critList(s) {
  return `<ul class="crit">${s.crit.map(c => { const ok = c[1] >= c[2]; return `<li class="${ok ? 'ok' : ''}"><span class="st" aria-hidden="true">${ok ? '✓' : '…'}</span><div style="flex:1"><b>${esc(c[0])}</b><div class="small muted">${c[1].toLocaleString()} / ${c[2].toLocaleString()} · ${ok ? 'Verified by server' : 'Pending'}</div></div><span class="sr">${ok ? 'Complete' : 'Incomplete'}</span></li>`; }).join('')}</ul><p class="small muted" style="margin:10px 0 0">Qualifying ${esc(s.window)}. Verified by application logic, not AI.</p>`;
}
function profileTab(s, tab) {
  if (tab === 'overview') return `<div class="two-col"><div class="card pad"><h3>Evolution progress</h3>${critList(s)}<div class="btnrow" style="margin-top:14px"><a class="btn sm sec" href="#/species/${s.id}/evolution">View evolution tree</a><button class="btn sm violet" data-act="reveal" data-id="${s.id}">Preview reveal (demo)</button></div></div>
    <div style="display:grid;gap:20px"><div class="card pad"><h3>Activity</h3><ul class="feed">${ACTIVITY.map(a => `<li><span class="ic" aria-hidden="true">${a[0]}</span><div><div>${esc(a[1].replace('Emberfox', s.name))}</div><div class="small muted">${a[2]}</div></div></li>`).join('')}</ul></div>${chatCard(s)}</div></div>`;
  if (tab === 'quests') { const q = QUESTS.filter(x => x.species === s.id); return q.length ? `<div class="grid">${q.map(questCard).join('')}</div>` : `<div class="empty"><h3>No active quests yet</h3><p class="muted">Check the global Quests page for open challenges.</p><a class="btn" href="#/quests">Browse quests</a></div>`; }
  if (tab === 'lore') return `<div class="two-col"><div class="card pad"><h3>Origin story</h3><p>${esc(s.story || s.desc)}</p><p class="muted">Chapter 2 unlocks at ${esc(s.names[Math.min(s.stage + 1, 3)])}. <span class="badge violet">AI-assisted writing</span></p></div>
    <div class="card pad"><h3>Chapter vote</h3><p class="small muted">What does ${esc(s.name)} do next?</p>${['Follows the lantern', 'Hides and watches', 'Calls the others'].map((o, i) => `<button class="btn ghost sm" style="display:flex;width:100%;margin-bottom:8px;justify-content:space-between" data-act="vote">${o}<span>${[48, 31, 21][i]}%</span></button>`).join('')}</div></div>`;
  if (tab === 'community') return `<div class="two-col"><div class="card pad"><h3>Community feed</h3><div class="field"><label for="post">Share something (art, meme, lore)</label><textarea id="post" rows="2" placeholder="Be kind. Submissions are reviewed before they go public."></textarea></div><button class="btn sm" data-act="post">Submit for review</button>
    <ul class="feed" style="margin-top:14px"><li><span class="ic">📌</span><div><b>Pinned: origin story &amp; community rules</b><div class="small muted">Be kind, be original, no financial promises.</div></div></li>${ACTIVITY.slice(0, 3).map(a => `<li><span class="ic">${a[0]}</span><div>${esc(a[1])}<div class="small muted">${a[2]} · <a href="#/" data-act="report" data-id="${s.id}">Report</a> · <a href="#/" data-act="soon">Mute</a></div></div></li>`).join('')}</ul></div>
    <div class="card pad"><h3>Top contributors</h3><p class="small muted">Roles come from verified contribution, not token balance.</p><ul class="feed">${['ember_ryn · Lorekeeper', 'nova.k · Artisan', 'plumbo · Greeter'].map(x => `<li><span class="ic">🏅</span>${x}</li>`).join('')}</ul></div></div>`;
  if (tab === 'evolution') return evolution(s);
  if (tab === 'onchain') return `<div class="notice" style="margin-bottom:16px"><b>Risk notice.</b> Tokens are volatile and can lose all value. Liquidity may be thin and smart contracts can have bugs. Nothing here is financial advice or a promise of returns. XP, evolution and collectibles are <b>separate</b> from any token.</div>
    <div class="two-col"><div class="card pad"><h3>Token details</h3><dl class="kv"><dt>Network</dt><dd>Robinhood Chain (demo)</dd><dt>Contract</dt><dd>0x0000…demo — <i>placeholder, not a real address</i></dd><dt>Verification</dt><dd>Unverified in prototype</dd><dt>Price / supply</dt><dd>Shown only when sourced &amp; timestamped</dd><dt>Last updated</dt><dd>—</dd></dl>
    <div class="btnrow" style="margin-top:14px"><button class="btn sm sec" data-act="soon">View on explorer ↗</button></div></div>
    <div class="card pad"><h3>Wallet actions</h3><p class="small muted">Browsing is read-only; no wallet needed. Any write shows a transaction preview, network and fees, then needs explicit confirmation in your wallet. We never ask for seed phrases or private keys.</p><button class="btn violet" data-act="wallet">Connect wallet (optional)</button></div></div>`;
  return '';
}
function chatCard(s) {
  const m = S.chat[s.id] || (S.chat[s.id] = [['bot', `Hi! I'm ${s.name}. ${s.personality === 'Mysterious' ? 'Ask, and I may answer in riddles.' : 'What shall we talk about?'}`]]);
  return `<div class="card pad"><h3>Talk to ${esc(s.name)} <span class="badge violet">AI</span></h3><div class="chat" id="chat" aria-live="polite">${m.map(x => `<div class="msg ${x[0]}">${esc(x[1])}</div>`).join('')}</div>
    <form class="row2" data-form="chat" data-id="${s.id}"><label class="sr" for="chatin">Message</label><input id="chatin" style="flex:1;padding:10px 14px;border:1px solid var(--line);border-radius:999px" placeholder="Say something…" autocomplete="off"><button class="btn sm">Send</button></form>
    <p class="small muted" style="margin:8px 0 0">Responses are AI-generated and moderated.</p></div>`;
}
function evolution(s, sel) {
  sel = sel == null ? Math.min(s.stage + 1, 3) : sel;
  const crit = ['Starting form', '500 verified quests · 100 contributors', '2,000 verified quests · 1 lore vote', '5,000 verified quests · rivalry win'];
  return `<p class="muted">Select a form. Achieved forms are permanent; market-price changes never reverse them.</p>
  <div class="hpath creature" role="list">${[0, 1, 2, 3].map(i => { const st = i < s.stage ? 'done' : i === s.stage ? 'cur' : 'locked';
    return `${i ? `<span class="linkc ${i <= s.stage ? 'on' : ''}"></span>` : ''}<button class="node ${st} ${sel === i ? 'sel' : ''}" role="listitem" data-act="node" data-id="${s.id}" data-i="${i}" aria-label="${esc(s.names[i])}, ${st === 'locked' ? 'locked' : st === 'cur' ? 'current form' : 'unlocked'}">
    <span class="badge ${st === 'locked' ? 'line' : st === 'cur' ? '' : 'gold'}">${st === 'locked' ? '🔒 Locked' : st === 'cur' ? 'Current' : '✓ Unlocked'}</span>${creature(s.type, i, s.color, s.names[i] + (st === 'locked' ? ' silhouette' : ''))}<h4 style="margin:6px 0 0">${st === 'locked' && i > s.stage + 1 ? '???' : esc(s.names[i])}</h4></button>`; }).join('')}</div>
  <div class="detail" id="edetail">${evoDetail(s, sel, crit)}</div>`;
}
function evoDetail(s, i, crit) {
  crit = crit || ['Starting form', '500 verified quests · 100 contributors', '2,000 verified quests · 1 lore vote', '5,000 verified quests · rivalry win'];
  const unlocked = i <= s.stage;
  return `<h3>${unlocked || i === s.stage + 1 ? esc(s.names[i]) : 'Hidden form'}</h3><p class="muted">${unlocked ? 'Unlocked. The reveal and achievement record are saved to the species history.' : 'Locked. Requirements are exact, public and verified by the server. Unlocking is not tied to any financial reward.'}</p>
    <dl class="kv"><dt>Requirements</dt><dd>${esc(crit[i])}</dd><dt>Qualifying window</dt><dd>${esc(s.window)}</dd><dt>Status</dt><dd>${unlocked ? '✓ Verified' : i === s.stage + 1 ? s.progress + '% complete · pending verification' : 'Not yet reachable'}</dd></dl>
    ${unlocked && i > 0 ? `<button class="btn sm violet" style="margin-top:12px" data-act="reveal" data-id="${s.id}" data-i="${i}">Replay reveal</button>` : ''}`;
}

/* quests */
function qIdx(q) { return S.qstate[q.id] || 0; }
function questCard(q) {
  const i = qIdx(q), sp = byId(q.species) || { name: 'Species' };
  return `<article class="card qcard"><div class="qmeta"><span class="badge mint">${esc(q.kind)}</span><span>${esc(q.diff)}</span><span>⏱ ${esc(q.time)}</span><span><b>+${q.xp} XP</b></span></div>
    <h3 style="margin:0">${esc(q.title)}</h3><p class="small muted" style="margin:0">${esc(sp.name)} · ${esc(q.elig)}</p>
    <div class="stepper" aria-label="Progress: ${QSTATES[i]}">${QSTATES.map((n, k) => `<span class="${k <= i ? 'on' : ''}">${n}</span>`).join('')}</div>
    <button class="btn sm ${i >= 4 ? 'ghost' : ''}" data-act="qopen" data-id="${q.id}">${['Start quest', 'Continue', 'View status', 'Claim reward', 'View'][i]}</button></article>`;
}
function quests() {
  const tabs = [['daily', 'Daily'], ['weekly', 'Weekly'], ['community', 'Community'], ['seasonal', 'Seasonal']];
  const lv = level(), into = S.xp % 100;
  return `<div class="wrap"><div class="pagehead"><h1 style="font-size:2.4rem">Quests</h1><p class="muted">Small, meaningful tasks. Streaks are forgiving, and nothing here costs money.</p></div>
    <div class="card xpbar"><div><div class="small muted">Your level</div><div class="lvl">${lv}</div></div><div style="flex:1;min-width:200px">${bar('XP to level ' + (lv + 1), into)}</div><div class="small muted">🔥 3-day streak · 1 rest day saved</div></div>
    <div class="tabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" data-act="qtab" data-v="${t[0]}" aria-selected="${S.qtab === t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="grid">${QUESTS.filter(q => q.kind === S.qtab).map(questCard).join('')}</div></div>`;
}
function questModal(id) {
  const q = QUESTS.find(x => x.id === id), i = qIdx(q);
  const info = [
    ['Ready when you are.', '<button class="btn" data-act="qstep" data-id="' + id + '">Start quest</button>'],
    ['Do the task, then submit your evidence.', '<div class="field"><label for="qev">Your submission</label><textarea id="qev" rows="3" placeholder="Paste a link or describe what you made"></textarea></div><button class="btn" data-act="qstep" data-id="' + id + '">Submit for review</button>'],
    ['Submitted. A moderator and automated checks verify it before any XP is awarded. This usually takes under a day.', '<button class="btn violet" data-act="qstep" data-id="' + id + '">Demo: simulate review passing</button>'],
    ['Verified! Claim your XP.', '<button class="btn" style="background:var(--gold)" data-act="qstep" data-id="' + id + '">Claim +' + q.xp + ' XP</button>'],
    ['Rewarded. Nice work. Check out more quests.', '<button class="btn sec" data-act="close">Done</button>']];
  modal(`<span class="badge mint">${esc(q.kind)}</span><h2 style="margin:10px 0 6px">${esc(q.title)}</h2><p>${esc(q.obj)}</p>
    <dl class="kv" style="margin-bottom:14px"><dt>Reward</dt><dd>${q.xp} XP (no financial value)</dd><dt>Eligibility</dt><dd>${esc(q.elig)}</dd><dt>Status</dt><dd>${QSTATES[i]}</dd></dl>
    <p class="muted small">${info[i][0]}</p>${info[i][1]}`);
}

function battles() {
  const a = byId('zapkin'), b = byId('emberfox');
  return `<div class="wrap"><div class="pagehead"><span class="badge violet">Later phase</span><h1 style="font-size:2.4rem;margin-top:8px">Battles</h1><p class="muted">Community challenges and species rivalries are planned after core validation.</p></div>
    <div class="card pad"><div class="rival creature"><figure>${creature(a.type, a.stage, a.color, a.name)}<h3>${a.name}</h3></figure><span class="vs" style="color:var(--violet)">VS</span><figure>${creature(b.type, b.stage, b.color, b.name)}<h3>${b.name}</h3></figure></div>
    <div style="text-align:center"><button class="btn" data-act="notify">Notify me when it opens</button></div></div></div>`;
}
function collection() {
  const mine = SPECIES.filter(s => S.follows.includes(s.id));
  return `<div class="wrap"><div class="pagehead"><h1 style="font-size:2.4rem">My Collection</h1><p class="muted">Level ${level()} · ${S.xp} XP · ${mine.length} species followed</p></div>
    <div class="two-col" style="margin-bottom:24px"><div class="card pad"><h3>Badges</h3><div class="chips">${['🌱 First follow', '🎯 First quest', '🖼️ Contributor', '⭐ Milestone helper'].map(b => `<span class="chip">${b}</span>`).join('')}</div></div>
    <div class="card pad"><h3>Privacy &amp; settings</h3><label style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><input type="checkbox" id="priv" style="width:20px;height:20px" ${store.get('private', false) ? 'checked' : ''}> Make my profile private</label>
    <div class="btnrow"><button class="btn sm sec" data-act="wallet">Wallet (optional)</button><button class="btn sm sec" data-act="soon">Notifications</button><button class="btn sm sec" data-act="soon">Delete account</button></div></div></div>
    <h2>Followed species</h2>${mine.length ? `<div class="grid">${mine.map(speciesCard).join('')}</div>` : `<div class="empty"><h3>Nothing collected yet</h3><p class="muted">Follow a species to see it here — no purchase needed.</p><a class="btn" href="#/explore">Explore</a></div>`}</div>`;
}
function notFound() { return `<div class="wrap"><div class="empty" style="margin-top:40px"><h2>We couldn't find that page</h2><a class="btn" href="#/">Go home</a></div></div>`; }

/* reveal */
function reveal(id, idx) {
  const s = byId(id); const to = idx != null ? +idx : Math.min(s.stage + 1, 3), from = Math.max(to - 1, 0);
  const o = $('#overlay'); o.hidden = false; o.style.background = 'transparent'; o.style.padding = 0;
  o.innerHTML = `<div class="reveal ${reduced() ? 'static' : ''}" role="dialog" aria-modal="true" aria-label="Evolution reveal"><button class="btn sec sm skip-r" data-act="close">${reduced() ? 'Close' : 'Skip'} ✕</button>
    <div class="stage creature"><div class="glow"></div><div class="old">${creature(s.type, from, s.color, s.names[from])}</div><div class="new">${creature(s.type, to, s.color, s.names[to])}</div></div>
    <div class="info" style="max-width:520px"><span class="eyebrow" style="color:var(--gold)">${esc(s.name)} evolved</span><h2 style="margin-bottom:6px">${esc(s.names[to])}</h2>
      <p style="color:#cfe3da">“I felt the whole grove hum. Every note, every drawing — you made me this.” <span class="small">· AI-written story</span></p>
      <div class="card pad" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);text-align:left;margin-bottom:12px;color:#fff"><b>Milestone criteria met</b><ul style="margin:6px 0 0;padding-left:18px;font-size:.9rem">${s.crit.map(c => `<li>${esc(c[0])} — ${c[2].toLocaleString()} ✓</li>`).join('')}</ul></div>
      <span class="badge gold">Community achievement · ${s.members.toLocaleString()} contributors credited</span>
      <div class="btnrow" style="justify-content:center;margin-top:16px"><button class="btn" data-act="share" data-id="${s.id}" data-i="${to}">Share Reveal</button><a class="btn sec" href="#/species/${s.id}/evolution" data-act="close">View New Form</a><a class="btn sec" href="#/quests" data-act="close">Continue to Quests</a></div></div></div>`;
  const r = o.querySelector('.reveal'); r.querySelector('.skip-r').focus();
  setTimeout(() => r.classList.add('go'), reduced() ? 0 : 700);
}
function shareModal(id, i) {
  const s = byId(id), to = i != null ? +i : s.stage;
  const o = $('#overlay'); o.style.background = ''; o.style.padding = '';
  const card = (cls) => `<div class="sharecard ${cls}"><div class="creature">${creature(s.type, to, s.color, s.names[to])}</div><div><b style="font-family:var(--h);font-size:1.2rem">${esc(s.names[to])}</b><div class="small">${esc(s.name)} evolved on Species.family</div></div></div>`;
  modal(`<h2>Share card</h2><p class="muted small">Cards never include wallet or account details.</p><div class="tabs" role="tablist"><button class="tab" role="tab" data-act="sharefmt" data-v="r11" data-id="${id}" data-i="${to}" aria-selected="true">1:1</button><button class="tab" role="tab" data-act="sharefmt" data-v="r169" data-id="${id}" data-i="${to}" aria-selected="false">16:9</button></div><div id="sc">${card('r11')}</div><div class="btnrow"><button class="btn" data-act="copy">Copy link</button><button class="btn sec" data-act="soon">Download image</button></div>`);
  o.firstElementChild._card = card;
}

/* ---------- router ---------- */
function render() {
  const h = location.hash.replace(/^#\/?/, '') || '';
  const [r, a, b] = h.split('/');
  const route = r || 'home';
  chrome(route === 'species' ? 'explore' : route);
  let html;
  if (route === 'home') html = landing();
  else if (route === 'explore') html = explore();
  else if (route === 'quests') html = quests();
  else if (route === 'battles') html = battles();
  else if (route === 'create') html = create();
  else if (route === 'collection') html = collection();
  else if (route === 'species') html = profile(a, b);
  else html = notFound();
  const m = $('#main'); m.innerHTML = html;
  if (route === 'explore') exploreGrid();
  document.title = (route === 'species' && byId(a) ? byId(a).name + ' — ' : '') + 'Species.family';
  $('#footer').style.display = route === 'create' ? 'none' : '';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { if (!$('#overlay').hidden) closeModal(); render(); });

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id;
  if (t.tagName === 'A' && (act === 'soon' || act === 'report' || act === 'help')) e.preventDefault();
  switch (act) {
    case 'close': closeModal(); $('#overlay').style.background = ''; $('#overlay').style.padding = ''; break;
    case 'soon': toast('Not part of this prototype'); break;
    case 'follow': { const i = S.follows.indexOf(id); if (i < 0) { S.follows.push(id); toast('Following ' + byId(id).name) } else { S.follows.splice(i, 1); toast('Unfollowed') } save(); render(); break; }
    case 'filter': S.filter = t.dataset.v; render(); break;
    case 'report': modal(`<h2>Report ${esc(byId(id).name)}</h2><p class="muted">Tell us what's wrong. Reports are reviewed by moderators.</p><div class="field"><select id="rr" aria-label="Reason"><option>Spam or scam</option><option>Offensive content</option><option>Impersonation</option><option>Misleading financial claims</option><option>Other</option></select></div><button class="btn" data-act="reported">Submit report</button>`); break;
    case 'reported': closeModal(); toast('Report sent. Thank you.'); break;
    case 'notifs': modal(`<h2>Notifications</h2><ul class="feed"><li><span class="ic">🎯</span>Your quest was verified</li><li><span class="ic">🌱</span>Mossling is 72% to its next form</li><li><span class="ic">🗳️</span>New story vote is open</li></ul>`); break;
    case 'help': modal(`<h2>Safety &amp; risk</h2><p>Species.family is a game first. Tokens are optional and separate. They are volatile, can lose value, and nothing here is financial advice or a promise of returns.</p><p>We will never ask for your seed phrase or private key. Report anything suspicious from any species page.</p><button class="btn" data-act="close">Got it</button>`); break;
    case 'wopt': { wizSync(); const k = t.dataset.k; S.wiz[k] = k === 'variant' ? +t.dataset.v : t.dataset.v; delete S.wiz.errors[k]; if (k === 'type' || k === 'world') S.wiz.story = ''; store.set('wiz', S.wiz); render(); break; }
    case 'regen': wizSync(); S.wiz.seed++; S.wiz.variant = (S.wiz.variant + 1) % 3; S.wiz.story = ''; render(); toast('New variation generated'); break;
    case 'wnext': wizNext(); break;
    case 'wback': wizSync(); S.wiz.step--; render(); break;
    case 'qtab': S.qtab = t.dataset.v; render(); break;
    case 'qopen': questModal(id); break;
    case 'qstep': { const q = QUESTS.find(x => x.id === id), i = qIdx(q); S.qstate[id] = i + 1;
      if (i === 3) { S.xp += q.xp; toast('+' + q.xp + ' XP earned!') } else toast(['Quest started', 'Submitted for review', 'Verified!'][i]);
      save(); if (i === 3) closeModal(); else questModal(id); render(); break; }
    case 'node': { const s = byId(id), i = +t.dataset.i; $('#edetail').innerHTML = evoDetail(s, i); document.querySelectorAll('.node').forEach(n => n.classList.toggle('sel', n === t)); break; }
    case 'reveal': reveal(id, t.dataset.i); break;
    case 'share': shareModal(id, t.dataset.i); break;
    case 'sharefmt': { document.querySelectorAll('[data-act=sharefmt]').forEach(b => b.setAttribute('aria-selected', b === t)); const s = byId(id), to = +t.dataset.i;
      $('#sc').innerHTML = `<div class="sharecard ${t.dataset.v}"><div class="creature">${creature(s.type, to, s.color, s.names[to])}</div><div><b style="font-family:var(--h);font-size:1.2rem">${esc(s.names[to])}</b><div class="small">${esc(s.name)} evolved on Species.family</div></div></div>`; break; }
    case 'copy': toast('Link copied'); break;
    case 'join': toast('Welcome to the ' + byId(id).name + ' community!'); break;
    case 'vote': toast('Vote recorded'); break;
    case 'post': { const p = $('#post'); if (!p.value.trim()) return toast('Write something first'); p.value = ''; toast('Submitted. It will appear after review.'); break; }
    case 'wallet': modal(`<h2>Connect a wallet</h2><p class="muted">Optional. You can use everything else without one. We only use standard wallet signing, and will never ask for a seed phrase or private key.</p><button class="btn violet" data-act="close">Okay (demo only)</button>`); break;
    case 'notify': toast("We'll let you know"); break;
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'esearch' || e.target.id === 'gsearch') { S.q = e.target.value; if (location.hash.startsWith('#/explore')) exploreGrid(); }
  if (e.target.id === 'esort') { S.sort = e.target.value; exploreGrid(); }
  if (e.target.id === 'w-desc') e.target.nextElementSibling.textContent = e.target.value.length + '/140';
  if (e.target.id === 'priv') store.set('private', e.target.checked);
});
document.addEventListener('change', e => { if (e.target.id === 'esort') { S.sort = e.target.value; exploreGrid(); } if (e.target.id === 'priv') { store.set('private', e.target.checked); toast(e.target.checked ? 'Profile is private' : 'Profile is public'); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'gsearch') { location.hash = '#/explore'; setTimeout(exploreGrid); }
  if (e.key === 'Escape' && !$('#overlay').hidden) { closeModal(); $('#overlay').style.background = ''; $('#overlay').style.padding = ''; }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form=chat]'); if (!f) return; e.preventDefault();
  const inp = $('#chatin'), v = inp.value.trim(); if (!v) return;
  const s = byId(f.dataset.id), m = S.chat[s.id];
  const replies = { Chaotic: 'Bzzt! Ooh, I was just about to say that. Or the opposite.', Wholesome: 'That makes me so happy to hear. Want to make something together?', Competitive: 'Interesting. I bet I can top that. Quest me!', Mysterious: 'The answer sleeps where the stars forget their names…', Curious: 'Wait, why? And then what happened? Tell me more!' };
  m.push(['me', v], ['bot', replies[s.personality] || 'Tell me more!']); inp.value = '';
  const c = $('#chat'); c.innerHTML = m.map(x => `<div class="msg ${x[0]}">${esc(x[1])}</div>`).join(''); c.scrollTop = c.scrollHeight;
});

render();
})();
