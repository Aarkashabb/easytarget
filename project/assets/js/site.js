/* EasyTarget — site.js
   Vanilla JS only. No deps. Hugo-template friendly. */
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

  /* ---- FAQ accordion: ensure only one open at a time ---- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---- Scroll reveal (disabled for now — page renders fully on load) ---- */

  /* ---- Smooth scroll for in-page nav anchors (offset for sticky header) ---- */
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

  /* ---- Language switcher: sliding indicator follows cursor ---- */
  document.querySelectorAll('.lang-switch').forEach((sw) => {
    const links = Array.from(sw.querySelectorAll('a'));
    if (!links.length) return;

    // Inject the indicator pill once.
    const pill = document.createElement('span');
    pill.className = 'lang-switch__pill';
    pill.setAttribute('aria-hidden', 'true');
    sw.insertBefore(pill, sw.firstChild);

    const moveTo = (el) => {
      if (!el) return;
      const swRect = sw.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left - swRect.left;
      pill.style.width = r.width + 'px';
      pill.style.transform = 'translateX(' + x + 'px)';
      links.forEach((l) => l.classList.toggle('is-hover', l === el));
    };

    const activeLink = sw.querySelector('a.is-active') || links[0];
    const settle = () => moveTo(activeLink);

    // Position on load, then mark ready so the legacy .is-active background fades.
    const ready = () => {
      settle();
      sw.classList.add('is-ready');
    };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    // Re-settle on resize (font load can shift widths).
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
})();
