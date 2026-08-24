# OneBusAway SDK Dashboard

Static Svelte dashboard showing the health of all 6 OneBusAway SDK targets
(Go, Java, Kotlin, Node, Python, Ruby) across staging and production. Pulls
live data from the GitHub REST API client-side — no backend. Hosted on
GitHub Pages.

## Developing

```sh
npm install
cp .env.example .env   # fill in VITE_GITHUB_TOKEN, see below
npm run dev
```

`VITE_GITHUB_TOKEN` is optional for local dev against public repos, but
required to see staging data (the staging repos are private) and to avoid
GitHub's 60-requests/hour unauthenticated rate limit (5000/hour once
authenticated).

## Type checking

```sh
npm run check
```

## Building

```sh
npm run build
npm run preview   # serve the production build locally
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every
push to `main` and on a 10-minute schedule (so CI status stays fresh even
without new commits). It reads `VITE_GITHUB_TOKEN` from the repo's
`secrets.VITE_GITHUB_TOKEN` and bakes it into the static bundle — the token
should be read-only (Contents: Read, Actions: Read, Metadata: Read) scoped
to the OneBusAway org, since it ends up in the public client bundle.

The site is published at `https://onebusaway.github.io/sdk-dashboard/`.
