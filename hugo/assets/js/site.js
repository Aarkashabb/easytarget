/* EasyTarget — site.js
   Vanilla JS only. No deps. */
(function () {
  'use strict';

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') nav.classList.remove('is-open');
    });
  }

  /* ---- FAQ accordion: only one open at a time ---- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---- Smooth scroll for in-page anchors with sticky header offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- Language switcher: sliding indicator pill ---- */
  document.querySelectorAll('.lang-switch').forEach((sw) => {
    const links = Array.from(sw.querySelectorAll('a'));
    if (!links.length) return;

    const pill = document.createElement('span');
    pill.className = 'lang-switch__pill';
    pill.setAttribute('aria-hidden', 'true');
    sw.insertBefore(pill, sw.firstChild);

    const moveTo = (el) => {
      if (!el) return;
      const swRect = sw.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      pill.style.width = r.width + 'px';
      pill.style.transform = 'translateX(' + (r.left - swRect.left) + 'px)';
      links.forEach((l) => l.classList.toggle('is-hover', l === el));
    };

    const activeLink = sw.querySelector('a.is-active') || links[0];
    const settle = () => moveTo(activeLink);

    const ready = () => { settle(); sw.classList.add('is-ready'); };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    window.addEventListener('resize', settle);

    links.forEach((a) => {
      a.addEventListener('mouseenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    sw.addEventListener('mouseleave', settle);
    sw.addEventListener('focusout', (e) => {
      if (!sw.contains(e.relatedTarget)) settle();
    });
  });

  /* ---- GA4 lead events: clicks on Calendly / Telegram / mailto links ----
     gtag.js loads lazily (see head.html), so push straight to dataLayer in gtag format. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  const leadMethod = (a) => {
    if (a.protocol === 'mailto:') return 'email';
    const host = a.hostname.toLowerCase();
    if (host === 'calendly.com' || host.endsWith('.calendly.com')) return 'calendly';
    if (host === 't.me' || host === 'telegram.me') return 'telegram';
    return '';
  };

  const leadPlace = (a) => {
    if (a.closest('.site-header')) return 'header';
    if (a.closest('.site-footer')) return 'footer';
    if (a.closest('.post-cta')) return 'post-cta';
    if (a.closest('.final-cta')) return 'final-cta';
    if (a.closest('.post-content')) return 'article-text';
    return 'page';
  };

  const onLeadClick = (e) => {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const method = leadMethod(a);
    if (!method) return;
    const location = (window.location.pathname + ' | ' + leadPlace(a)).slice(0, 100);
    /* Deferred one tick: the click that first triggers the lazy GA loader (a listener on
       window, which runs after this one) must queue 'js' and 'config' before our event. */
    setTimeout(() => gtag('event', 'generate_lead', { method: method, location: location }), 0);
  };
  document.addEventListener('click', onLeadClick);
  document.addEventListener('auxclick', onLeadClick);

  /* ---- Scroll reveal via IntersectionObserver ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    reveals.forEach((el) => el.classList.add('reveal--pending'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal--pending');
          entry.target.classList.add('reveal--visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach((el) => io.observe(el));
  }
})();
