(function () {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.pcard');
  const empty = document.getElementById('portfolio-empty');
  if (!cards.length) return;

  // Make the entire card clickable — title, body, tags, anywhere.
  // Existing inner anchors (.pcard__thumb, .pcard__link) keep working;
  // we only intercept clicks that didn't land on a link/button.
  cards.forEach(function (card) {
    const link = card.querySelector('.pcard__link, .pcard__thumb');
    if (!link || !link.getAttribute('href')) return;
    const href = link.getAttribute('href');
    card.classList.add('pcard--clickable');
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      if (window.getSelection && String(window.getSelection())) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        window.open(href, '_blank', 'noopener');
      } else {
        window.location.href = href;
      }
    });
  });

  if (!pills.length) return;

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
