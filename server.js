#!/usr/bin/env node
// IPTV browser — browse iptv-org channels and watch them inline in the browser.
// Serves the static UI + a channel API + an HLS proxy (to defeat CORS). No deps.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8765;
const DIR = __dirname;
const PUB = path.join(DIR, 'public');

// ---------- parse the playlist ----------
const attr = (line, key) => {
  const m = line.match(new RegExp(key + '="([^"]*)"'));
  return m ? m[1] : '';
};
const QUALITY = /\s*\((\d{3,4}p|HD|SD|FHD|UHD|4K)\)\s*$/i;
function cleanName(raw) {
  let n = raw.replace(/\s*\[[^\]]*\]\s*/g, ' ').trim(); // drop [Geo-blocked] / [Not 24/7] tags
  n = n.replace(QUALITY, '').trim(); // drop trailing (1080p) etc.
  return n || raw;
}
function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const q = line.lastIndexOf('",');
      const raw = (q !== -1 ? line.slice(q + 2) : line.slice(line.indexOf(',') + 1)).trim();
      const id = (attr(line, 'tvg-id') || '').split('@')[0];
      cur = {
        raw,
        name: cleanName(raw),
        id,
        country: attr(line, 'group-title') || 'Undefined',
        logo: attr(line, 'tvg-logo'),
        ref: attr(line, 'http-referrer'),
        ua: attr(line, 'http-user-agent'),
        geo: /\[Geo-blocked\]/i.test(raw),
        closed: /\[Not 24\/7\]/i.test(raw),
        url: '',
      };
    } else if (cur && line.startsWith('#EXTVLCOPT:http-referrer=')) {
      cur.ref = cur.ref || line.split('=').slice(1).join('=');
    } else if (cur && line.startsWith('#EXTVLCOPT:http-user-agent=')) {
      cur.ua = cur.ua || line.split('=').slice(1).join('=');
    } else if (cur && line && !line.startsWith('#')) {
      cur.url = line.trim();
      out.push(cur);
      cur = null;
    }
  }
  return out;
}

// ---------- channel data (seeded from bundled files, kept in sync with iptv-org) ----------
let CH = [];                 // [{name,country,logo,id,ref,ua,geo,closed,url}]
let CHANNELS_JSON = '[]';    // compact payload; array index == server channel index
let COUNTRIES_JSON = '[]';
let lastSync = null;         // ISO string of the last successful upstream sync

function setData(channels, countries) {
  CH = channels;
  CHANNELS_JSON = JSON.stringify(
    CH.map((c) => ({ n: c.name, c: c.country, l: c.logo, id: c.id, g: c.geo ? 1 : 0, x: c.closed ? 1 : 0 }))
  );
  if (countries) COUNTRIES_JSON = JSON.stringify(countries.map((c) => ({ name: c.name, code: c.code, flag: c.flag })));
}

// seed synchronously from the files baked into the image, so the app works instantly / offline
setData(parseM3U(fs.readFileSync(path.join(DIR, 'channels.m3u'), 'utf8')),
        JSON.parse(fs.readFileSync(path.join(DIR, 'countries.json'), 'utf8')));
console.log(`Seeded ${CH.length} channels from bundled files.`);

// ---------- keep in sync with the official iptv-org lists ----------
const SRC_CHANNELS = process.env.CHANNELS_URL || 'https://iptv-org.github.io/iptv/index.country.m3u';
const SRC_COUNTRIES = process.env.COUNTRIES_URL || 'https://iptv-org.github.io/api/countries.json';
const SYNC_HOURS = Number(process.env.SYNC_HOURS || 24); // 0 disables syncing

async function syncFromUpstream() {
  try {
    const [m3u, countries] = await Promise.all([
      fetch(SRC_CHANNELS).then((r) => { if (!r.ok) throw new Error('channels HTTP ' + r.status); return r.text(); }),
      fetch(SRC_COUNTRIES).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    const channels = parseM3U(m3u);
    if (channels.length < 1000) throw new Error(`suspiciously few channels (${channels.length}) — keeping current`);
    setData(channels, countries);
    lastSync = new Date().toISOString();
    console.log(`Synced ${channels.length} channels from iptv-org at ${lastSync}.`);
  } catch (e) {
    console.warn('Sync failed, keeping current data:', e.message);
  }
}

if (SYNC_HOURS > 0) {
  syncFromUpstream(); // refresh shortly after startup
  setInterval(syncFromUpstream, SYNC_HOURS * 3600 * 1000).unref();
}

// ---------- helpers ----------
const send = (res, code, type, body, extra = {}) =>
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', ...extra }).end(body);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
function serveStatic(res, file) {
  const p = path.join(PUB, file);
  if (!p.startsWith(PUB)) return send(res, 403, 'text/plain', 'no');
  fs.readFile(p, (err, buf) => {
    if (err) return send(res, 404, 'text/plain', 'not found');
    send(res, 200, MIME[path.extname(p)] || 'application/octet-stream', buf);
  });
}

// Rewrite an HLS manifest so every nested URL is fetched back through our proxy.
function rewriteManifest(text, baseUrl, ref, ua) {
  const prox = (u) => {
    let abs;
    try { abs = new URL(u, baseUrl).href; } catch { return u; }
    let q = '/proxy?u=' + encodeURIComponent(abs);
    if (ref) q += '&r=' + encodeURIComponent(ref);
    if (ua) q += '&a=' + encodeURIComponent(ua);
    return q;
  };
  return text.split('\n').map((line) => {
    const t = line.trim();
    if (!t) return line;
    if (t.startsWith('#')) return line.replace(/URI="([^"]+)"/g, (_, u) => `URI="${prox(u)}"`);
    return prox(t);
  }).join('\n');
}

async function proxyFetch(res, url, ref, ua) {
  const headers = { 'User-Agent': ua || 'Mozilla/5.0', Accept: '*/*' };
  if (ref) { headers.Referer = ref; try { headers.Origin = new URL(ref).origin; } catch {} }
  let up;
  try {
    up = await fetch(url, { headers, redirect: 'follow' });
  } catch (e) {
    return send(res, 502, 'text/plain', 'upstream fetch failed: ' + e.message);
  }
  if (!up.ok) return send(res, up.status, 'text/plain', `upstream ${up.status}`);
  const ct = up.headers.get('content-type') || '';
  if (/mpegurl/i.test(ct) || /\.m3u8(\?|$)/i.test(url)) {
    const body = rewriteManifest(await up.text(), up.url || url, ref, ua);
    return send(res, 200, 'application/vnd.apple.mpegurl', body, { 'Cache-Control': 'no-store' });
  }
  const buf = Buffer.from(await up.arrayBuffer());
  send(res, 200, ct || 'application/octet-stream', buf, { 'Cache-Control': 'no-store' });
}

// ---------- routes ----------
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = u.pathname;

  if (p === '/') return serveStatic(res, 'index.html');
  if (p === '/api/channels') return send(res, 200, 'application/json', CHANNELS_JSON, { 'Cache-Control': 'public, max-age=600' });
  if (p === '/api/countries') return send(res, 200, 'application/json', COUNTRIES_JSON, { 'Cache-Control': 'public, max-age=600' });
  if (p === '/healthz') return send(res, 200, 'text/plain', 'ok');
  if (p === '/api/status')
    return send(res, 200, 'application/json',
      JSON.stringify({ channels: CH.length, lastSync, syncHours: SYNC_HOURS, source: SRC_CHANNELS }));
  if (p === '/api/sync') { syncFromUpstream(); return send(res, 202, 'application/json', JSON.stringify({ triggered: true })); }

  if (p === '/proxy') {
    const i = u.searchParams.get('i');
    if (i !== null) {
      const ch = CH[+i];
      if (!ch) return send(res, 404, 'text/plain', 'no such channel');
      return proxyFetch(res, ch.url, ch.ref, ch.ua);
    }
    const url = u.searchParams.get('u');
    if (!url) return send(res, 400, 'text/plain', 'missing u');
    return proxyFetch(res, url, u.searchParams.get('r') || '', u.searchParams.get('a') || '');
  }

  if (/^\/[\w.-]+$/.test(p)) return serveStatic(res, p.slice(1)); // app.js, app.css, hls.min.js…
  send(res, 404, 'text/plain', 'not found');
});
server.listen(PORT, () => console.log(`\n  ▶  IPTV ready on http://localhost:${PORT}\n`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
