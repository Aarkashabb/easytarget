// Generates index.html (UA), en/index.html, ru/index.html
// from a single template + 3 translation dictionaries.
// Run via run_script; output is committed atomically.
// Pulls real case studies from data-portfolio.js for the Recent Projects section.

eval(await readFile('build/data-portfolio.js'));

const ICONS = {
  logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#lg)"/><defs><linearGradient id="lg" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#00D2FF"/><stop offset="1" stop-color="#00B4DB"/></linearGradient></defs></svg>`,
  arrow: `<svg class="icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrowSmall: `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  calendar: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  mail: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 4.5l5.5 4 5.5-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trigger: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5L9.2 6h4.3l-3.5 2.6 1.4 4.2L8 10.5l-3.4 2.3 1.4-4.2L2.5 6h4.3L8 1.5z" fill="#00D2FF"/></svg>`,

  // service icons
  svcWorkflow: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="16" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="9" y="10" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="2" y="17" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="16" y="17" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M5 7v3h7M19 7v3h-7M5 14v3h7M19 14v3h-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  svcAI: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.5h2v3H8zM14 10.5h2v3h-2z" fill="currentColor"/><path d="M9 14.5c.8.8 2 1.5 3 1.5s2.2-.7 3-1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M12 3v-1M12 22v-1M3 12h-1M22 12h-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  svcArch: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="9.5" width="18" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="16" width="18" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="5.5" r="0.9" fill="currentColor"/><circle cx="6.5" cy="12" r="0.9" fill="currentColor"/><circle cx="6.5" cy="18.5" r="0.9" fill="currentColor"/></svg>`,
  svcReport: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 20V8M8 20v-7M13 20V4M18 20v-10M22 20H2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,

  // partner icons
  ads: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 7h10l4-3v12l-4-3H3a2 2 0 01-2-2v-2a2 2 0 012-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  seo: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  ppc: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 17L9 11l3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 7h4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // blog thumbs
  thumbGuide: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h13a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" stroke="currentColor" stroke-width="1.6"/><path d="M7 8h9M7 12h9M7 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  thumbAI: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M12 18v3M9 21h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  thumbWarn: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l10 17H2L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v5M12 17.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,

  // social
  telegram: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 4.5L2.5 11.7c-1 .4-1 1.7 0 2l4.5 1.4 2 6.4c.2.7 1.1.9 1.6.4l2.5-2.5 4.7 3.5c.6.4 1.5.1 1.6-.6L23 6c.2-.9-.7-1.7-1.6-1.5l-.4.1zm-5.2 4.2L9 14.6c-.3.2-.4.6-.4 1l-.2 2.6c0 .1-.2.2-.3 0l-1-3.3 9-6c.3-.2.6.2.7.5l-.5-.7z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11.02 5.001A2.5 2.5 0 014.98 3.5zM3 9.5h4V21H3V9.5zM10 9.5h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.42 9.15 22 11.46 22 14.43V21h-4v-5.83c0-1.39-.02-3.17-1.93-3.17-1.93 0-2.22 1.5-2.22 3.07V21h-4V9.5z"/></svg>`,
};

function star() { return '★'; }

function pageHTML(t, langCode) {
  const dir = 'ltr';
  const langAttrs = { ua: 'uk', en: 'en', ru: 'ru' };
  const docLang = langAttrs[langCode];

  // Relative paths. We use explicit index.html in the hrefs so the page works
  // when previewed as static files (no server-side directory-index lookup).
  // In Hugo / production this can be swapped for `/` and `/en/`.
  const isRoot = langCode === 'ua';
  const cssPath = isRoot ? 'assets/css/styles.css' : '../assets/css/styles.css';
  const jsPath = isRoot ? 'assets/js/site.js' : '../assets/js/site.js';
  const link = {};
  if (langCode === 'ua') {
    link.ua = 'index.html';
    link.en = 'en/index.html';
    link.ru = 'ru/index.html';
  } else if (langCode === 'en') {
    link.ua = '../index.html';
    link.en = 'index.html';
    link.ru = '../ru/index.html';
  } else {
    link.ua = '../index.html';
    link.en = '../en/index.html';
    link.ru = 'index.html';
  }

  return `<!DOCTYPE html>
<html lang="${docLang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.metaTitle}</title>
<meta name="description" content="${t.metaDesc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap&subset=cyrillic,cyrillic-ext,latin,latin-ext" rel="stylesheet">
<link rel="stylesheet" href="${cssPath}">
</head>
<body>

<!-- ============ Header ============ -->
<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="${link[langCode]}" aria-label="EasyTarget — home">
      ${ICONS.logo}
      <span>EasyTarget</span>
    </a>

    <nav class="site-nav" aria-label="${t.a11yMainNav}">
      <a href="#services">${t.nav.services}</a>
      <a href="portfolio/index.html">${t.nav.portfolio}</a>
      <a href="#process">${t.nav.process}</a>
      <a href="#faq">${t.nav.faq}</a>
    </nav>

    <div class="header-right">
      <div class="lang-switch" role="group" aria-label="${t.a11yLang}">
        <a href="${link.ua}" class="${langCode==='ua'?'is-active':''}">UA</a>
        <a href="${link.en}" class="${langCode==='en'?'is-active':''}">EN</a>
        <a href="${link.ru}" class="${langCode==='ru'?'is-active':''}">ru</a>
      </div>
      <a class="btn btn--primary" href="#contact">${t.bookCall}</a>
      <button class="nav-toggle" aria-label="${t.a11yMenu}" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

<main>

<!-- ============ Hero ============ -->
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy reveal">
      <span class="hero__badge"><span class="dot"></span>${t.hero.badge}</span>
      <h1 class="hero__title">${t.hero.titleA} <span class="accent">${t.hero.titleB}</span></h1>
      <p class="hero__lede">${t.hero.lede}</p>
      <div class="hero__ctas">
        <a class="btn btn--primary btn--lg" href="#contact">${t.hero.cta1} ${ICONS.arrow}</a>
        <a class="btn btn--ghost btn--lg" href="portfolio/index.html">${t.hero.cta2}</a>
      </div>
      <div class="hero__proof">
        <span class="avatars" aria-hidden="true">
          <span>U</span><span>U</span><span class="badge-count">5k+</span>
        </span>
        <span class="hero__proof-text"><strong>${t.hero.statBold}</strong> ${t.hero.statRest}</span>
      </div>
    </div>

    <div class="hero__panel reveal" aria-hidden="true">
      <div class="trigger-card">
        <div class="trigger-card__head">
          <span class="trigger-card__label">${ICONS.trigger}${t.hero.triggerLabel}</span>
          <span class="trigger-card__dot"></span>
        </div>
        <div class="bars">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ Services ============ -->
<section class="section services" id="services">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.services.title}</h2>
      <p>${t.services.lede}</p>
    </div>
    <div class="card-grid reveal">
      ${t.services.items.map((s, i) => `
      <article class="card">
        <span class="card__icon">${[ICONS.svcWorkflow, ICONS.svcAI, ICONS.svcArch, ICONS.svcReport][i]}</span>
        <h3 class="card__title">${s.title}</h3>
        <p class="card__body">${s.body}</p>
        <a class="card__link" href="#contact">${t.learnMore} ${ICONS.arrowSmall}</a>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ Recent Projects ============ -->
<section class="section projects" id="projects">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.projects.title}</h2>
      <p>${t.projects.lede}</p>
    </div>
    <div class="projects__grid reveal">
      ${CASES.slice(0, 6).map((c) => { const tt = c[langCode]; return `
      <article class="project-card">
        <div class="project-card__tags">
          <span class="tag">${tt.industryLabel}</span>
          <span class="tag tag--platform">N8N</span>
        </div>
        <h3 class="project-card__title">${tt.title}</h3>
        <p class="project-card__body">${tt.shortBody}</p>
        <a class="project-card__link" href="portfolio/${c.slug}.html">${t.viewCase} ${ICONS.arrowSmall}</a>
      </article>`; }).join('')}
    </div>
    <div class="projects__cta reveal">
      <a class="btn btn--ghost" href="portfolio/index.html">${t.projects.viewAll}</a>
    </div>
  </div>
</section>

<!-- ============ How We Work ============ -->
<section class="section process" id="process">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.process.title}</h2>
      <p>${t.process.lede}</p>
    </div>
    <div class="process__steps reveal">
      ${t.process.steps.map((s, i) => `
      <div class="step">
        <div class="step__num">${i + 1}</div>
        <h3 class="step__title">${s.title}</h3>
        <p class="step__body">${s.body}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ============ Architect + Team ============ -->
<section class="section architect">
  <div class="container architect__grid">
    <div class="architect__col reveal">
      <h2>${t.architect.title}</h2>
      <div class="architect__person">
        <div class="architect__photo">${t.placeholders.photo}</div>
        <div>
          <div class="architect__name">${t.architect.name}</div>
          <div class="architect__title">${t.architect.role}</div>
          <p class="architect__bio">${t.architect.bio}</p>
          <div class="architect__tags">
            ${t.architect.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="architect__col reveal">
      <h2>${t.team.title}</h2>
      <p style="color:var(--c-text-2); margin-bottom: 24px;">${t.team.lede}</p>
      <div class="partner-list">
        ${t.team.partners.map((p, i) => `
        <div class="partner">
          <span class="partner__icon">${[ICONS.ads, ICONS.seo, ICONS.ppc][i]}</span>
          <div>
            <div class="partner__name">${p.name}</div>
            <p class="partner__body">${p.body}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<!-- ============ Digital Marketing ============ -->
<section class="section marketing">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.marketing.title}</h2>
      <p>${t.marketing.lede}</p>
    </div>
    <div class="card-grid card-grid--3 reveal">
      ${t.marketing.items.map((m) => `
      <article class="card">
        <h3 class="card__title">${m.title}</h3>
        <p class="card__body">${m.body}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ Testimonials ============ -->
<section class="section testimonials">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.testimonials.title}</h2>
      <p>${t.testimonials.lede}</p>
    </div>
    <div class="testimonials__grid reveal">
      ${t.testimonials.items.map((it) => `
      <article class="tcard">
        <div class="tcard__stars" aria-label="5 stars">★★★★★</div>
        <p class="tcard__quote">“${it.quote}”</p>
        <div class="tcard__name">${it.name}</div>
        <div class="tcard__meta">${it.meta}</div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ Insights / Blog ============ -->
<section class="section insights">
  <div class="container">
    <div class="insights__head reveal">
      <div>
        <h2>${t.insights.title}</h2>
        <p>${t.insights.lede}</p>
      </div>
      <a class="insights__link" href="#">${t.insights.viewAll} ${ICONS.arrowSmall}</a>
    </div>
    <div class="insights__grid reveal">
      ${t.insights.items.map((it, i) => `
      <article class="icard">
        <div class="icard__thumb">${[ICONS.thumbGuide, ICONS.thumbAI, ICONS.thumbWarn][i]}</div>
        <div class="icard__body">
          <div class="icard__tags">
            ${it.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <h3 class="icard__title">${it.title}</h3>
          <p class="icard__excerpt">${it.excerpt}</p>
          <div class="icard__meta">${it.meta}</div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section class="section faq" id="faq">
  <div class="container">
    <div class="section-head reveal">
      <h2>${t.faq.title}</h2>
      <p>${t.faq.lede}</p>
    </div>
    <div class="faq__list reveal">
      ${t.faq.items.map((it) => `
      <details class="faq__item">
        <summary>${it.q}</summary>
        <div class="faq__answer">${it.a}</div>
      </details>`).join('')}
    </div>
  </div>
</section>

<!-- ============ Final CTA ============ -->
<section class="final-cta" id="contact">
  <div class="container reveal">
    <h2>${t.cta.title}</h2>
    <p>${t.cta.lede}</p>
    <a class="btn btn--primary btn--lg" href="${t.cta.calendlyUrl}" target="_blank" rel="noopener">${t.cta.button} ${ICONS.calendar}</a>
    <div class="final-cta__email">
      ${ICONS.mail}
      <span>${t.cta.emailPrefix} <a href="mailto:${t.cta.email}">${t.cta.email}</a></span>
    </div>
  </div>
</section>

</main>

<!-- ============ Footer ============ -->
<footer class="site-footer">
  <div class="container site-footer__inner">
    <span>© 2026 EasyTarget · ${t.footer.tagline}</span>
    <div class="site-footer__social">
      <a href="${t.cta.telegramUrl}" target="_blank" rel="noopener" aria-label="Telegram">${ICONS.telegram}</a>
      <a href="${t.cta.linkedinUrl}" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
    </div>
  </div>
</footer>

<script src="${jsPath}"></script>
</body>
</html>
`;
}

// ====================================================
// Shared contact data
// ====================================================
const CONTACT = {
  email: 'blagoveshchenskyivan@gmail.com',
  telegramUrl: 'https://t.me/Aarkashabb',
  linkedinUrl: 'https://www.linkedin.com/in/aarkashabb',
  calendlyUrl: 'https://calendly.com/easytarget',
};

// ====================================================
// Translations
// ====================================================
const UA = {
  metaTitle: 'EasyTarget — Автоматизація бізнес-процесів | N8N, Make, Zapier, AI',
  metaDesc: 'Створюю надійні автоматизовані робочі процеси на N8N, Make, Zapier та OpenAI API. Економлю години рутини й масштабую операції без зусиль.',
  a11yMainNav: 'Головна навігація',
  a11yLang: 'Перемикач мови',
  a11yMenu: 'Меню',
  bookCall: 'Записатися на дзвінок',
  learnMore: 'Дізнатися більше',
  viewCase: 'Дивитися кейс',
  nav: { services: 'Послуги', portfolio: 'Портфоліо', process: 'Процес', faq: 'FAQ' },
  placeholders: { photo: '[ фото ]' },
  hero: {
    badge: 'Відкритий до нових проєктів',
    titleA: 'Автоматизую те, що',
    titleB: 'сповільнює ваш бізнес',
    lede: 'N8N · Make · Zapier · OpenAI API — індивідуальні робочі процеси, які економлять час, усувають помилки та масштабують операції без зусиль.',
    cta1: 'Безкоштовна консультація',
    cta2: 'Переглянути роботи',
    statBold: '5 000+ годин',
    statRest: 'зекономлено для клієнтів',
    triggerLabel: 'Тригер активний',
  },
  services: {
    title: 'Основні послуги з автоматизації',
    lede: 'Прецизійна інженерія для ваших бізнес-процесів. Будую надійні масштабовані системи, які беруть на себе важку роботу.',
    items: [
      { title: 'Автоматизація процесів', body: 'З\'єднання розрізнених застосунків (CRM, email, біллінг) у безшовні операційні пайплайни без ручної роботи.' },
      { title: 'Інтеграція ШІ', body: 'Інтеграція OpenAI та LLM у ваші робочі процеси: автоматична підтримка клієнтів, генерація контенту й обробка даних.' },
      { title: 'Системна архітектура', body: 'Проєктування надійних структур даних та інфраструктури для обробки великих обсягів без вузьких місць.' },
      { title: 'Кастомна звітність', body: 'Автоматична агрегація даних із різних джерел у зрозумілі дашборди в реальному часі для управлінських рішень.' },
    ],
  },
  projects: {
    title: 'Останні проєкти',
    lede: 'Реальні приклади того, як автоматизація підвищує ефективність і прискорює зростання.',
    viewAll: 'Усі проєкти',
    items: [
      { industry: 'Банкінг', platform: 'N8N', title: 'Автоматизований KYC-конвеєр', body: 'Скорочення часу онбордингу клієнтів на 80% завдяки автоматичній верифікації документів та синхронізації з CRM.' },
      { industry: 'E-commerce', platform: 'Make', title: 'Движок синхронізації складу', body: 'Синхронізація залишків у реальному часі між Shopify, Amazon та ERP — без перепродажів і помилок.' },
      { industry: 'SaaS', platform: 'OpenAI API', title: 'ШІ-предиктор відтоку', body: 'ML-модель виявляє ризикових клієнтів і автоматично запускає листи й завдання на утримання.' },
      { industry: 'Фінанси', platform: 'Zapier', title: 'Автоматизована обробка рахунків', body: 'Наскрізна автоматизація випуску рахунків, розсилки та звірки платежів у Xero.' },
      { industry: 'CRM', platform: 'N8N', title: 'Бот збагачення лідів', body: 'Автоматично збагачує вхідні ліди даними про компанію перед маршрутизацією до потрібного менеджера.' },
      { industry: 'Підтримка', platform: 'Make', title: 'Омніканальна тикет-система', body: 'Об\'єднання звернень із соцмереж, email та чатів в єдиний пріоритизований дашборд.' },
    ],
  },
  process: {
    title: 'Як я працюю',
    lede: 'Структурований і прозорий процес — від дослідження до запуску й супроводу.',
    steps: [
      { title: 'Discovery', body: 'Заглиблення у ваші процеси та виявлення вузьких місць.' },
      { title: 'Архітектура', body: 'Проєктування масштабованого та стійкого фреймворку автоматизації.' },
      { title: 'Розробка', body: 'Створення та інтеграція робочих процесів із максимальною точністю.' },
      { title: 'Тестування', body: 'Ретельний QA — бездоганна робота навіть під навантаженням.' },
      { title: 'Запуск', body: 'Реліз, моніторинг і постійна технічна підтримка.' },
    ],
  },
  architect: {
    title: 'Про мене',
    name: 'Іван Благовещенський',
    role: 'Провідний інженер з автоматизації',
    bio: 'Понад десять років досвіду в архітектурі ПЗ та операційній ефективності. Перетворюю складні ручні процеси на елегантні автоматизовані системи. Мій підхід — прецизійна інженерія: кожен робочий процес надійний, масштабований і точно підлаштований під ваш бізнес.',
    tags: ['Експерт N8N', 'Партнер Make.com', 'Інтеграція API', 'Системний дизайн'],
  },
  team: {
    title: 'Партнерська команда',
    lede: 'Я веду основну інженерію автоматизації, а коли проєкт потребує більше — підключаю спеціалізованих партнерів для комплексних цифрових рішень.',
    partners: [
      { name: 'Спеціаліст з таргетованої реклами', body: 'Експерт із високоефективних кампаній у Meta та Google.' },
      { name: 'SEO-консультант', body: 'Технічне SEO та контент-стратегія для органічного зростання.' },
      { name: 'PPC-стратег', body: 'Максимізація ROI у платному пошуку через data-driven управління ставками.' },
    ],
  },
  marketing: {
    title: 'Інтегрований digital-маркетинг',
    lede: 'Разом із перевіреними партнерами пропоную комплексні маркетингові послуги, які безшовно інтегруються з вашими новими автоматизованими процесами.',
    items: [
      { title: 'Платна реклама', body: 'Стратегічне ведення кампаній на всіх ключових платформах — з оптимізацією під конверсію та інтеграцією з вашою автоматизованою CRM.' },
      { title: 'Пошукова оптимізація', body: 'Технічні аудити, стратегія ключових слів та on-page оптимізація для зростання органічної видимості й цільового трафіку.' },
      { title: 'Pay-Per-Click', body: 'Data-driven управління PPC — максимізація ROAS завдяки точному таргетингу та постійному A/B-тестуванню.' },
    ],
  },
  testimonials: {
    title: 'Що кажуть клієнти',
    lede: 'Не вірте мені на слово — ось як автоматизація змінила їхні операції.',
    items: [
      { quote: 'Іван повністю переосмислив наш онбординг. Те, на що команда витрачала години щодня, тепер повністю автоматизовано і без помилок. ROI ми відчули одразу.', name: '[Ім\'я клієнта]', meta: '[Посада, Компанія]' },
      { quote: 'Движок синхронізації складу, який Іван збудував для наших магазинів на Shopify, рятує нас у пікові сезони. Бездоганна реалізація та чудова комунікація.', name: '[Ім\'я клієнта]', meta: '[Посада, Компанія]' },
      { quote: 'Інтеграція OpenAI у нашу систему підтримки стала справжнім game-changer. Архітектура Івана витримує великий обсяг без жодного збою.', name: '[Ім\'я клієнта]', meta: '[Посада, Компанія]' },
    ],
  },
  insights: {
    title: 'Думки про автоматизацію',
    lede: 'Замітки, гайди та глибокі занурення у сучасну інженерію робочих процесів.',
    viewAll: 'Усі статті',
    items: [
      { tags: ['Гайд', 'N8N'], title: 'Старт із self-hosted N8N', excerpt: 'Покрокова інструкція з розгортання та захисту власного інстансу N8N для команд...', meta: '12 жовт 2023 · 8 хв читання' },
      { tags: ['ШІ', 'OpenAI'], title: 'Практичні AI-процеси для CRM', excerpt: 'Як використати LLM для автоматичного скорингу лідів і персоналізованих листів...', meta: '28 вер 2023 · 6 хв читання' },
      { tags: ['Архітектура'], title: 'Обробка помилок у складних процесах', excerpt: 'Найкращі практики для побудови стійких автоматизацій, які грамотно реагують на збої API...', meta: '15 вер 2023 · 10 хв читання' },
    ],
  },
  faq: {
    title: 'Часті запитання',
    lede: 'Поширені запитання про співпрацю та процес автоматизації.',
    items: [
      { q: 'На яких платформах ви спеціалізуєтесь?', a: 'Переважно N8N (self-hosted та хмарний), Make.com, Zapier і прямі API-/SDK-інтеграції на Node.js та Python. Для AI-функцій працюю з API OpenAI, Anthropic та Google AI.' },
      { q: 'Скільки часу триває типовий проєкт?', a: 'Discovery зазвичай займає тиждень. Типова автоматизація запускається за 2–6 тижнів — залежно від обсягу та кількості систем, що інтегруються.' },
      { q: 'Чи надаєте ви супровід після релізу?', a: 'Так — кожен запуск включає 30 днів супроводу. Також пропоную місячні ретейнери: моніторинг, оптимізація та додавання нових процесів.' },
      { q: 'Як ви забезпечуєте безпеку даних?', a: 'Усі облікові дані зберігаються в шифрованих vault-сховищах, інтеграції використовують обмежені API-токени, а self-hosted розгортання дає повний контроль над розміщенням даних. NDA та DPA — за запитом.' },
      { q: 'Чи інтегруєтесь ви з legacy-системами?', a: 'Так. Якщо в системі є API — інтеграція можлива. Для старіших систем без API будую кастомний middleware (зазвичай через N8N або тонкий шар на Node.js).' },
      { q: 'Як влаштоване ціноутворення?', a: 'Працюю переважно за фіксованою ціною проєкту після Discovery — повна вартість відома заздалегідь. Ретейнери — щомісячна оплата. Погодинна — для невеликих правок.' },
    ],
  },
  cta: {
    title: 'Готові автоматизувати свій бізнес?',
    lede: 'Перестаньте витрачати час на ручні задачі. Збудуємо масштабовану систему — і ви зможете зосередитися на зростанні.',
    button: 'Безкоштовна консультація',
    emailPrefix: 'Або напишіть напряму на',
    ...CONTACT,
  },
  footer: { tagline: 'Інженерія автоматизації для бізнесу, що росте.' },
};

const EN = {
  metaTitle: 'EasyTarget — Business Process Automation | N8N, Make, Zapier, AI',
  metaDesc: 'I build resilient automated workflows on N8N, Make, Zapier, and the OpenAI API. Save hours of manual work and scale operations effortlessly.',
  a11yMainNav: 'Main navigation',
  a11yLang: 'Language switcher',
  a11yMenu: 'Menu',
  bookCall: 'Book a Call',
  learnMore: 'Learn more',
  viewCase: 'View Case',
  nav: { services: 'Services', portfolio: 'Portfolio', process: 'Process', faq: 'FAQ' },
  placeholders: { photo: '[ photo ]' },
  hero: {
    badge: 'Available for new projects',
    titleA: 'I Automate What',
    titleB: 'Slows Your Business Down',
    lede: 'N8N · Make · Zapier · OpenAI API — custom workflows that save time, eliminate manual errors, and scale your operations effortlessly.',
    cta1: 'Book Free Consultation',
    cta2: 'See My Work',
    statBold: '5,000+ hours',
    statRest: 'saved for clients',
    triggerLabel: 'Trigger Active',
  },
  services: {
    title: 'Core Automation Services',
    lede: 'Precision engineering for your business processes. I build resilient, scalable systems that handle the heavy lifting.',
    items: [
      { title: 'Workflow Automation', body: 'Connecting your disjointed apps (CRM, Email, Billing) into seamless, zero-touch operational pipelines.' },
      { title: 'AI Integration', body: 'Injecting OpenAI and LLMs into your workflows for automated customer support, content generation, and data parsing.' },
      { title: 'System Architecture', body: 'Designing robust data structures and infrastructure to support high-volume automated processing without bottlenecks.' },
      { title: 'Custom Reporting', body: 'Automated data aggregation from multiple sources into clean, real-time dashboards for executive decision-making.' },
    ],
  },
  projects: {
    title: 'Recent Projects',
    lede: 'Real-world examples of automation driving efficiency and growth.',
    viewAll: 'View All Projects',
    items: [
      { industry: 'Banking', platform: 'N8N', title: 'Automated KYC Pipeline', body: 'Reduced client onboarding time by 80% through automated document verification and CRM syncing.' },
      { industry: 'E-commerce', platform: 'Make', title: 'Inventory Sync Engine', body: 'Real-time inventory synchronization across Shopify, Amazon, and ERP systems, eliminating overselling.' },
      { industry: 'SaaS', platform: 'OpenAI API', title: 'AI Churn Predictor', body: 'Implemented an ML model to flag at-risk accounts, automatically triggering retention emails and tasks.' },
      { industry: 'Finance', platform: 'Zapier', title: 'Automated Invoice Processing', body: 'End-to-end automation of invoice generation, client dispatch, and payment reconciliation in Xero.' },
      { industry: 'CRM', platform: 'N8N', title: 'Lead Enrichment Bot', body: 'Automatically enriches inbound leads with company data before routing to the appropriate sales rep.' },
      { industry: 'Support', platform: 'Make', title: 'Omnichannel Ticketing', body: 'Consolidated support requests from social, email, and chat into a unified, prioritized dashboard.' },
    ],
  },
  process: {
    title: 'How We Work',
    lede: 'A structured, transparent process from initial discovery to final deployment and support.',
    steps: [
      { title: 'Discovery', body: 'Deep dive into your current processes and bottlenecks.' },
      { title: 'Architecture', body: 'Designing a scalable, resilient automation framework.' },
      { title: 'Development', body: 'Building and integrating the workflows with precision.' },
      { title: 'Testing', body: 'Rigorous QA to ensure flawless execution under load.' },
      { title: 'Deployment', body: 'Go-live, monitoring, and ongoing technical support.' },
    ],
  },
  architect: {
    title: 'Meet the Architect',
    name: 'Ivan Blagoveshchensky',
    role: 'Lead Automation Engineer',
    bio: 'With over a decade of experience in software architecture and operational efficiency, I specialize in transforming complex manual processes into elegant, automated systems. My approach is rooted in precision engineering — ensuring every workflow is robust, scalable, and tailored exactly to your business needs.',
    tags: ['N8N Expert', 'Make.com Partner', 'API Integration', 'System Design'],
  },
  team: {
    title: 'The Extended Team',
    lede: 'While I handle the core automation engineering, I partner with specialized experts to deliver comprehensive digital solutions when your project requires it.',
    partners: [
      { name: 'Targeted Ads Specialist', body: 'Expert in high-converting ad campaigns across Meta and Google networks.' },
      { name: 'SEO Consultant', body: 'Driving organic growth through technical SEO and content strategy.' },
      { name: 'PPC Strategist', body: 'Maximizing ROI on paid search with data-driven bid management.' },
    ],
  },
  marketing: {
    title: 'Integrated Digital Marketing',
    lede: 'Through my trusted partners, we offer comprehensive marketing services that seamlessly integrate with your new automated workflows.',
    items: [
      { title: 'Paid Advertising', body: 'Strategic campaign management across all major platforms, optimized for conversion and integrated directly into your automated CRM pipeline.' },
      { title: 'Search Engine Optimization', body: 'Technical audits, keyword strategy, and on-page optimization to improve your organic visibility and drive high-intent traffic.' },
      { title: 'Pay-Per-Click', body: 'Data-driven PPC management focused on maximizing your return on ad spend through precise targeting and continuous A/B testing.' },
    ],
  },
  testimonials: {
    title: 'What Clients Say',
    lede: "Don't just take my word for it. Here's how automation has transformed their operations.",
    items: [
      { quote: 'Ivan completely revolutionized our onboarding process. What used to take our team hours every day is now fully automated and error-free. The ROI was immediate.', name: '[Client Name]', meta: '[Title, Company]' },
      { quote: 'The inventory sync engine Ivan built for our Shopify stores has saved us countless headaches during peak seasons. Flawless execution and great communication.', name: '[Client Name]', meta: '[Title, Company]' },
      { quote: 'Integrating OpenAI into our customer support triage was a game-changer. Ivan\'s system architecture was robust and handled our high volume without a hitch.', name: '[Client Name]', meta: '[Title, Company]' },
    ],
  },
  insights: {
    title: 'Automation Insights',
    lede: 'Thoughts, tutorials, and deep dives into modern workflow engineering.',
    viewAll: 'View All Articles',
    items: [
      { tags: ['Guide', 'N8N'], title: 'Getting Started with Self-Hosted N8N', excerpt: 'A comprehensive guide to deploying and securing your own N8N instance for teams...', meta: 'Oct 12, 2023 · 8 min read' },
      { tags: ['AI', 'OpenAI'], title: 'Practical AI Workflows for CRM', excerpt: 'How to use LLMs to automatically score leads and draft personalized outreach...', meta: 'Sep 28, 2023 · 6 min read' },
      { tags: ['Architecture'], title: 'Error Handling in Complex Workflows', excerpt: 'Best practices for building resilient automations that gracefully handle API failures...', meta: 'Sep 15, 2023 · 10 min read' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    lede: 'Common queries about working together and the automation process.',
    items: [
      { q: 'What platforms do you specialize in?', a: 'Primarily N8N (self-hosted and cloud), Make.com, Zapier, and direct API/SDK integrations using Node.js and Python. For AI features, I work with the OpenAI, Anthropic, and Google AI APIs.' },
      { q: 'How long does a typical project take?', a: 'Discovery typically takes 1 week. Most automation builds ship in 2–6 weeks depending on scope and the number of systems being integrated.' },
      { q: 'Do you provide ongoing support?', a: 'Yes — every build includes 30 days of post-launch support. I also offer monthly retainers for monitoring, optimization, and adding new workflows over time.' },
      { q: 'How do you handle data security?', a: 'All credentials are stored in encrypted vaults, all integrations use scoped API tokens, and self-hosted deployments give you full control over data residency. NDAs and DPAs available on request.' },
      { q: 'Can you integrate with legacy systems?', a: 'Yes. If a system has an API, I can integrate with it. For older systems without one, I build custom middleware (usually via N8N or a thin Node.js layer) to bridge them into modern workflows.' },
      { q: 'What is the pricing model?', a: 'I work primarily on fixed-price project quotes after the Discovery phase, so you know the total cost upfront. Retainers are billed monthly. Hourly rates are available for small fixes.' },
    ],
  },
  cta: {
    title: 'Ready to Automate Your Business?',
    lede: "Stop wasting time on manual tasks. Let's build scalable systems that let you focus on growth.",
    button: 'Book Free Consultation',
    emailPrefix: 'Or email me directly at',
    ...CONTACT,
  },
  footer: { tagline: 'Automation engineering for growing businesses.' },
};

const RU = {
  metaTitle: 'EasyTarget — Автоматизация бизнес-процессов | N8N, Make, Zapier, AI',
  metaDesc: 'Создаю надёжные автоматизированные процессы на N8N, Make, Zapier и OpenAI API. Экономлю часы рутины и масштабирую операции без лишних усилий.',
  a11yMainNav: 'Главная навигация',
  a11yLang: 'Переключатель языка',
  a11yMenu: 'Меню',
  bookCall: 'Записаться на звонок',
  learnMore: 'Узнать больше',
  viewCase: 'Смотреть кейс',
  nav: { services: 'Услуги', portfolio: 'Портфолио', process: 'Процесс', faq: 'FAQ' },
  placeholders: { photo: '[ фото ]' },
  hero: {
    badge: 'Открыт к новым проектам',
    titleA: 'Автоматизирую то,',
    titleB: 'что замедляет ваш бизнес',
    lede: 'N8N · Make · Zapier · OpenAI API — индивидуальные рабочие процессы, которые экономят время, исключают ошибки и масштабируют ваши операции без лишних усилий.',
    cta1: 'Бесплатная консультация',
    cta2: 'Посмотреть работы',
    statBold: '5 000+ часов',
    statRest: 'сэкономлено для клиентов',
    triggerLabel: 'Триггер активен',
  },
  services: {
    title: 'Ключевые услуги автоматизации',
    lede: 'Прецизионная инженерия для ваших бизнес-процессов. Создаю надёжные масштабируемые системы, которые берут на себя тяжёлую работу.',
    items: [
      { title: 'Автоматизация процессов', body: 'Соединяю разрозненные приложения (CRM, email, биллинг) в бесшовные операционные пайплайны без ручной работы.' },
      { title: 'Интеграция ИИ', body: 'Внедряю OpenAI и LLM в ваши процессы: автоматизированная поддержка клиентов, генерация контента и обработка данных.' },
      { title: 'Системная архитектура', body: 'Проектирую надёжные структуры данных и инфраструктуру для обработки больших объёмов без узких мест.' },
      { title: 'Кастомная отчётность', body: 'Автоматическая агрегация данных из разных источников в понятные дашборды в реальном времени для управленческих решений.' },
    ],
  },
  projects: {
    title: 'Недавние проекты',
    lede: 'Реальные примеры того, как автоматизация повышает эффективность и ускоряет рост.',
    viewAll: 'Все проекты',
    items: [
      { industry: 'Банкинг', platform: 'N8N', title: 'Автоматизированный KYC-конвейер', body: 'Сокращение времени онбординга клиентов на 80% за счёт автоматической верификации документов и синхронизации с CRM.' },
      { industry: 'E-commerce', platform: 'Make', title: 'Движок синхронизации склада', body: 'Синхронизация остатков в реальном времени между Shopify, Amazon и ERP — без перепродаж и ошибок.' },
      { industry: 'SaaS', platform: 'OpenAI API', title: 'ИИ-предиктор оттока', body: 'ML-модель выявляет клиентов в зоне риска и автоматически запускает письма и задачи на удержание.' },
      { industry: 'Финансы', platform: 'Zapier', title: 'Автоматизированная обработка счетов', body: 'Сквозная автоматизация выпуска счетов, отправки клиентам и сверки платежей в Xero.' },
      { industry: 'CRM', platform: 'N8N', title: 'Бот обогащения лидов', body: 'Автоматически обогащает входящие лиды данными о компании перед маршрутизацией к нужному менеджеру.' },
      { industry: 'Поддержка', platform: 'Make', title: 'Омниканальная тикет-система', body: 'Объединяет обращения из соцсетей, email и чатов в единый приоритизированный дашборд.' },
    ],
  },
  process: {
    title: 'Как я работаю',
    lede: 'Структурированный и прозрачный процесс — от исследования до запуска и поддержки.',
    steps: [
      { title: 'Discovery', body: 'Погружение в ваши процессы и поиск узких мест.' },
      { title: 'Архитектура', body: 'Проектирование масштабируемого и устойчивого фреймворка автоматизации.' },
      { title: 'Разработка', body: 'Создание и интеграция процессов с максимальной точностью.' },
      { title: 'Тестирование', body: 'Тщательный QA — безупречная работа даже под нагрузкой.' },
      { title: 'Запуск', body: 'Релиз, мониторинг и постоянная техническая поддержка.' },
    ],
  },
  architect: {
    title: 'Обо мне',
    name: 'Иван Благовещенский',
    role: 'Ведущий инженер по автоматизации',
    bio: 'Более десяти лет опыта в архитектуре ПО и операционной эффективности. Превращаю сложные ручные процессы в элегантные автоматизированные системы. Мой подход — прецизионная инженерия: каждый процесс надёжен, масштабируем и точно подогнан под нужды вашего бизнеса.',
    tags: ['Эксперт N8N', 'Партнёр Make.com', 'Интеграция API', 'Системный дизайн'],
  },
  team: {
    title: 'Команда партнёров',
    lede: 'Я веду ключевую инженерию автоматизации, а когда проект требует большего — подключаю специализированных партнёров для комплексных цифровых решений.',
    partners: [
      { name: 'Специалист по таргетированной рекламе', body: 'Эксперт по высоконверсионным кампаниям в Meta и Google.' },
      { name: 'SEO-консультант', body: 'Техническое SEO и контент-стратегия для органического роста.' },
      { name: 'PPC-стратег', body: 'Максимизация ROI в платном поиске через data-driven управление ставками.' },
    ],
  },
  marketing: {
    title: 'Интегрированный digital-маркетинг',
    lede: 'Вместе с проверенными партнёрами предлагаю комплексные маркетинговые услуги, которые бесшовно интегрируются с вашими новыми автоматизированными процессами.',
    items: [
      { title: 'Платная реклама', body: 'Стратегическое ведение кампаний на всех ключевых платформах — с оптимизацией под конверсию и интеграцией с вашей автоматизированной CRM.' },
      { title: 'Поисковая оптимизация', body: 'Технические аудиты, стратегия ключевых слов и on-page оптимизация для роста органической видимости и целевого трафика.' },
      { title: 'Pay-Per-Click', body: 'Data-driven управление PPC — максимизация ROAS благодаря точному таргетингу и постоянному A/B-тестированию.' },
    ],
  },
  testimonials: {
    title: 'Что говорят клиенты',
    lede: 'Не верьте мне на слово — вот как автоматизация изменила их операции.',
    items: [
      { quote: 'Иван полностью переосмыслил наш онбординг. То, на что команда тратила часы каждый день, теперь полностью автоматизировано и без ошибок. ROI ощутили сразу.', name: '[Имя клиента]', meta: '[Должность, Компания]' },
      { quote: 'Движок синхронизации склада, который Иван построил для наших магазинов на Shopify, спасает нас в пиковые сезоны. Безупречная реализация и отличная коммуникация.', name: '[Имя клиента]', meta: '[Должность, Компания]' },
      { quote: 'Интеграция OpenAI в нашу систему поддержки стала настоящим game-changer. Архитектура Ивана выдерживает большой объём без единого сбоя.', name: '[Имя клиента]', meta: '[Должность, Компания]' },
    ],
  },
  insights: {
    title: 'Заметки об автоматизации',
    lede: 'Мысли, гайды и глубокие разборы современной инженерии рабочих процессов.',
    viewAll: 'Все статьи',
    items: [
      { tags: ['Гайд', 'N8N'], title: 'Запуск self-hosted N8N с нуля', excerpt: 'Пошаговое руководство по развёртыванию и защите собственного инстанса N8N для команд...', meta: '12 окт 2023 · 8 мин чтения' },
      { tags: ['ИИ', 'OpenAI'], title: 'Практичные AI-процессы для CRM', excerpt: 'Как использовать LLM для автоматического скоринга лидов и персонализированных писем...', meta: '28 сен 2023 · 6 мин чтения' },
      { tags: ['Архитектура'], title: 'Обработка ошибок в сложных процессах', excerpt: 'Лучшие практики построения устойчивых автоматизаций, которые грамотно реагируют на сбои API...', meta: '15 сен 2023 · 10 мин чтения' },
    ],
  },
  faq: {
    title: 'Частые вопросы',
    lede: 'Распространённые вопросы о сотрудничестве и процессе автоматизации.',
    items: [
      { q: 'С какими платформами вы работаете?', a: 'В основном с N8N (self-hosted и облачным), Make.com, Zapier и прямыми API/SDK-интеграциями на Node.js и Python. Для AI-функций использую API OpenAI, Anthropic и Google AI.' },
      { q: 'Сколько времени занимает типичный проект?', a: 'Discovery обычно занимает неделю. Типичная автоматизация запускается за 2–6 недель — в зависимости от объёма и количества интегрируемых систем.' },
      { q: 'Вы оказываете поддержку после релиза?', a: 'Да — каждый запуск включает 30 дней постзапускной поддержки. Также предлагаю ежемесячные ретейнеры: мониторинг, оптимизация и добавление новых процессов.' },
      { q: 'Как вы обеспечиваете безопасность данных?', a: 'Все учётные данные хранятся в зашифрованных vault-хранилищах, интеграции используют ограниченные API-токены, а self-hosted развёртывание даёт полный контроль над расположением данных. NDA и DPA — по запросу.' },
      { q: 'Можете ли вы интегрироваться с legacy-системами?', a: 'Да. Если у системы есть API — интеграция возможна. Для более старых систем без API создаю кастомный middleware (обычно через N8N или тонкий слой на Node.js).' },
      { q: 'Как устроено ценообразование?', a: 'Работаю преимущественно по фиксированной цене проекта после Discovery — полная стоимость известна заранее. Ретейнеры — ежемесячная оплата. Почасовая — для небольших правок.' },
    ],
  },
  cta: {
    title: 'Готовы автоматизировать свой бизнес?',
    lede: 'Хватит тратить время на ручные задачи. Построим масштабируемую систему — и вы сможете сосредоточиться на росте.',
    button: 'Бесплатная консультация',
    emailPrefix: 'Или напишите напрямую на',
    ...CONTACT,
  },
  footer: { tagline: 'Инженерия автоматизации для растущего бизнеса.' },
};

// ====================================================
// Write the three pages
// ====================================================
await saveFile('index.html', pageHTML(UA, 'ua'));
await saveFile('en/index.html', pageHTML(EN, 'en'));
await saveFile('ru/index.html', pageHTML(RU, 'ru'));
log('Generated index.html (UA), en/index.html, ru/index.html');
