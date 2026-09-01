# EasyTarget Project Setup Guide

## 📍 Project Location
- **Local**: `E:\Claude\EasyTarget`
- **GitHub**: https://github.com/Aarkashabb/easytarget
- **Live Site**: https://easytarget.com.ua
- **Fallback URL**: https://easytarget.pages.dev

## 🏗️ Technology Stack
- **Static Site Generator**: Hugo (extended) 0.132.0 — version pinned in workflow
- **Hugo Path**: `E:\Claude\EasyTarget\hugo/`
- **Hosting**: **Cloudflare Pages** (migrated from Netlify on 2026-06-05)
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **DNS / CDN**: Cloudflare (zone `easytarget.com.ua`)
- **Build Command**: `hugo --minify --gc`
- **Published Directory**: `hugo/public/`

## ☁️ Cloudflare IDs
- **Account ID**: `0a211233b9add5f18fefc9637c2916c6`
- **Zone ID (easytarget.com.ua)**: `318c30f9c418f70e8893e895fe4ced25`
- **Pages project name**: `easytarget`
- **Pages dashboard**: https://dash.cloudflare.com/0a211233b9add5f18fefc9637c2916c6/pages/view/easytarget
- **DNS**: root + `www` are `CNAME → easytarget.pages.dev`, proxied. MX (ukraine.com.ua) and TXT (Google/Facebook verification, SPF) preserved.

## 📂 Key File Locations
- **Main Template Head**: `hugo/layouts/partials/head.html` (GA4, OG, Twitter Cards, canonical, hero preload)
- **JSON-LD Schema**: `hugo/layouts/partials/schema.html` (Organization, Person, BlogPosting w/ datePublished+dateModified, WebPage, BreadcrumbList auto from .Ancestors, Service for portfolio)
- **Cluster nav partial**: `hugo/layouts/partials/cluster-nav.html` (pillar hub + spoke callouts, auto from frontmatter)
- **Blog single layout**: `hugo/layouts/blog/single.html` (hero image, cluster nav, content)
- **Blog list layout**: `hugo/layouts/blog/list.html` (thumb cards with hero image previews)
- **llms.txt templates**: `hugo/layouts/index.llms.txt` (lightweight index) and `hugo/layouts/index.llmsfull.txt` (full content dump)
- **Hugo Config**: `hugo/hugo.toml` (custom output formats LLMS + LLMSFULL defined here)
- **Site CSS**: `hugo/assets/css/styles.css` (cluster nav styles, post-content links)
- **i18n strings**: `hugo/i18n/{uk,ru,en}.yaml` (UI labels per language, including cluster_* keys)
- **Main Layout**: `hugo/layouts/_default/baseof.html`
- **Content**: `hugo/content/{uk,en,ru}/{blog,portfolio}/`
- **Static assets**: `hugo/static/` (favicon.svg, images/, images/blog/, _redirects, _headers)
- **CI workflow**: `.github/workflows/deploy.yml`
- **SEO briefs**: `docs/briefs/`
- **Article source drafts (gitignored)**: `Blog/` (.docx + hi-res PNGs from Gemini/ChatGPT)
- **Legacy `netlify.toml`**: still in repo for reference but **NOT USED** by Cloudflare Pages — headers live in `hugo/static/_headers`, path-only redirects live in `hugo/static/_redirects`, and host-level redirects (like www -> apex) live in `functions/_middleware.js`

## 📊 Analytics & SEO
- **Google Analytics 4 ID**: `G-KV15BQBKK3` (loaded lazily in `head.html` on first interaction or 3s idle)
- **Search Console**: Connected via TXT record. 4 sitemaps submitted (root index + uk/en/ru). 13 legacy Tilda URLs handled via 301 redirects.
- **Hreflang Tags**: uk (default, no prefix), en (/en/), ru (/ru/), x-default
- **Canonical**: self-referencing via `head.html` (override per-page with `canonical:` frontmatter)
- **Schema implemented**: Organization, Person, WebPage, BlogPosting (with `datePublished` + `dateModified`), BreadcrumbList (auto-built from .Ancestors), Service (portfolio)
- **OG image + Twitter Cards**: default `/images/og-default.jpg` (1200×630 branded), per-page hero override via `image:` frontmatter, custom `imageAlt:` for alt text. og:type = article/website per page type. og:locale + alternate per language.
- **robots.txt**: at `hugo/layouts/robots.txt` — AI crawlers (GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, CCBot, Google-Extended) explicitly **Allow /**
- **Cloudflare "Manage your robots.txt"**: **Disabled** in Cloudflare dashboard (otherwise CF injects its own AI bot rules and overrides ours)
- **AI assistants**: `/llms.txt` (lightweight) and `/llms-full.txt` (full site dump) auto-generated per language. Standard: https://llmstxt.org

## 🧱 Topic Cluster Architecture

Posts are grouped into **clusters** for topical SEO authority. Each cluster has:
- **1 pillar** post (comprehensive guide on the topic)
- **N spoke** posts (deep-dives on sub-topics)

### Frontmatter convention
```yaml
cluster: "business-automation"   # cluster slug (kebab-case)
clusterRole: "pillar"            # or "spoke"
```

### Auto-rendered UI (via `cluster-nav.html` partial)
- **On pillar pages**: hub block at end of post lists all spokes with title + description
- **On spoke pages**: callout at top "Part of: {topic}" with link back to pillar

### Adding a new cluster
1. Pick cluster slug (e.g. `ai-integration`)
2. Add posts with `cluster: "ai-integration"` + `clusterRole: "pillar"` or `"spoke"` in frontmatter
3. Add i18n key `cluster_topic_ai_integration: "AI Integration"` to all 3 lang files (`hugo/i18n/{uk,ru,en}.yaml`)
4. Partial auto-discovers cluster members — no template changes needed

### Current clusters
- **business-automation**: `automation-guide-2026` (pillar) + 4 spokes (make-vs-zapier, self-hosted-n8n, calculating-roi, security-best-practices)

## 🖼️ Image Alt Text Convention

- **Hero images (`image:` frontmatter)**: optional `imageAlt:` field with descriptive text. If absent, falls back to article title.
  - Used by: blog single hero `<img>`, OG image, Twitter Card image
  - Best practice: describe what the IMAGE shows, not the article topic (avoid duplicating H1)
- **Blog list thumbnails**: `alt=""` (decorative) — title is already in `<h3>` next to it, screen reader doesn't duplicate
- **Inline markdown images** in content: always include descriptive alt in native language
- **Decorative SVG icons** in templates: `aria-hidden="true"`
- **Social link icons** (Telegram, LinkedIn in footer): `aria-label="<name>"` on the `<a>` wrapper, `aria-hidden="true"` on `<svg>`

## ⚡ Performance Optimizations (Core Web Vitals)

Implemented in `head.html`:
- **LCP hero preload**: any page with `image:` frontmatter gets `<link rel="preload" as="image" fetchpriority="high">` in head — browser starts hero download immediately during HTML parse
- **GA4 lazy-loaded**: gtag.js NOT loaded on page load. Loads on first user interaction (scroll/click/keydown/touchstart/mousemove) OR `requestIdleCallback` (3s timeout fallback). Saves ~200 KB unused JS from initial bundle.
- **Hero `<img>` has `fetchpriority="high"`** for older browsers that don't support preload hint
- **Font preconnect** to fonts.googleapis.com and fonts.gstatic.com
- **Single font preload** for Inter regular weight (used above-the-fold)

### Baseline measurements (mobile, after optimization)
- LCP: 3.7-4.1s (target <2.5s, still yellow — needs WebP + self-host fonts)
- CLS: 0-0.002 (target <0.1, green)
- TBT: 200-280ms (target <200ms, close)
- Performance score: 74-76 mobile, 89-94 desktop
- SEO: 100/100, A11y: 95-100, Best Practices: 96

## 🚀 Deployment Process

### Auto-deploy (preferred)
1. Make changes to Hugo files
2. `git add` and `git commit`
3. `git push origin main`
4. GitHub Actions automatically:
   - Checks out repo (Hugo 0.132.0 extended)
   - Runs `hugo --minify --gc` in `./hugo`
   - Deploys `hugo/public` to Cloudflare Pages via Wrangler
5. Watch run: https://github.com/Aarkashabb/easytarget/actions

### Manual deploy (fallback)
If GitHub Actions is disabled or you need to deploy from local without commit:
```bash
cd hugo && hugo --minify --gc
cd ..
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=0a211233b9add5f18fefc9637c2916c6 \
  npx wrangler pages deploy hugo/public --project-name=easytarget --branch=main
```
Wrangler is already installed globally (`wrangler --version` → 4.98.0).

### Required GitHub Secrets (Settings → Secrets and variables → Actions)
- `CLOUDFLARE_API_TOKEN` — token with `Account → Cloudflare Pages: Edit`, `Zone → DNS: Edit`, `Account → Account Settings: Read`, scoped to easytarget.com.ua
- `CLOUDFLARE_ACCOUNT_ID` = `0a211233b9add5f18fefc9637c2916c6`

## 🔧 Common Tasks

### Adding GA4 or other head tags
Edit: `hugo/layouts/partials/head.html`

### Adding a new blog post
1. Create `hugo/content/{lang}/blog/<slug>.md` in **uk, en, ru** (all 3)
2. Required frontmatter:
   ```yaml
   title: "..."
   date: 2026-XX-XX
   description: "..."         # used in meta description, OG, og:image:alt fallback
   image: "/images/blog/<slug>-hero.jpg"   # absolute path, used as OG image too
   imageAlt: "..."            # describes the IMAGE, not the article (best practice)
   tags: ["...", "..."]
   keywords: ["..."]
   author: "Ivan Blagoveshchenskyi"
   cluster: "business-automation"   # if part of topic cluster
   clusterRole: "spoke"             # or "pillar"
   draft: false
   ```
3. Use absolute internal links: `/blog/...`, `/portfolio/...` for **UK (default, no `/uk/` prefix)**, `/en/blog/...` for English, `/ru/blog/...` for Russian
4. Resize hero images to **1200×655 JPEG (~150 KB)** before adding — see PowerShell `System.Drawing` snippet in commit history (or `Article 1 commit` for reference)
5. `git push` → GitHub Actions auto-deploys

### Adding a new portfolio case
1. Create `hugo/content/{lang}/portfolio/<slug>.md` in all 3 languages
2. Frontmatter: `title`, `description`, `subtitle`, `industry_label`, `platform`, `challenge`, `solution[]`, `results[]`, `image`
3. Architecture diagram (optional): put PNG at `hugo/static/img/workflows/<slug>.png` — auto-rendered by portfolio/single.html

### Changing site config
Edit: `hugo/hugo.toml`

### Adding redirects
Edit: `hugo/static/_redirects` for path-only Cloudflare Pages redirects (`/old-path /new-path 301`). One per line. Splats (`*`) supported. Host-level redirects such as `www.easytarget.com.ua` -> `easytarget.com.ua` live in `functions/_middleware.js`.

### Cache invalidation
Cloudflare Pages purges its CDN on every deploy automatically. For manual purge use dashboard → Caching → Purge Everything.

### Generating images via PowerShell
For brand-consistent images use `System.Drawing` with the blue→purple gradient (matches favicon):
- Start: `#1e3a8a`
- End: `#7c3aed`
See `og-default.jpg` generation in commit `8562cb1` for reference.

## 📝 Recent Updates
- **2026-06-05**: Major SEO push. Migrated Netlify → Cloudflare Pages (Netlify credit limit). Added GitHub Actions auto-deploy. BreadcrumbList JSON-LD (auto from .Ancestors). dateModified restored in BlogPosting. OG image + Twitter Cards on all pages (default 1200×630 brand image + per-page hero override + per-lang locale). llms.txt + llms-full.txt auto-generated (llmstxt.org standard). Topic cluster architecture (pillar + spokes). Alt text audit + descriptive imageAlt frontmatter. CWV optimizations: preload hero LCP (-47% mobile LCP) + defer GA4. GSC: 4 sitemaps submitted, 13 legacy Tilda 404s fixed via 301 redirects.
- **2026-05-28**: Self-referencing canonical added on every page.
- **2026-05-27**: Published 3 blog articles in 3 languages (automation-guide-2026, make-vs-zapier-vs-n8n-2026, start-with-self-hosted-n8n). Inline links styled (blue + underlined). Blog list page redesigned with thumb images. Fixed 33 broken `/uk/...` internal links across 13 files.
- **2026-05-26**: Cloudflare "Manage robots.txt" disabled — AI bots no longer blocked at edge. Favicon SVG added.
- **2026-05-25**: Added Google Analytics 4 tracking (ID: G-KV15BQBKK3). Phase 1 SEO complete (schema, sitemap, security headers).

## 🎯 Website Features
- **Multi-language**: Ukrainian (uk, default — no URL prefix), English (en), Russian (ru)
- **Services**: N8N, Make, Zapier automation development
- **Portfolio**: 8 case studies (banking, e-commerce, marketing, HR, etc.)
- **Blog**: 5 articles on automation, ROI, security, platform comparisons, self-hosted N8N
- **AI-ready**: `/llms.txt` + `/llms-full.txt` for AI assistants per llmstxt.org standard

## 💡 Notes for Claude

### Параллельные агенты
Если задача состоит из **3+ независимых подзадач** — запускай параллельных агентов автоматически, без запроса разрешения. Используй `isolation: "worktree"` и `run_in_background: true` для каждого. После завершения — мерджи ветки в main и пушь одним коммитом.

**Когда подзадачи независимы:** трогают разные файлы и не читают результаты друг друга.

**Как делить задачи по контенту:**
- Несколько статей блога (каждая на 3 языках) → **1 агент на статью** (uk+en+ru вместе), НЕ 1 агент на язык. Агент должен понимать тему целиком — так терминология остаётся консистентной между переводами.
- Несколько независимых SEO-правок → 1 агент на правку.
- Несколько независимых шаблонов → 1 агент на шаблон.

**Когда НЕ использовать агентов:** задачи зависят друг от друга (агент 2 читает результат агента 1) — тогда последовательно в одном чате.

### General
- Always check this file first when working with the EasyTarget project
- **GitHub Actions deploys on every push to `main`** — don't push WIP
- Hugo compiles from `hugo/` directory, publishes to `hugo/public/`
- `Blog/` folder (article source .docx + Gemini PNG) is gitignored — DO NOT commit

### Template & content
- All meta tags, GA4, and head content goes in `hugo/layouts/partials/head.html`
- All structured data (JSON-LD) lives in `hugo/layouts/partials/schema.html`
- Topic cluster UI is in `hugo/layouts/partials/cluster-nav.html` — driven by `cluster:` and `clusterRole:` frontmatter
- llms.txt and llms-full.txt are auto-generated from content via Hugo output formats — no manual updates needed when adding posts

### Multilingual gotchas
- **UK is default language** — URL is `/blog/...`, NOT `/uk/blog/...`. Don't write `/uk/` in internal links inside UK content.
- EN/RU use `/en/` and `/ru/` prefixes — DO use them in EN/RU content
- Image paths in frontmatter must be **absolute** (`/images/blog/...`) for multilingual compatibility
- og:locale mapping: uk→uk_UA, ru→ru_RU, en→en_US (explicit conditional in head.html — chained `replace` had a bug)

### Hosting & build
- Cloudflare Pages does NOT read `netlify.toml`. Headers/redirects must be in `hugo/static/_headers` and `hugo/static/_redirects` (Cloudflare Pages format)
- `_redirects` syntax: `/old-path /new-path 301` (one per line, splats `*` supported)

### Hugo template quirks
- Hugo's `jsonify` template function has a bug with strings inside `dict` — wraps strings in extra quotes. Workaround: use manual escape `replaceRE` for `\` and `"` (see BreadcrumbList in schema.html)
- For absolute URLs in templates use `{{ . | absURL }}` not `{{ .Site.BaseURL }}{{ . }}` (avoids double-slash when path starts with `/`)
- `text/markdown` mediaType output gets `.md` extension by default — for `.txt` use `text/plain` mediaType with `isPlainText: true`

### Performance
- New blog posts automatically get hero LCP preload (via `image:` frontmatter check in head.html)
- GA4 is intentionally NOT eagerly loaded — don't change `<script async src="googletagmanager...">` pattern back, it kills mobile CWV
- If adding large above-the-fold images outside `image:` frontmatter, add `<link rel="preload" as="image">` manually in a partial
