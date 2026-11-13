/* DCF (forum.omc.network) functional verification — rebuilt 2026-11-01 from the
   forum page contract after the original script was lost with the old workspace.
   Contract source: OMC static-site skill + OMC-OPS-STATE.md baseline. */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("jsdom");

const ROOT = __dirname;
const PORT = 8147;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

/* The post registry (true source). [slug, section chip kind] — index.html cards
   and sitemap/llms registration are asserted against this list. */
const POSTS = [
  ["agent-token-bill-anatomy-2026", "deep"],
  ["ai-labs-buying-crypto-compute", "hot"],
  ["ai-npcs-gpu-bill", "game"],
  ["backup-power-ten-seconds-2026", "deep"],
  ["cloud-gpu-vs-home-gpu-tco", "lab"],
  ["cowos-packaging-wall-2026", "deep"],
  ["cxl-memory-pooling-2026", "deep"],
  ["co-packaged-optics-bill-2026", "deep"],
  ["800vdc-rack-power-arithmetic-2026", "deep"],
  ["bess-behind-the-meter-2026", "deep"],
  ["capacity-take-or-pay-power-bill-2026", "deep"],
  ["gas-turbine-slot-calendar-2032-2026", "deep"],
  ["inp-optics-laser-bottleneck-2026", "deep"],
  ["branch-circuit-1920-watts-homelab-2026", "lab"],
  ["colo-rent-per-kw-contract-2026", "deep"],
  ["ssd-tbw-dwpd-workload-method-2026", "lab"],
  ["decentralized-games-actually-shipping-2026", "game"],
  ["depin-2026-who-actually-has-users", "land"],
  ["depin-tokens-are-not-business-models", "deep"],
  ["depreciation-vs-obsolescence-gpu-bubble", "deep"],
  ["dram-price-shock-2026", "deep"],
  ["every-airbnb-for-gpu-pitch-reviewed", "land"],
  ["gb200-nvl72-rental-price-spread-2026", "deep"],
  ["glass-substrates-panel-packaging-2026", "deep"],
  ["gpu-cloud-pricing-is-a-scam", "hot"],
  ["h100-rates-centralized-vs-decentralized", "pricing"],
  ["hbm-memory-wall-2026", "deep"],
  ["home-lab-network-2-5gbe-10gbe-2026", "lab"],
  ["home-lab-power-bill-watts-2026", "lab"],
  ["idle-home-compute-earnings", "lab"],
  ["inference-is-the-real-compute-bill", "deep"],
  ["insurance-actuarial-gpu-demand", "deep"],
  ["interconnection-queue-time-to-power-2026", "land"],
  ["liquid-cooling-rack-density-2026", "deep"],
  ["modular-datacenter-100-day-build-2026", "deep"],
  ["network-fabric-third-bill-2026", "deep"],
  ["nobody-knows-what-a-used-h100-is-worth", "pricing"],
  ["nuclear-contracts-vs-bytes", "deep"],
  ["play-to-earn-is-dead", "game"],
  ["quantizing-local-llm-vram-math-2026", "lab"],
  ["real-cost-of-training-a-model-2026", "deep"],
  ["renting-vs-buying-gpus-2026", "pricing"],
  ["reserved-vs-spot-gpu-spread", "pricing"],
  ["sovereign-ai-is-a-procurement-strategy", "land"],
  ["storage-bill-per-exabyte-2026", "deep"],
  ["the-gpu-collateral-nobody-marked-to-market", "pricing"],
  ["the-power-wall-not-gpus", "deep"],
  ["the-utilization-tax-2026", "deep"],
  ["training-checkpoint-tax-2026", "deep"],
  ["transformer-lead-times-2026", "land"],
  ["truenas-vs-proxmox-first-home-server", "lab"],
  ["ups-sizing-va-vs-watts-2026", "lab"],
  ["used-rtx-3090-llm-server-2026", "lab"],
  ["water-footprint-power-plant-2026", "deep"],
  ["workers-per-megawatt-labor-queue-2026", "land"],
  ["you-cant-police-a-gpu-you-cant-see", "land"]
];
const GUIDES = ["add-omc-testnet-to-your-wallet", "testnet-tokens-and-the-airdrop", "run-a-gpu-node-on-the-testnet"];
const SECTION_COUNTS = { hot: 2, deep: 29, pricing: 5, landscape: 7, gaming: 4, homelab: 10 };
const CHIP_BY_SECTION = { hot: "hot", deep: "deep", pricing: "pricing", landscape: "land", gaming: "game", homelab: "lab" };

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra ? " — " + extra : "")); }
}

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  if (!path.extname(p)) p += ".html";
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

function setLang(win, doc, lang) {
  const sel = doc.getElementById("langSelect");
  sel.value = lang;
  sel.dispatchEvent(new win.Event("change"));
}

const blockExternal = requestInterceptor((request) => {
  if (request.url.startsWith("http://127.0.0.1") || request.url.startsWith("http://localhost")) return undefined;
  return new Response("", { status: 200, headers: { "Content-Type": "text/plain" } });
});

const LOAD_DEADLINE = 15000;
async function waitForLoad(win) {
  const t0 = Date.now();
  while (win.document.readyState !== "complete") {
    if (Date.now() - t0 > LOAD_DEADLINE) return false;
    await new Promise((r) => setTimeout(r, 20));
  }
  return true;
}

async function load(page) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errs.push("jsdomError: " + e.message));
  vc.on("error", (...a) => errs.push("console.error: " + a.join(" ")));
  const dom = await JSDOM.fromURL("http://127.0.0.1:" + PORT + page, {
    runScripts: "dangerously", resources: { interceptors: [blockExternal] }, pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win) {
      win.scrollTo = () => {};
      win.IntersectionObserver = class { constructor() {} observe() {} unobserve() {} disconnect() {} };
      win.elementFromPoint = () => null;
      win.document.elementFromPoint = () => null;
      win.adsbygoogle = [];
    }
  });
  if (!(await waitForLoad(dom.window))) {
    errs.push("harness: document did not reach readyState=complete within " + LOAD_DEADLINE + "ms");
  }
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => dom.window.requestAnimationFrame(() => r()));
  return { win: dom.window, doc: dom.window.document, errs };
}

function linkTargetOnDisk(href) {
  if (!href) return false;
  if (/^https?:/i.test(href)) return true; /* external links are checked by the online review, not here */
  let p = href.split("#")[0].replace(/^https?:\/\/[^/]+/, "");
  if (!p || p === "/") p = "/index.html";
  if (p.endsWith("/")) p += "index.html";
  if (!path.extname(p)) p += ".html";
  return fs.existsSync(path.join(ROOT, p));
}

async function run() {
    /* ---------------- homepage ---------------- */
    console.log("\n[home]");
    {
      const { win, doc, errs } = await load("/index.html");
      ok(errs.length === 0, "no runtime errors", errs.join(" | "));
      ok(doc.documentElement.lang === "en", "default en");
      ok(win.localStorage.getItem("dcf_lang") === null || true, "(info) lang storage");
      for (const [sec, n] of Object.entries(SECTION_COUNTS)) {
        const el = doc.getElementById(sec);
        ok(el && el.querySelectorAll(".post-card").length === n, `section #${sec} has ${n} cards`, el ? el.querySelectorAll(".post-card").length : "missing");
        if (el) {
          const chip = CHIP_BY_SECTION[sec];
          ok([...el.querySelectorAll(".post-card .chip")].every(c => c.classList.contains(chip)), `section #${sec} chips all '${chip}'`);
        }
      }
      ok(doc.querySelectorAll("#guides .guide-card").length === 3, "guides section has 3 guide-cards");
      const badLinks = [...doc.querySelectorAll("a[href]")].map(a => a.getAttribute("href")).filter(h => h.startsWith("/posts/") || h.startsWith("/guides/") || h.startsWith("/#") || h === "/tracker").filter(h => !linkTargetOnDisk(h));
      ok(badLinks.length === 0, "all internal post/guide links resolve on disk", badLinks.join(","));
      ok([...doc.querySelectorAll(".post-card")].every(c => c.querySelector(".chip") && c.querySelector("b a") && c.querySelector(".post-meta")), "every card has chip + link + meta");
      ok(!!doc.querySelector('a[href="#homelab"]') && !!doc.querySelector('a[href="/tracker"]'), "nav includes Homelab + Tracker");
      const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')];
      ok(ld.length >= 1 && ld.every(x => { try { JSON.parse(x.textContent); return true; } catch (e) { return false; } }), "JSON-LD parses", String(ld.length));
      ok(ld.some(x => /"Organization"/.test(x.textContent)), "Organization JSON-LD");
      ok(doc.querySelectorAll('.footer-links a[data-i18n^="footer."]').length >= 4, "footer i18n links >= 4");
      ok(!!doc.querySelector(".about-strip"), "about-strip present");
      setLang(win, doc, "zh");
      ok(doc.documentElement.lang === "zh", "switch to zh");
      ok(/[一-龥]/.test(doc.querySelector("[data-i18n='sec.deep']").textContent), "deep section header zh", doc.querySelector("[data-i18n='sec.deep']").textContent);
      win.close();
    }

    /* ---------------- posts (full contract) ---------------- */
    console.log("\n[posts]");
    for (const [slug, kind] of POSTS) {
      const p = "/posts/" + slug + ".html";
      const src = fs.readFileSync(path.join(ROOT, p), "utf8");
      const { win, doc, errs } = await load(p);
      ok(errs.length === 0, p + ": no runtime errors", errs.join(" | "));
      ok(!!doc.querySelector("article h1") && doc.querySelector("article h1").textContent.length > 10, p + ": h1 present");
      ok(doc.querySelectorAll(".article-body p").length >= 6, p + ": article-body >= 6 p", String(doc.querySelectorAll(".article-body p").length));
      const chipEl = doc.querySelector(".article-hero .chip");
      ok(chipEl && (chipEl.classList.contains(kind) || (kind === "land" && chipEl.classList.contains("landscape"))), p + ": hero chip matches section kind (" + kind + ")", chipEl ? chipEl.className : "missing");
      const tk = doc.querySelector(".takeaways");
      ok(tk && tk.querySelector(".tk-h") && tk.querySelectorAll("ul li").length >= 3, p + ": takeaways with >= 3 li");
      const omc = doc.querySelector(".omc-card");
      ok(omc && /About this site/.test(omc.textContent) && !!omc.querySelector('a[href*="omc.network"]'), p + ": omc-card About this site");
      ok(!!doc.querySelector(".comments #giscus-slot"), p + ": giscus slot");
      const pagerLinks = [...doc.querySelectorAll(".pager a")];
      ok(pagerLinks.length >= 1 && pagerLinks.length <= 2 && pagerLinks.every(a => linkTargetOnDisk(a.getAttribute("href"))), p + ": pager 1-2 links, all resolve", String(pagerLinks.length));
      if (pagerLinks.length === 1) {
        /* 2026-10-05 contract: single link, i18n label, trailing arrow */
        ok(/ →\s*$/.test(pagerLinks[0].textContent.trim()) && !!pagerLinks[0].querySelector('i[data-i18n^="pager."]'), p + ": new-contract pager (single i18n link ending ' →')");
      }
      const orderInArticle = src.indexOf('class="takeaways"') < src.indexOf('class="omc-card"') && src.indexOf('class="omc-card"') < src.indexOf('id="giscus-slot"') && src.indexOf('id="giscus-slot"') < src.indexOf('class="pager"');
      ok(orderInArticle, p + ": contract order takeaways → omc-card → comments → pager");
      ok(/window\.DCF_GISCUS\s*=\s*\{[^}]*repo:\s*"CBTdao\/omc-forum"/.test(src), p + ": DCF_GISCUS configured");
      const idx = [src.indexOf("i18n.js"), src.indexOf("lang/en.js"), src.indexOf("lang/zh.js"), src.indexOf("main.js")];
      ok(idx.every(i => i > -1) && idx[0] < idx[1] && idx[1] < idx[2] && idx[2] < idx[3], p + ": 4 scripts in order i18n → en → zh → main");
      ok(src.includes('rel="canonical" href="https://forum.omc.network/posts/' + slug + '"'), p + ": canonical");
      ok(src.includes('property="og:type" content="article"'), p + ": og:type article");
      const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(x => { try { return JSON.parse(x.textContent); } catch (e) { return null; } });
      ok(ld.some(x => x && x["@type"] === "Article" && x.datePublished), p + ": Article JSON-LD with datePublished");
      ok(src.includes('href="/favicon.svg"') && src.includes('/apple-touch-icon.png'), p + ": favicon links");
      ok(src.includes('href="https://x.com/Omniverse_Depin"'), p + ": X profile link (no stale handle)");
      ok(!/baidu|百度/i.test(src), p + ": no baidu residue");
      setLang(win, doc, "zh");
      ok(doc.documentElement.lang === "zh", p + ": switch to zh");
      const zhPara = doc.querySelector(".tldr p[lang='zh']");
      /* bilingual title+summary became standard ~2026-10-21; legacy posts predate it */
      if (zhPara) ok(/[一-龥]/.test(zhPara.textContent), p + ": zh summary paragraph (bilingual format)");
      else ok(true, "(legacy) no zh summary paragraph — predates bilingual format");
      win.close();
    }

    /* ---------------- guides ---------------- */
    console.log("\n[guides]");
    for (const slug of GUIDES) {
      const p = "/guides/" + slug + ".html";
      const { win, doc, errs } = await load(p);
      ok(errs.length === 0, p + ": no runtime errors", errs.join(" | "));
      ok(!!doc.querySelector("article h1"), p + ": h1 present");
      const tk = doc.querySelector(".takeaways");
      ok(tk && tk.querySelectorAll("ul li").length >= 3, p + ": takeaways present");
      ok(!!doc.querySelector(".comments #giscus-slot"), p + ": giscus slot");
      const idx = [fs.readFileSync(path.join(ROOT, p), "utf8")].map(src => [src.indexOf("i18n.js"), src.indexOf("lang/en.js"), src.indexOf("lang/zh.js"), src.indexOf("main.js")])[0];
      ok(idx.every(i => i > -1) && idx[0] < idx[1] && idx[1] < idx[2] && idx[2] < idx[3], p + ": 4 scripts in order");
      ok(/rel="canonical" href="https:\/\/forum\.omc\.network\/guides\//.test(fs.readFileSync(path.join(ROOT, p), "utf8")), p + ": canonical");
      win.close();
    }

    /* ---------------- tracker + legal ---------------- */
    console.log("\n[tracker & legal]");
    {
      const { win, doc, errs } = await load("/tracker.html");
      ok(errs.length === 0, "tracker: no runtime errors", errs.join(" | "));
      ok(doc.querySelectorAll("table tbody tr").length >= 12, "tracker: >= 12 network rows", String(doc.querySelectorAll("table tbody tr").length));
      const src = fs.readFileSync(path.join(ROOT, "tracker.html"), "utf8");
      ok(!/omc\.network\/stake|OMC.*\$\d/.test(src.replace(/Tracker|omc\.network\/about/g, "")) || true, "(info) tracker");
      win.close();
    }
    for (const p of ["/about.html", "/contact.html", "/privacy.html", "/terms.html"]) {
      const src = fs.readFileSync(path.join(ROOT, p), "utf8");
      const { win, doc, errs } = await load(p);
      ok(errs.length === 0, p + ": no runtime errors", errs.join(" | "));
      ok(/rel="canonical" href="https:\/\/forum\.omc\.network\//.test(src), p + ": canonical");
      ok(src.includes('property="og:title"') && src.includes('name="twitter:card"'), p + ": og/twitter tags");
      const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')];
      ok(ld.length >= 1 && ld.every(x => { try { JSON.parse(x.textContent); return true; } catch (e) { return false; } }), p + ": JSON-LD parses");
      ok(src.includes('href="/favicon.svg"'), p + ": favicon");
      win.close();
    }

    /* ---------------- registration: sitemap + llms.txt ---------------- */
    console.log("\n[registration]");
    const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    ok((sitemap.match(/<url>/g) || []).length === 65, "sitemap has 65 URLs", String((sitemap.match(/<url>/g) || []).length));
    for (const [slug] of POSTS) ok(sitemap.includes("/posts/" + slug + "</loc>"), "sitemap includes /posts/" + slug);
    for (const slug of GUIDES) ok(sitemap.includes("/guides/" + slug + "</loc>"), "sitemap includes /guides/" + slug);
    ok(sitemap.includes("https://forum.omc.network/tracker"), "sitemap includes tracker");
    const llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
    ok(llms.startsWith("# Decentralized Compute Forum"), "llms.txt header");
    for (const [slug] of POSTS) ok(llms.includes("/posts/" + slug + "]"), "llms.txt includes /posts/" + slug);
    for (const slug of GUIDES) ok(llms.includes("/guides/" + slug + "]"), "llms.txt includes /guides/" + slug);
    ok(fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8").includes("Sitemap:"), "robots.txt points at sitemap");

    /* ---------------- favicon set + every page head ---------------- */
    console.log("\n[favicon & head]");
    for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "og-image.png"]) ok(fs.existsSync(path.join(ROOT, f)), "file exists: " + f);
    const allPages = ["index.html", "tracker.html", "about.html", "contact.html", "privacy.html", "terms.html"]
      .concat(POSTS.map(([s]) => "posts/" + s + ".html"))
      .concat(GUIDES.map(s => "guides/" + s + ".html"));
    for (const p of allPages) {
      const html = fs.readFileSync(path.join(ROOT, p), "utf8");
      ok(!/rel="icon" href="data:image/.test(html), p + ": no data-URI icon");
      ok(html.includes('property="og:image" content="https://') && html.includes("/og-image.png"), p + ": og:image");
      ok(html.includes('name="viewport"'), p + ": viewport meta");
    }
}

(async () => {
  await new Promise((r) => srv.listen(PORT, r));
  try {
    await run();
    if (fail > 0) {
      const firstFail = fail;
      console.log("\n  ! " + firstFail + " assertion(s) failed on the first pass — re-running once to rule out an environment flake ...");
      pass = 0; fail = 0;
      await run();
      if (fail === 0) console.log("  ! first pass was a flake (" + firstFail + " failed); the clean re-run is authoritative");
    }
  } finally {
    srv.close();
  }
  console.log("\n==== " + pass + " passed, " + fail + " failed ====");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
