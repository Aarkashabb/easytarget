/* Homepage «Night shift»: scenario switcher, pointer tilt, off-screen pause, sticky mobile CTA.
   Vanilla JS, no deps. The scene itself is CSS 3D, so the page works without this file. */
(() => {
  const hero = document.querySelector('.n-hero');
  if (!hero) return;
  const board = hero.querySelector('.n-board');
  const tabs = Array.from(hero.querySelectorAll('.n-tab'));
  const names = Array.from(hero.querySelectorAll('.n-node b'));
  const caption = hero.querySelector('.n-caption');

  /* ---- Scenario switcher ---- */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      let nodes = [];
      try { nodes = JSON.parse(tab.dataset.nodes || '[]'); } catch (e) { return; }
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      names.forEach((el, i) => { if (nodes[i]) el.textContent = nodes[i]; });
      if (caption) caption.textContent = tab.dataset.caption || '';
    });
  });

  /* ---- Pointer tilt (mouse only, never on touch, respects reduced motion) ---- */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (board && fine && !still) {
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        board.style.setProperty('--rx', (56 - py * 8).toFixed(2) + 'deg');
        board.style.setProperty('--rz', (-34 + px * 12).toFixed(2) + 'deg');
      });
    });
    hero.addEventListener('pointerleave', () => {
      board.style.removeProperty('--rx');
      board.style.removeProperty('--rz');
    });
  }

  /* ---- Pause the scene off-screen; show the sticky CTA after the hero ---- */
  if ('IntersectionObserver' in window) {
    const contact = document.getElementById('contact');
    let heroVisible = true;
    let contactVisible = false;
    const sync = () => {
      hero.classList.toggle('is-paused', !heroVisible);
      document.body.classList.toggle('n-show-sticky', !heroVisible && !contactVisible);
    };
    new IntersectionObserver((entries) => {
      entries.forEach((en) => { heroVisible = en.isIntersecting; });
      sync();
    }).observe(hero);
    if (contact) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => { contactVisible = en.isIntersecting; });
        sync();
      }).observe(contact);
    }
  }
})();
