# DCF — The Decentralized Compute Forum

Editorial forum on GPU markets, DePIN networks and the economics of AI compute.
Live: **https://forum.omc.network** · Part of the omc.network ecosystem (main site + [AITop comparisons](https://top.omc.network)).

## What's inside

```
omc-forum/
├── index.html              # Home: four sections (Hot Takes / Deep Dives / Pricing Watch / Landscape)
├── posts/                  # 8 launch articles, one HTML file each (SEO-friendly clean URLs)
├── assets/
│   ├── css/style.css       # Warm editorial theme (amber/paper), light-only
│   └── js/
│       ├── i18n.js         # EN hard default; only explicit switch persists (same policy as omc.network)
│       ├── lang/en.js      # Chrome strings (nav/hero/footer/labels)
│       ├── lang/zh.js      # Simplified Chinese strings
│       └── main.js         # Reading progress bar + giscus comments slot + fallback
├── robots.txt / sitemap.xml
├── vercel.json             # cleanUrls (no .html extension)
└── verify-forum.js         # jsdom functional regression test
```

## Adding a new article

1. Copy any file in `posts/`, edit title/meta/canonical/body/pager links.
2. Add a card to the matching section in `index.html`.
3. Add a `<url>` entry to `sitemap.xml` with the publish date.
4. Run `node verify-forum.js` (needs `NODE_PATH` pointing at a node_modules with jsdom).

## Comments (giscus)

Enable GitHub Discussions on this repo, install the [giscus app](https://giscus.app), then fill the
`window.DCF_GISCUS` config at the bottom of each `posts/*.html` (repo / repoId / categoryId).
Until configured, pages show a graceful "comments open soon" fallback.

## Ads

Google AdSense (`ca-pub-2694516805115904`) is loaded on every page. ads.txt is inherited from the
apex domain (omc.network/ads.txt) — subdomains don't need their own copy.

## Regression test

```
NODE_PATH=<path-to-node_modules-with-jsdom> node verify-forum.js
```
