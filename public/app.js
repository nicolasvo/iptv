'use strict';
const $ = (s) => document.querySelector(s);

// ---------- Material Design Icons (@mdi/svg paths, 24x24) ----------
const ICONS = {
  magnify: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z',
  close: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
  github: 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z',
  moon: 'M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z',
  sun: 'M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13',
  chevronDown: 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z',
  star: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z',
  starOutline: 'M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z',
  imageOff: 'M22 20.7L3.3 2L2 3.3L3 4.3V19C3 20.1 3.9 21 5 21H19.7L20.7 22L22 20.7M5 19V6.3L12.6 13.9L11.1 15.8L9 13.1L6 17H15.7L17.7 19H5M8.8 5L6.8 3H19C20.1 3 21 3.9 21 5V17.2L19 15.2V5H8.8Z',
  link: 'M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z',
  check: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
  shuffle: 'M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z',
};
const icon = (name, size = 24) => `<svg class="mdi" viewBox="0 0 24 24" width="${size}" height="${size}"><path d="${ICONS[name]}"/></svg>`;

// ---------- theme ----------
const html = document.documentElement;
function setTheme(t) {
  html.classList.toggle('dark', t === 'dark');
  localStorage.setItem('theme', t);
  $('#theme').innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 20);
}
setTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#theme').onclick = () => setTheme(html.classList.contains('dark') ? 'light' : 'dark');

// nav border on scroll
addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 0));

// ---------- data ----------
let CH = [];                 // [{n,c,l,id,g,x, i}]
let FLAGS = {};              // countryName -> flag
let byCountry = new Map();   // countryName -> [channel]
let orderedCountries = [];   // country names that have channels, sorted

const PER = 100; // pagination per country (matches the original)

Promise.all([
  fetch('/api/countries').then((r) => r.json()),
  fetch('/api/channels').then((r) => r.json()),
]).then(([countries, channels]) => {
  countries.forEach((c) => (FLAGS[c.name] = c.flag));
  FLAGS['International'] = '🌐'; FLAGS['Undefined'] = '📺';
  CH = channels.map((c, i) => ((c.i = i), c));
  for (const c of CH) {
    if (!byCountry.has(c.c)) byCountry.set(c.c, []);
    byCountry.get(c.c).push(c);
  }
  orderedCountries = [...byCountry.keys()].sort((a, b) => {
    const rank = (n) => (n === 'International' ? 1 : n === 'Undefined' ? 2 : 0);
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  for (const c of CH) { const k = favKey(c); if (!keyToChannel.has(k)) keyToChannel.set(k, c); }
  render();
  applyUrl(); // open a channel directly if the URL has ?play=<token>
});

// ---------- favorites (persisted in localStorage) ----------
const FAV_KEY = 'iptv_favs';
let favs;
try { favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch { favs = new Set(); }
const keyToChannel = new Map();
const favKey = (c) => (c.id ? 'i:' + c.id : 'n:' + c.n + '|' + c.c);
const saveFavs = () => localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
const favoriteChannels = () => [...favs].map((k) => keyToChannel.get(k)).filter(Boolean);
function toggleFav(c) {
  const k = favKey(c);
  if (favs.has(k)) favs.delete(k); else favs.add(k);
  saveFavs();
  render(); // refresh stars + the Favorites group; expanded state is preserved
}

// ---------- search ----------
const qInput = $('#q');
let query = '';
$('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); qInput.blur(); });
$('#clear').onclick = () => { qInput.value = ''; query = ''; $('#clear').classList.remove('show'); render(); };
let deb;
qInput.addEventListener('input', () => {
  $('#clear').classList.toggle('show', qInput.value.length > 0);
  clearTimeout(deb);
  deb = setTimeout(() => { query = qInput.value.trim().toLowerCase(); render(); }, 130);
});

// ---------- random channel ----------
// Plays a random channel out of whatever is currently listed: the search results
// when a query is active, otherwise the whole catalogue.
const randomBtn = $('#random');
randomBtn.innerHTML = `${icon('shuffle', 18)}<span>Random</span>`;
randomBtn.onclick = () => {
  const pool = query ? CH.filter((c) => rank(c, query) > 0) : CH;
  if (!pool.length) return;
  play(pool[Math.floor(Math.random() * pool.length)]);
};

// Relevance score: whole-word / prefix matches rank far above mid-word substrings,
// so "htv" surfaces "HTV"/"HTV2" before "MierschTV". A country-name match pulls in
// that whole country. Higher = more relevant; 0 = no match.
// Scores against the visible channel NAME (and country) only — never the tvg-id,
// which is a URL-like slug ("ucvtv.cl") and produces confusing matches.
function rank(c, q) {
  const name = c.n.toLowerCase();
  const ctry = c.c.toLowerCase();

  // multi-word query → require every token to appear in name/country
  const toks = q.split(/\s+/).filter(Boolean);
  if (toks.length > 1) {
    const hay = `${name} ${ctry}`;
    return toks.every((t) => hay.includes(t)) ? 300 : 0;
  }

  const words = name.split(/[^a-z0-9]+/).filter(Boolean);
  const cwords = ctry.split(/[^a-z0-9]+/).filter(Boolean);
  let s = 0;
  if (name === q) s = 1000;                              // exact name
  else if (words.includes(q)) s = 900;                   // whole word in name
  else if (words.some((w) => w.startsWith(q))) s = 700;  // a name word starts with q ("HTV2")
  else if (name.startsWith(q)) s = 650;

  // country-name match brings in the whole country
  if (ctry === q || cwords.includes(q)) s = Math.max(s, 820);
  else if (ctry.startsWith(q) || cwords.some((w) => w.startsWith(q))) s = Math.max(s, 600);

  // weak fallback: substring buried inside a word ("KCHTV", "MierschTV")
  if (s === 0) {
    if (name.includes(q)) s = 200;
    else if (ctry.includes(q)) s = 120;
  }
  return s;
}

// ---------- render ----------
const listEl = $('#list');
const limits = new Map();   // group name -> shown count
const expanded = new Set(); // group names the user has opened (survives re-render)
const FAVGROUP = 'Favorites';

function render() {
  const frag = document.createDocumentFragment();
  let total = 0;

  // pinned favorites group (filtered by the query while searching)
  const favChans = favoriteChannels().filter((c) => !query || rank(c, query) > 0);
  if (favChans.length) {
    expanded.add(FAVGROUP); // open by default
    frag.appendChild(countryEl(FAVGROUP, favChans, true, '⭐'));
  }

  if (!query) {
    // default view: every country, alphabetical, collapsed (unless reopened)
    for (const name of orderedCountries) {
      const all = byCountry.get(name);
      total += all.length;
      frag.appendChild(countryEl(name, all, false));
    }
  } else {
    // scored: rank channels within each country, and countries by their best match
    const q = query;
    const groups = [];
    for (const name of orderedCountries) {
      const scored = [];
      let best = 0;
      for (const c of byCountry.get(name)) {
        const s = rank(c, q);
        if (s > 0) { scored.push([s, c]); if (s > best) best = s; }
      }
      if (!scored.length) continue;
      scored.sort((a, b) => b[0] - a[0] || a[1].n.localeCompare(b[1].n));
      total += scored.length;
      groups.push([best, name, scored.map((x) => x[1])]);
    }
    groups.sort((a, b) => b[0] - a[0] || a[1].localeCompare(b[1]));
    for (const [, name, chans] of groups) frag.appendChild(countryEl(name, chans, true));
  }

  $('#count').textContent = total.toLocaleString();
  listEl.replaceChildren(frag.childNodes.length ? frag : emptyEl());
}

function emptyEl() {
  const d = document.createElement('div');
  d.className = 'empty';
  d.textContent = 'no channels found';
  return d;
}

function countryEl(name, chans, forceOpen, flag) {
  const isOpen = forceOpen || expanded.has(name);
  const wrap = document.createElement('div');
  wrap.className = 'country' + (isOpen ? ' open' : '');

  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'country-head';
  head.innerHTML =
    `<span class="left"><span class="flag">${flag || FLAGS[name] || '📺'}</span><span>${esc(name)}</span></span>` +
    `<span class="chev">${icon('chevronDown', 20)}</span>`;
  wrap.appendChild(head);

  const body = document.createElement('div');
  body.className = 'country-body';
  body.style.display = isOpen ? '' : 'none';
  wrap.appendChild(body);

  let built = false;
  const build = () => {
    body.replaceChildren();
    const shown = Math.min(limits.get(name) || PER, chans.length);
    for (let k = 0; k < shown; k++) body.appendChild(rowEl(chans[k]));
    if (shown < chans.length) {
      const more = document.createElement('button');
      more.className = 'showmore';
      more.textContent = 'Show More';
      more.onclick = () => { limits.set(name, shown + PER); build(); };
      body.appendChild(more);
    }
    built = true;
  };
  if (isOpen) build();

  head.onclick = () => {
    const open = !expanded.has(name);
    if (open) expanded.add(name); else expanded.delete(name);
    wrap.classList.toggle('open', open);
    body.style.display = open ? '' : 'none';
    if (open && !built) build();
  };
  return wrap;
}

function rowEl(c) {
  const row = document.createElement('div');
  row.className = 'row';
  const logo = c.l
    ? `<img loading="lazy" referrerpolicy="no-referrer" src="${esc(c.l)}" alt="${esc(c.n)}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'"><span class="noimg" style="display:none">${icon('imageOff', 26)}</span>`
    : `<span class="noimg">${icon('imageOff', 26)}</span>`;
  const badges = c.x ? '<span class="badge">Not 24/7</span>' : '';
  const on = favs.has(favKey(c));
  const star =
    `<button class="fav${on ? ' on' : ''}" title="${on ? 'Remove favorite' : 'Add to favorites'}" aria-label="Favorite">` +
    `${icon(on ? 'star' : 'starOutline', 20)}</button>`;
  row.innerHTML =
    `<div class="fav-cell">${star}</div>` +
    `<div class="logo-cell">${logo}</div>` +
    `<div class="name-cell"><div class="name"><a class="label">${esc(c.n)}</a>${badges}</div></div>` +
    `<div class="code-cell">${c.id ? `<code class="id">${esc(c.id)}</code>` : ''}</div>` +
    `<div class="link-cell"><button class="copy" title="Copy shareable link" aria-label="Copy link">${icon('link', 18)}</button></div>`;
  row.querySelector('.fav').onclick = (e) => { e.stopPropagation(); toggleFav(c); };
  row.querySelector('.copy').onclick = (e) => { e.stopPropagation(); copyLink(c, e.currentTarget, 18); };
  row.onclick = (e) => {
    if (e.target.closest('code.id')) return; // let the channel-id code be selectable/copyable
    e.preventDefault();
    play(c);
  };
  return row;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

// ---------- player ----------
let hls = null, current = null;
const player = $('#player'), vid = $('#vid'), pstatus = $('#pstatus');

// shareable token for a channel: its stable id when present, else "@<index>"
const channelToken = (c) => c.id || '@' + c.i;
function resolveToken(tok) {
  if (!tok) return null;
  if (tok[0] === '@') return CH[+tok.slice(1)] || null;
  return CH.find((c) => c.id === tok) || null;
}

function play(c, pushUrl = true) {
  current = c;
  $('#pname').textContent = c.n;
  pstatus.textContent = 'connecting…';
  player.classList.add('show');
  if (pushUrl) {
    const url = location.pathname + '?play=' + encodeURIComponent(channelToken(c));
    history.pushState({ play: channelToken(c) }, '', url);
  }
  const src = '/proxy?i=' + c.i;
  if (hls) { hls.destroy(); hls = null; }
  vid.removeAttribute('src');

  if (vid.canPlayType('application/vnd.apple.mpegurl')) { // Safari: native HLS
    vid.src = src;
    vid.play().then(() => (pstatus.textContent = '')).catch(() => {});
    vid.onplaying = () => (pstatus.textContent = '');
    vid.onerror = async () => {
      let code = 0;
      try { code = (await fetch(src)).status; } catch {} // ask the proxy what the upstream said
      pstatus.textContent = streamMessage(code, '');
    };
  } else if (window.Hls && Hls.isSupported()) {
    hls = new Hls({ maxBufferLength: 20, manifestLoadingTimeOut: 15000 });
    hls.loadSource(src);
    hls.attachMedia(vid);
    hls.on(Hls.Events.MANIFEST_PARSED, () => { vid.play().catch(() => {}); pstatus.textContent = ''; });
    hls.on(Hls.Events.ERROR, (_e, d) => {
      if (!d.fatal) return;
      const code = (d.response && d.response.code) || 0;       // HTTP status the proxy returned
      pstatus.textContent = streamMessage(code, d.details || '');
    });
  } else {
    vid.src = src;
  }
}

// Map a proxy/upstream HTTP status to a clear human reason.
function streamMessage(code, detail) {
  if (code === 401 || code === 403)
    return '🔒 Blocked — this channel is geo-restricted, so the server can’t reach it from its region.';
  if (code === 404 || code === 410) return '📴 Offline — this stream no longer exists.';
  if (/timeout/i.test(detail)) return '⏱️ No response — the stream timed out.';
  if (code === 502 || code === 504 || code === 0)
    return '📴 Offline — the stream isn’t responding (it may be a dead link).';
  if (code >= 500) return `⚠️ Stream error — upstream returned HTTP ${code}.`;
  if (code) return `⚠️ Unavailable — the stream returned HTTP ${code}.`;
  return 'Stream unavailable — it may be offline or geo-restricted.';
}

function closePlayer(pushUrl = true) {
  player.classList.remove('show');
  current = null;
  vid.pause(); vid.removeAttribute('src'); vid.load();
  if (hls) { hls.destroy(); hls = null; }
  if (pushUrl && new URLSearchParams(location.search).has('play')) {
    history.pushState({}, '', location.pathname);
  }
}
$('#pclose').onclick = () => closePlayer();
addEventListener('keydown', (e) => { if (e.key === 'Escape' && player.classList.contains('show')) closePlayer(); });

// ---------- deep linking: ?play=<token> opens the player directly ----------
function applyUrl() {
  const tok = new URLSearchParams(location.search).get('play');
  if (!tok) { if (player.classList.contains('show')) closePlayer(false); return; }
  const c = resolveToken(tok);
  if (c) play(c, false);
}
addEventListener('popstate', applyUrl);

// copy a shareable link to a channel, with a brief check-mark confirmation on the button
async function copyLink(c, btn, size = 20) {
  const link = location.origin + location.pathname + '?play=' + encodeURIComponent(channelToken(c));
  try { await navigator.clipboard.writeText(link); } catch { prompt('Copy this link:', link); return; }
  if (!btn) return;
  btn.innerHTML = icon('check', size); btn.classList.add('ok');
  setTimeout(() => { btn.innerHTML = icon('link', size); btn.classList.remove('ok'); }, 1400);
}
$('#pcopy').innerHTML = icon('link', 20);
$('#pcopy').onclick = () => { if (current) copyLink(current, $('#pcopy'), 20); };

// drag the mini-player by its title bar
(function makeDraggable() {
  const bar = player.querySelector('.player-bar');
  let sx, sy, ox, oy, dragging = false;
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.x')) return; // don't drag when hitting close
    dragging = true;
    const r = player.getBoundingClientRect();
    ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
    player.style.right = 'auto'; player.style.bottom = 'auto';
    player.style.left = ox + 'px'; player.style.top = oy + 'px';
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const w = player.offsetWidth, h = player.offsetHeight;
    let nx = Math.min(Math.max(0, ox + e.clientX - sx), innerWidth - w);
    let ny = Math.min(Math.max(0, oy + e.clientY - sy), innerHeight - h);
    player.style.left = nx + 'px'; player.style.top = ny + 'px';
  });
  bar.addEventListener('pointerup', () => (dragging = false));
})();
