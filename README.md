# iptv

A web app to browse the ~13,600 [iptv-org](https://github.com/iptv-org/iptv) channels and
**watch them inline in the browser**. The UI mirrors the look of <https://iptv-org.github.io/>
(dark/light theme, country-grouped accordion, search), but instead of just listing streams it
plays them in a small, draggable bottom-right mini-player so you can keep browsing while watching.

## Why it needs a server (and isn't just static)

A plain web page can't play most IPTV streams: they're HLS on remote hosts that don't send CORS
headers, so the browser blocks them. This app ships a tiny Node server that **proxies** the stream
through the same origin (and forwards the per-channel `http-referrer` / `http-user-agent` that some
channels require), so playback Just Works in the browser. No VLC, no external player.

## Stack

- **`server.js`** — dependency-free Node server. Serves the static UI, a channel API
  (`/api/channels`, `/api/countries`), and the HLS proxy (`/proxy`). Listens on `PORT` (default 8765).
- **`public/`** — the frontend (`index.html`, `app.css`, `app.js`) + bundled `hls.min.js`
  (for non-Safari browsers; Safari plays HLS natively).
- **`channels.m3u`** — iptv-org's country-grouped playlist (the channel data).
- **`countries.json`** — country names → flags.

## Run it

### Dev (local, http://localhost:7777)

```bash
docker compose -f docker-compose-dev.yml up --build
```

Or without Docker: `node server.js` then open <http://localhost:8765>.

### Production (behind a shared Caddy)

The deployment domain is **not** hardcoded — set it in `.env` (gitignored; copy `.env.example`):

```bash
cp .env.example .env
# edit .env →  IPTV_DOMAIN=iptv.example.com
```

This joins the external `caddy-net` and is reverse-proxied by your Caddy host.

```bash
# on the server, in this directory:
docker compose up -d --build
```

Add a site block to your Caddyfile. Use Caddy's env-var syntax so the domain stays in `.env`
(Caddy reads `IPTV_DOMAIN` from its own environment — pass it via the caddy container's `env_file`
or `environment`):

```
{$IPTV_DOMAIN} {
    import common-security
    reverse_proxy iptv:8765 {
        flush_interval -1            # stream live HLS without buffering
        transport http { read_timeout 10m; write_timeout 10m }
    }
}
```

After deploying, reload Caddy: `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile`.

**DNS:** point an `A`/`AAAA` record for your `IPTV_DOMAIN` at the host so Caddy can issue a TLS cert.

## Staying in sync with iptv-org

The server keeps itself in sync with the official lists automatically:

- On startup it seeds from the bundled `channels.m3u` / `countries.json` (so it works instantly, even offline).
- Then it fetches the latest from iptv-org and refreshes its in-memory data **every `SYNC_HOURS` hours**
  (default 24 — iptv-org regenerates the lists roughly daily). No restart or rebuild needed.
- If a fetch fails or returns too few channels, it keeps the current data.

Endpoints / env:

| | |
|---|---|
| `GET /api/status` | `{ channels, lastSync, syncHours, source }` |
| `GET /api/sync` | trigger a refresh now (returns `202`) |
| `SYNC_HOURS` | refresh interval in hours; `0` disables auto-sync |
| `CHANNELS_URL` / `COUNTRIES_URL` | override the upstream sources |

The bundled files are just the offline seed. To refresh that seed for committing (optional):

```bash
curl -sL -o channels.m3u https://iptv-org.github.io/iptv/index.country.m3u
curl -sL -o countries.json https://iptv-org.github.io/api/countries.json
```

## Notes

- Many entries are dead, geo-blocked, or part-time — normal for IPTV. Dead streams show a
  "stream unavailable" message in the player; just pick another.
- The proxy is intentionally open only to playback use; it forwards to whatever channel index /
  URL is requested. It's fine behind your own domain but don't treat it as a general open proxy.
