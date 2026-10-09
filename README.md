# DCF — The Decentralized Compute Forum

Editorial forum on GPU markets, DePIN networks and the economics of AI compute.

**Live: https://forum.omc.network** · Part of the omc.network ecosystem (main site · [AITop comparisons](https://top.omc.network))

## What's inside (36 URLs)

```
omc-forum/
├── index.html              # Home — 6 sections: Hot Takes / Deep Dives / Pricing Watch /
│                           #   Landscape / On-Chain Gaming / Homelab, plus a Guides strip
├── posts/                  # 27 editorial articles, one HTML file each
├── guides/                 # 3 hands-on onboarding guides (testnet / wallet / node)
├── tracker.html            # 12 decentralized networks compared, with sources + watch-outs
├── about.html contact.html privacy.html terms.html
├── assets/
│   ├── css/style.css       # Warm editorial theme (amber/paper), light-only
│   └── js/
│       ├── i18n.js         # EN hard default; only explicit switch persists (same policy as omc.network)
│       ├── lang/en.js      # Chrome strings (nav/hero/footer/labels)
│       ├── lang/zh.js      # Simplified Chinese strings
│       └── main.js         # Reading progress bar + giscus comments slot + fallback
├── robots.txt / sitemap.xml / llms.txt
└── vercel.json             # cleanUrls + trailingSlash:false
```

## Content types

| Type | Path | Template |
|---|---|---|
| Article | `/posts/<slug>` | `.article-hero` (chip + h1 + dek + meta) → `.tldr` → `.article-body` → `.takeaways` → `.omc-card` → `.comments` → `.pager` |
| Guide | `/guides/<slug>` | Same template, chip class `guide`; task-oriented, numbered steps, exact values (chain IDs, contract addresses, commands) |
| Page | `/tracker` `/about` `/contact` … | Standard page chrome |

Categories (chip classes): `hot`, `deep`, `pricing`, `land`, `game`, `lab`, `guide`.

## URL contract

Canonical = **extensionless absolute path, no trailing slash** (`/posts/used-rtx-3090-llm-server-2026`, `/guides/…`).
`vercel.json` sets `cleanUrls: true` + `"trailingSlash": false`, so `/x.html` and `/x/` both 308 to `/x`.
Never write an internal link in either old form.

## Adding a new article or guide

1. Copy any file in `posts/` (or `guides/`), edit title / meta / canonical / body / pager links.
   Keep: canonical absolute, `og:*` + `twitter:*` tags, AdSense script, Article JSON-LD, `.omc-card` with an
   `omc.network` link, `.tldr`, `.takeaways` (4+ items), `.article-body` (6+ paragraphs), a `.pager` link,
   and a link to `/tracker` in the nav.
2. Add a card to the matching section in `index.html` (articles use `.post-card`, guides use `.guide-card`).
3. Add a `<url>` entry to `sitemap.xml` and a line to `llms.txt`.
4. Run the regression below — it asserts sitemap URL count, per-page structure, chip counts and cross-links.

## Regression test

```
NODE_PATH=<path-to-node_modules-with-jsdom> node verify-forum.js
```

Baseline: **588 assertions, 0 failures**. Serves the folder locally, loads every page in jsdom, and checks home
rendering + card/chip counts, every article and guide page, tracker filters, i18n switching/persistence, giscus
injection, and head/SEO tags on every page. Off-origin requests are intercepted (AdSense/giscus can't run in jsdom),
so any remaining console error is a genuine local problem.

## Comments (giscus)

Enable GitHub Discussions on this repo, install the [giscus app](https://giscus.app), then fill the
`window.DCF_GISCUS` config at the bottom of each `posts/*.html` (repo / repoId / categoryId).
Until configured, pages show a graceful "comments open soon" fallback.

## Ads

Google AdSense (`ca-pub-2694516805115904`) is loaded on every page. `ads.txt` is inherited from the apex domain
(omc.network/ads.txt) — subdomains don't need their own copy.

## License

MIT
