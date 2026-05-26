// Generates portfolio listing + 8 case-detail pages × 3 languages.
// Run via run_script. Reads CASES / INDUSTRIES / PORTFOLIO_PAGE from data-portfolio.js.

eval(await readFile('build/data-portfolio.js'));

// ---------- Icons ----------
const ICONS = {
  logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#lg)"/><defs><linearGradient id="lg" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#00D2FF"/><stop offset="1" stop-color="#00B4DB"/></linearGradient></defs></svg>`,
  arrow: `<svg class="icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrowSmall: `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M12 7H3M6 3.5L2.5 7 6 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  calendar: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.5l2.5 2.5 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alert: `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1l8 14H1L9 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 7v3M9 12.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  bolt: `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M10 1L3 10h5l-1 7 7-9H9l1-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>`,
  target: `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="9" r="4" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/></svg>`,

  // Stack icons (generic)
  workflow: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="16" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="9" y="10" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="2" y="17" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="16" y="17" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M5 7v3h7M19 7v3h-7M5 14v3h7M19 14v3h-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  api: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" stroke="currentColor" stroke-width="1.4"/></svg>`,
  table: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16" stroke="currentColor" stroke-width="1.4"/></svg>`,
  ai: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16 10.2 11.3 5.5 9.5 10.2 7.7 12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="18" cy="18" r="1.2" fill="currentColor"/><circle cx="6" cy="18" r="0.8" fill="currentColor"/></svg>`,
  webhook: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="18" r="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="5" r="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5L8 16M12 7.5L16 16M8.5 18h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.4"/></svg>`,
  bug: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="8" width="12" height="11" rx="5" stroke="currentColor" stroke-width="1.6"/><path d="M2 12h4M18 12h4M4 6l3 2M20 6l-3 2M4 18l3-2M20 18l-3-2M12 19v-9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.4A4 4 0 0117 18H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  slides: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 14h18M10 17v3M14 17v3M8 20h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,

  telegram: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 4.5L2.5 11.7c-1 .4-1 1.7 0 2l4.5 1.4 2 6.4c.2.7 1.1.9 1.6.4l2.5-2.5 4.7 3.5c.6.4 1.5.1 1.6-.6L23 6c.2-.9-.7-1.7-1.6-1.5l-.4.1zm-5.2 4.2L9 14.6c-.3.2-.4.6-.4 1l-.2 2.6c0 .1-.2.2-.3 0l-1-3.3 9-6c.3-.2.6.2.7.5l-.5-.7z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11.02 5.001A2.5 2.5 0 014.98 3.5zM3 9.5h4V21H3V9.5zM10 9.5h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.42 9.15 22 11.46 22 14.43V21h-4v-5.83c0-1.39-.02-3.17-1.93-3.17-1.93 0-2.22 1.5-2.22 3.07V21h-4V9.5z"/></svg>`,
};

// Map stack-tag string → an icon key. First match wins.
function stackIconKey(label) {
  const s = label.toLowerCase();
  if (s.includes('sheet') || s.includes('excel') || s.includes('slides')) {
    if (s.includes('slides')) return 'slides';
    return 'table';
  }
  if (s.includes('gemini') || s.includes('openai') || s.includes('ai') || s.includes('agent') || s.includes('llm')) return 'ai';
  if (s.includes('webhook')) return 'webhook';
  if (s.includes('telegram') || s.includes('manychat') || s.includes('chat')) return 'message';
  if (s.includes('cron') || s.includes('scheduled') || s.includes('trigger') || s.includes('rate limit')) return 'clock';
  if (s.includes('javascript') || s.includes('node') || s.includes('logic') || s.includes('transform') || s.includes('pagination')) return 'code';
  if (s.includes('drive') || s.includes('file')) return 'file';
  if (s.includes('error')) return 'bug';
  if (s.includes('crm') || s.includes('integration')) return 'cloud';
  if (s.includes('api') || s.includes('http') || s.includes('rest') || s.includes('graph')) return 'api';
  return 'workflow';
}

// ---------- Path helpers ----------
const LANGS = ['ua', 'en', 'ru'];
const LANG_ATTR = { ua: 'uk', en: 'en', ru: 'ru' };

function basePrefix(lang) {
  // From a portfolio page (depth 2 vs home), file paths back to repo root.
  return lang === 'ua' ? '../' : '../../';
}
function homeUrl(lang) {
  // Path to homepage (for nav anchors, logo, etc.)
  return lang === 'ua' ? '../index.html' : '../../index.html';
}
function listingUrl(lang, fromLang, kind) {
  // URL to listing page of `lang`, from a `fromLang` listing OR detail page.
  const from = kind === 'listing' ? (fromLang === 'ua' ? 'portfolio/' : `${fromLang}/portfolio/`)
                                  : (fromLang === 'ua' ? 'portfolio/' : `${fromLang}/portfolio/`);
  const to = lang === 'ua' ? 'portfolio/index.html' : `${lang}/portfolio/index.html`;
  // From `portfolio/...` we need `../portfolio/...` is wrong because relative is from current file.
  // Both `fromLang` and `lang` portfolio pages are at depth 2 (UA) or 3 (EN/RU).
  // Easiest: build relative URL from current path to target path.
  return relPath(from + 'index.html', to);
}

function relPath(fromPath, toPath) {
  const fromParts = fromPath.split('/').slice(0, -1);
  const toParts = toPath.split('/');
  let i = 0;
  while (i < fromParts.length && i < toParts.length - 1 && fromParts[i] === toParts[i]) i++;
  const up = fromParts.slice(i).map(() => '..');
  const down = toParts.slice(i);
  return [...up, ...down].join('/') || '.';
}

// ---------- Chrome (header/footer) ----------
function buildHeader(lang, pagePath, t) {
  // pagePath: e.g. 'portfolio/index.html' (UA), 'en/portfolio/banking-data-integration.html' (EN)
  // All nav links resolved relative to pagePath.
  const homePath = lang === 'ua' ? 'index.html' : `${lang}/index.html`;
  const logoHref = relPath(pagePath, homePath);

  // Lang switcher: every lang gets a target path that mirrors the current page when possible.
  // For listing → listing in other lang; for detail → same slug in other lang (if available).
  const slugMatch = pagePath.match(/portfolio\/([^/]+)\.html$/);
  const slug = slugMatch && slugMatch[1] !== 'index' ? slugMatch[1] : null;
  const isListing = !slug;

  const langPaths = {};
  for (const L of LANGS) {
    let target;
    if (slug) {
      target = L === 'ua' ? `portfolio/${slug}.html` : `${L}/portfolio/${slug}.html`;
    } else {
      target = L === 'ua' ? 'portfolio/index.html' : `${L}/portfolio/index.html`;
    }
    langPaths[L] = relPath(pagePath, target);
  }

  // Portfolio nav link:
  //  - on the listing page itself: empty href + is-active (current page)
  //  - on a case-detail page: link back to the listing
  const portfolioListingHref = relPath(
    pagePath,
    lang === 'ua' ? 'portfolio/index.html' : `${lang}/portfolio/index.html`
  );
  const portfolioNav = isListing
    ? `<a href="" class="is-active" aria-current="page">${t.navPortfolio}</a>`
    : `<a href="${portfolioListingHref}">${t.navPortfolio}</a>`;

  // Language switcher labels: UA / EN uppercase, ru lowercase (per editorial spec).
  const langLabel = { ua: 'UA', en: 'EN', ru: 'ru' };

  return `<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="${logoHref}" aria-label="EasyTarget — home">
      ${ICONS.logo}
      <span>EasyTarget</span>
    </a>

    <nav class="site-nav" aria-label="${t.a11yMainNav}">
      <a href="${logoHref}#services">${t.navServices}</a>
      ${portfolioNav}
      <a href="${logoHref}#process">${t.navProcess}</a>
      <a href="${logoHref}#faq">${t.navFaq}</a>
    </nav>

    <div class="header-right">
      <div class="lang-switch" role="group" aria-label="${t.a11yLang}">
        <a href="${langPaths.ua}" class="${lang==='ua'?'is-active':''}">${langLabel.ua}</a>
        <a href="${langPaths.en}" class="${lang==='en'?'is-active':''}">${langLabel.en}</a>
        <a href="${langPaths.ru}" class="${lang==='ru'?'is-active':''}">${langLabel.ru}</a>
      </div>
      <a class="btn btn--primary" href="${logoHref}#contact">${t.bookCall}</a>
      <button class="nav-toggle" aria-label="${t.a11yMenu}" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function buildFooter(t) {
  return `<footer class="site-footer">
  <div class="container site-footer__inner">
    <span>© 2026 EasyTarget · ${t.footerTagline}</span>
    <div class="site-footer__social">
      <a href="https://t.me/Aarkashabb" target="_blank" rel="noopener" aria-label="Telegram">${ICONS.telegram}</a>
      <a href="https://www.linkedin.com/in/aarkashabb" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
    </div>
  </div>
</footer>`;
}

// ---------- Per-lang chrome translations ----------
const CHROME = {
  ua: {
    a11yMainNav: 'Головна навігація', a11yLang: 'Перемикач мови', a11yMenu: 'Меню',
    bookCall: 'Записатися на дзвінок',
    navServices: 'Послуги', navPortfolio: 'Портфоліо', navProcess: 'Процес', navFaq: 'FAQ',
    footerTagline: 'Інженерія автоматизації для бізнесу, що росте.',
  },
  en: {
    a11yMainNav: 'Main navigation', a11yLang: 'Language switcher', a11yMenu: 'Menu',
    bookCall: 'Book a Call',
    navServices: 'Services', navPortfolio: 'Portfolio', navProcess: 'Process', navFaq: 'FAQ',
    footerTagline: 'Automation engineering for growing businesses.',
  },
  ru: {
    a11yMainNav: 'Главная навигация', a11yLang: 'Переключатель языка', a11yMenu: 'Меню',
    bookCall: 'Записаться на звонок',
    navServices: 'Услуги', navPortfolio: 'Портфолио', navProcess: 'Процесс', navFaq: 'FAQ',
    footerTagline: 'Инженерия автоматизации для растущего бизнеса.',
  },
};

// ---------- Listing page ----------
function listingPage(lang) {
  const t = PORTFOLIO_PAGE[lang];
  const chrome = CHROME[lang];
  const pagePath = lang === 'ua' ? 'portfolio/index.html' : `${lang}/portfolio/index.html`;
  const cssPath = relPath(pagePath, 'assets/css/styles.css');
  const jsPath = relPath(pagePath, 'assets/js/site.js');
  const portfolioJs = relPath(pagePath, 'assets/js/portfolio.js');
  const docLang = LANG_ATTR[lang];

  const pills = INDUSTRIES[lang].map((p, i) =>
    `<button class="filter-pill${i === 0 ? ' is-active' : ''}" data-industry="${p.id}" type="button">${p.label}</button>`
  ).join('\n      ');

  const cards = CASES.map((c, i) => {
    const tt = c[lang];
    const detailHref = `${c.slug}.html`;
    const stack = c.stack.slice(0, 3).map(s => `<span class="tag">${s}</span>`).join('');
    return `<article class="pcard" data-industry="${c.industry}">
        <a class="pcard__thumb" href="${detailHref}" aria-hidden="true" tabindex="-1">
          <span class="pcard__thumb-id">CASE.${String(i + 1).padStart(2, '0')}</span>
          <span class="pcard__thumb-art">${ICONS.workflow}</span>
          <span class="pcard__thumb-nodes">${c.complexity.nodes} nodes</span>
        </a>
        <div class="pcard__body">
          <div class="pcard__industry">${tt.industryLabel}</div>
          <h3 class="pcard__title">${tt.title}</h3>
          <p>${tt.shortBody}</p>
          <div class="pcard__stack">${stack}</div>
          <a class="pcard__link" href="${detailHref}">${t.viewCase} ${ICONS.arrowSmall}</a>
        </div>
      </article>`;
  }).join('\n      ');

  return `<!DOCTYPE html>
<html lang="${docLang}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.pageTitle}</title>
<meta name="description" content="${t.metaDesc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap&subset=cyrillic,cyrillic-ext,latin,latin-ext" rel="stylesheet">
<link rel="stylesheet" href="${cssPath}">
</head>
<body>

${buildHeader(lang, pagePath, chrome)}

<main>

<section class="portfolio-hero">
  <div class="container">
    <span class="portfolio-hero__eyebrow">${t.eyebrow}</span>
    <h1>${t.h1}</h1>
    <p class="portfolio-hero__sub">${t.subhead}</p>
  </div>
</section>

<section class="portfolio-section">
  <div class="container">
    <div class="filter-bar" role="tablist" aria-label="${t.eyebrow}">
      ${pills}
    </div>

    <div class="portfolio-grid" id="portfolio-grid">
      ${cards}
    </div>
    <div class="portfolio-empty" id="portfolio-empty">—</div>
  </div>
</section>

</main>

${buildFooter(chrome)}

<script src="${jsPath}"></script>
<script src="${portfolioJs}"></script>
</body>
</html>
`;
}

// ---------- Detail page ----------
function detailPage(lang, c, idx) {
  const t = PORTFOLIO_PAGE[lang];
  const chrome = CHROME[lang];
  const tt = c[lang];
  const pagePath = lang === 'ua' ? `portfolio/${c.slug}.html` : `${lang}/portfolio/${c.slug}.html`;
  const cssPath = relPath(pagePath, 'assets/css/styles.css');
  const jsPath = relPath(pagePath, 'assets/js/site.js');
  const listingHref = 'index.html';
  const docLang = LANG_ATTR[lang];

  const solutionList = tt.solution.map(s => `<li>${s}</li>`).join('');
  const impactList = tt.impact.map(s => `<div class="case-impact__item"><div class="case-impact__check">${ICONS.check}</div><p>${s}</p></div>`).join('');
  const stackItems = c.stack.map(s => `<div class="case-stack__item"><div class="case-stack__icon">${ICONS[stackIconKey(s)] || ICONS.workflow}</div><span class="case-stack__label">${s}</span></div>`).join('');

  const eyebrow = `${t.eyebrowDetail} · ${tt.industryLabel}`;

  return `<!DOCTYPE html>
<html lang="${docLang}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${tt.title} — EasyTarget</title>
<meta name="description" content="${tt.subtitle}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap&subset=cyrillic,cyrillic-ext,latin,latin-ext" rel="stylesheet">
<link rel="stylesheet" href="${cssPath}">
</head>
<body>

${buildHeader(lang, pagePath, chrome)}

<main>

<section class="case-hero">
  <div class="container">
    <span class="case-eyebrow">${eyebrow}</span>
    <h1>${tt.title}</h1>
    <p class="case-hero__sub">${tt.subtitle}</p>
  </div>
</section>

<section class="case-summary">
  <div class="container">
    <div class="case-summary__grid">
      <div class="case-cell">
        <h3>${ICONS.alert}${t.challengeTitle}</h3>
        <p>${tt.challenge}</p>
      </div>
      <div class="case-cell">
        <h3>${ICONS.bolt}${t.solutionTitle}</h3>
        <ol>${solutionList}</ol>
      </div>
      <div class="case-cell case-cell--result">
        <h3>${ICONS.target}${t.resultTitle}</h3>
        <p>${tt.shortBody}</p>
        <div class="case-cell__metric-wrap">
          <div class="case-cell__metric">${c.result.value}<span class="case-cell__metric-unit">${c.result.unit}</span></div>
          <div class="case-cell__metric-label">${c.result.label}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="case-arch">
  <div class="container">
    <div class="case-arch__box case-arch__box--workflow">
      <img class="case-arch__diagram" src="${relPath(pagePath, `assets/img/workflows/${c.slug}.png`)}" alt="${tt.title} — ${t.archAlt || 'workflow diagram'}" loading="lazy">
      <div class="case-arch__status">
        <div class="case-arch__status-title">${t.systemStatus}</div>
        <div class="case-arch__status-row">${t.systemStatusLabel}</div>
      </div>
    </div>
  </div>
</section>

<section class="case-stack-section">
  <div class="container">
    <h2>${t.stackTitle}</h2>
    <div class="case-stack__list">
      ${stackItems}
    </div>
  </div>
</section>

<section class="case-impact">
  <div class="container">
    <div class="case-impact__grid">
      <div class="case-impact__head">
        <h2>${t.impactTitle}</h2>
        <p>${tt.subtitle}</p>
      </div>
      <div class="case-impact__list">
        ${impactList}
      </div>
    </div>
  </div>
</section>

<section class="case-complexity">
  <div class="container">
    <div class="case-complexity__inner">
      <div class="case-complexity__num-wrap">
        <div class="case-complexity__num">${c.complexity.nodes}</div>
        <div class="case-complexity__num-label">${t.nodesLabel}</div>
      </div>
      <div>
        <div class="case-complexity__title">${t.complexityTitle}</div>
        <div class="case-complexity__summary">${tt.complexitySummary}</div>
      </div>
    </div>
  </div>
</section>

<section class="final-cta">
  <div class="container">
    <h2>${t.ctaTitle}</h2>
    <p>${t.ctaLede}</p>
    <a class="btn btn--primary btn--lg" href="${homeUrl(lang)}#contact">${t.ctaButton} ${ICONS.calendar}</a>
  </div>
</section>

<section class="case-back">
  <div class="container">
    <a class="case-back__link" href="${listingHref}">${ICONS.arrowLeft} ${t.backToList}</a>
  </div>
</section>

</main>

${buildFooter(chrome)}

<script src="${jsPath}"></script>
</body>
</html>
`;
}

// ---------- Portfolio filter script (shared) ----------
const PORTFOLIO_JS = `(function () {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.pcard');
  const empty = document.getElementById('portfolio-empty');
  if (!pills.length || !cards.length) return;

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
      const id = pill.dataset.industry;
      let visible = 0;
      cards.forEach(function (c) {
        const show = id === 'all' || c.dataset.industry === id;
        c.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    });
  });
})();
`;

// ---------- Write everything ----------
await saveFile('assets/js/portfolio.js', PORTFOLIO_JS);

let written = 0;
for (const lang of LANGS) {
  const prefix = lang === 'ua' ? 'portfolio/' : `${lang}/portfolio/`;
  await saveFile(prefix + 'index.html', listingPage(lang));
  written++;
  for (let i = 0; i < CASES.length; i++) {
    const c = CASES[i];
    await saveFile(prefix + c.slug + '.html', detailPage(lang, c, i));
    written++;
  }
}

log(`Wrote ${written} portfolio pages + 1 JS file.`);
