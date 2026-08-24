# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static Svelte 5 / SvelteKit dashboard showing the health of all 6 OneBusAway
SDK targets (Go, Java, Kotlin, Node, Python, Ruby) across their staging and
production repos — CI status, staging-vs-production commit diffs, latest
published package versions, and pending promotions. It has no backend: all
data is fetched client-side from the GitHub REST API (and, for two package
registries, at build time — see below). Deployed to GitHub Pages.

## Commands

```sh
npm run dev              # dev server (vite dev)
npm run check             # svelte-kit sync + svelte-check type checking
npm run build              # production build (writes to build/)
npm run preview           # serve the production build locally
```

There is no test suite. `npm run check` is the only automated verification —
run it after any change.

Local dev against the private staging repos (or to avoid GitHub's 60 req/hr
unauthenticated rate limit) requires a `VITE_GITHUB_TOKEN` in `.env` (copy
`.env.example`). Without it, only the public production repos and
CORS-friendly registries (npm, PyPI) resolve.

## Architecture

### Two different fetch timings for one reason: CORS

The dashboard's core split is *when* each piece of data is fetched, driven
entirely by which APIs support CORS from a browser:

- **Client-side, live** (`src/lib/github.js`, `src/lib/registries.js`,
  orchestrated by `src/lib/dashboard.svelte.js`): all GitHub API calls, plus
  npm and PyPI version lookups. These support CORS, so they're refetched in
  the browser on a user-configurable interval (`src/lib/settings.svelte.js`,
  1–60 min, persisted to localStorage) or a manual refresh.
- **Build-time only** (`src/routes/+page.server.js`): Maven Central
  (`repo1.maven.org`) and RubyGems don't send CORS headers, so those two
  registry lookups run once per build (`load()` in a `+page.server.js`,
  which SvelteKit only ever executes server-side — a `+page.js` would get
  re-run in the browser and hit the same CORS wall). Their values are
  serialized into the prerendered page and passed to
  `dashboard.svelte.js#refresh()` as `buildTimeVersions`. Freshness for
  these two registries is bounded by how often the site rebuilds (the
  deploy workflow rebuilds every 10 minutes regardless of new commits, for
  exactly this reason).

When adding a new registry, check whether it sends
`Access-Control-Allow-Origin` before deciding which path it belongs on.

### Why CI status needs a second GitHub API call per repo

`github.js#fetchTargetData` fetches each repo's 10 most recent workflow runs
*and* separately queries the `ci.yml` workflow's runs directly
(`getWorkflowRunsFor`). This isn't redundant: bot workflows like "Sync SDK
repos" run far more often than CI and can fill the entire 10-run window,
silently pushing real CI results out of it. The general run list is still
used for the activity feed and the per-card "recent workflow runs" panel,
which intentionally show everything, not just CI.

### Diff calculation assumes shared history

`compareCommits` in `github.js` compares production's HEAD against staging's
HEAD *within the staging repo's context* (`/repos/{staging}/compare/{prod_sha}...{staging_sha}`),
not across two repos. This only works because production repos are generated
from staging and share commit history. If that relationship ever changes,
the compare call will start failing (it degrades to `ahead_by: 0` on error,
not a visible error).

### Reactive stores (`*.svelte.js` files)

State that needs to survive across components (or persist to
localStorage/DOM) lives in `.svelte.js` modules using Svelte 5 runes at
module scope, each exporting a singleton: `dashboard.svelte.js` (fetched
data + derived health/promotions/activity feed), `theme.svelte.js`
(dark/light, mirrors a `.dark` class set pre-hydration by an inline script
in `app.html` to avoid a flash of the wrong theme), `settings.svelte.js`
(refresh interval), `now.svelte.js` (a 30s ticking clock other components
read to keep "X ago" text live — without it, relative-time text only
updates when some unrelated prop happens to change, since nothing else
forces a re-render).

### Base path / adapter-static

`vite.config.js` sets `paths.base` to `/sdk-dashboard` in production builds
(GitHub Pages serves the site under `/<repo-name>/`) and empty in dev. The
repo name must match this exactly or all assets 404 on Pages — if the repo
is ever renamed, update this too. `adapter-static` with `strict: true`
requires every route to be prerenderable; `+layout.js` sets
`export const prerender = true` for this reason.

### Config as the single source of truth for targets

`src/lib/config.js`'s `TARGETS` array is the only place staging/production
repo names, registry endpoints, and per-language colors are defined. Every
component and data-fetch function takes a `Target` from this array — there's
no other place target metadata is duplicated.

## Deployment

`.github/workflows/deploy.yml` builds and deploys on push to `main` and on a
10-minute schedule, injecting `secrets.VITE_GITHUB_TOKEN` at build time. That
token ends up baked into the public client bundle (by design — this is a
static site with no backend), so it must be **read-only** and scoped to just
the SDK repos, not a broad personal token. See `README.md` for the exact
scopes needed.
