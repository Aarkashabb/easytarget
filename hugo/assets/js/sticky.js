/* Sticky mobile CTA on inner pages (the homepage drives it from home.js).
   Shown after the first screen, hidden while the final call-to-action is visible. */
(() => {
  if (document.querySelector('.n-hero') || !document.querySelector('.n-sticky')) return;
  const end = document.querySelector('.final-cta');
  let pastFirst = false;
  let endVisible = false;
  const sync = () => document.body.classList.toggle('n-show-sticky', pastFirst && !endVisible);
  const onScroll = () => { pastFirst = window.scrollY > window.innerHeight * 0.8; sync(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (end && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => { endVisible = en.isIntersecting; });
      sync();
    }).observe(end);
  }
})();
