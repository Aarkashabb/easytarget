# EasyTarget Project Setup Guide

## 📍 Project Location
- **Local**: `E:\Claude\EasyTarget`
- **GitHub**: https://github.com/Aarkashabb/easytarget
- **Live Site**: https://easytarget.com.ua

## 🏗️ Technology Stack
- **Static Site Generator**: Hugo
- **Hugo Path**: `E:\Claude\EasyTarget\hugo/`
- **Hosting**: Netlify
- **Build Command**: `hugo --minify` (configured in `netlify.toml`)
- **Published Directory**: `hugo/public/`

## 📂 Key File Locations
- **Main Template Head**: `hugo/layouts/partials/head.html` (where GA4 & SEO tags go)
- **Netlify Config**: `netlify.toml`
- **Hugo Config**: `hugo/hugo.toml`
- **Main Layout**: `hugo/layouts/_default/baseof.html`
- **Content**: `hugo/content/` (Markdown files for pages)

## 📊 Analytics & SEO
- **Google Analytics 4 ID**: `G-KV15BQBKK3`
- **GA4 Location**: Added in `hugo/layouts/partials/head.html`
- **Search Console**: Connected (verify in Google Console)
- **Hreflang Tags**: Configured for multi-language (uk, en, ru, x-default)

## 🚀 Deployment Process
1. Make changes to Hugo files
2. `git add` and `git commit`
3. `git push origin main`
4. Netlify automatically:
   - Detects the push
   - Runs `hugo --minify`
   - Publishes `public/` directory
   - Updates https://easytarget.com.ua
5. Check deployment status: https://app.netlify.com/sites/easytarget/deploys

## 🔧 Common Tasks

### Adding GA4 or other head tags
Edit: `E:\Claude\EasyTarget\hugo\layouts\partials/head.html`

### Adding new pages
1. Create markdown file in `hugo/content/`
2. Use frontmatter with title, description, etc.
3. Hugo will auto-generate the page

### Changing site config
Edit: `hugo/hugo.toml`

### Deployment settings
Edit: `netlify.toml`

## 📝 Recent Updates
- **2026-05-25**: Added Google Analytics 4 tracking (ID: G-KV15BQBKK3)
- Commit: `43f9bdc`

## 🎯 Website Features
- **Multi-language**: Ukrainian (uk), English (en), Russian (ru)
- **Services**: N8N, Make, Zapier automation development
- **Portfolio**: Case studies and project examples
- **Blog**: Articles about automation and business processes

## 💡 Notes for Claude
- Always check this file first when working with the EasyTarget project
- Netlify is auto-connected to GitHub (push = auto-deploy)
- Hugo compiles from `hugo/` directory, publishes to `hugo/public/`
- All meta tags, GA4, and head content goes in `hugo/layouts/partials/head.html`
