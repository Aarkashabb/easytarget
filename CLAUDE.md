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
- **Main Template Head**: `hugo/layouts/partials/head.html` (where GA4 & SEO tags go)
- **JSON-LD Schema**: `hugo/layouts/partials/schema.html` (Organization, Person, BlogPosting, WebPage, BreadcrumbList, Service)
- **Blog single layout**: `hugo/layouts/blog/single.html` (hero image render lives here)
- **Blog list layout**: `hugo/layouts/blog/list.html`
- **Hugo Config**: `hugo/hugo.toml`
- **Site CSS**: `hugo/assets/css/styles.css`
- **Main Layout**: `hugo/layouts/_default/baseof.html`
- **Content**: `hugo/content/{uk,en,ru}/{blog,portfolio}/`
- **Static assets**: `hugo/static/` (favicon.svg, images/, images/blog/)
- **CI workflow**: `.github/workflows/deploy.yml`
- **SEO briefs**: `docs/briefs/`
- **Article source drafts (gitignored)**: `Blog/` (.docx + hi-res PNGs from Gemini/ChatGPT)
- **Legacy `netlify.toml`**: still in repo but **NOT USED** by Cloudflare Pages — headers/redirects must move to `_headers` and `_redirects` files in `hugo/static/` if needed

## 📊 Analytics & SEO
- **Google Analytics 4 ID**: `G-KV15BQBKK3` (in `head.html`)
- **Search Console**: Connected via TXT record (verify in Google Console)
- **Hreflang Tags**: uk (default, no prefix), en (/en/), ru (/ru/), x-default
- **Canonical**: self-referencing via `head.html` (override per-page with `canonical:` frontmatter)
- **Schema implemented**: Organization, Person, WebPage, BlogPosting (+ `datePublished` / `dateModified`), BreadcrumbList, Service (portfolio)
- **robots.txt**: at `hugo/layouts/robots.txt` — AI crawlers (GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, CCBot, Google-Extended) explicitly **Allow /**
- **Cloudflare "Manage your robots.txt"**: **Disabled** in Cloudflare dashboard (otherwise CF injects its own AI bot rules and overrides ours)

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
2. Frontmatter must include: `title`, `date`, `description`, `image` (absolute `/images/blog/...`), `tags`, `author`, `draft: false`
3. Use absolute internal links: `/blog/...`, `/portfolio/...` for UK (default, no `/uk/` prefix), `/en/blog/...` for English, `/ru/blog/...` for Russian
4. Resize hero images to 1200×655 JPEG (~150 KB) before adding — see PowerShell `System.Drawing` snippet in commit history
5. `git push` → auto-deploys

### Adding new pages
1. Create markdown file in `hugo/content/<lang>/`
2. Use frontmatter with title, description, image
3. Hugo will auto-generate the page

### Changing site config
Edit: `hugo/hugo.toml`

### Cache invalidation
Cloudflare Pages purges its CDN on every deploy automatically. For manual purge use dashboard → Caching → Purge Everything.

## 📝 Recent Updates
- **2026-06-05**: Migrated from Netlify (credit limit) to Cloudflare Pages. GitHub Actions workflow added for auto-deploy.
- **2026-05-28**: Self-referencing canonical added on every page. BreadcrumbList JSON-LD added. `dateModified` restored in BlogPosting schema.
- **2026-05-27**: Published 3 blog articles in 3 languages (automation-guide-2026, make-vs-zapier-vs-n8n-2026, start-with-self-hosted-n8n). Inline links styled (blue + underlined). Blog list page redesigned with thumb images. Fixed 33 broken `/uk/...` internal links across 13 files.
- **2026-05-26**: Cloudflare "Manage robots.txt" disabled — AI bots no longer blocked at edge. Favicon SVG added.
- **2026-05-25**: Added Google Analytics 4 tracking (ID: G-KV15BQBKK3). Phase 1 SEO complete (schema, sitemap, security headers).

## 🎯 Website Features
- **Multi-language**: Ukrainian (uk, default — no URL prefix), English (en), Russian (ru)
- **Services**: N8N, Make, Zapier automation development
- **Portfolio**: 8 case studies (banking, e-commerce, marketing, HR, etc.)
- **Blog**: 5 articles on automation, ROI, security, platform comparisons, self-hosted N8N

## 💡 Notes for Claude
- Always check this file first when working with the EasyTarget project
- **GitHub Actions deploys on every push to `main`** — don't push WIP
- Hugo compiles from `hugo/` directory, publishes to `hugo/public/`
- All meta tags, GA4, and head content goes in `hugo/layouts/partials/head.html`
- All structured data (JSON-LD) lives in `hugo/layouts/partials/schema.html`
- **UK is default language** — URL is `/blog/...`, NOT `/uk/blog/...`. Don't write `/uk/` in internal links inside UK content.
- Image paths in frontmatter must be **absolute** (`/images/blog/...`) for multilingual compatibility
- Hugo's `jsonify` template function has a bug with strings inside `dict` — use manual escape `replaceRE` if generating JSON-LD with dynamic strings
- Cloudflare Pages does NOT read `netlify.toml`. Headers/redirects must be in `hugo/static/_headers` and `hugo/static/_redirects` (or `wrangler.toml`) if needed
- `Blog/` folder (article source .docx + Gemini PNG) is gitignored — DO NOT commit
