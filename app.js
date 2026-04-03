// Sherwood Forest Timeline — Interactive App

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let activeFilter = 'all';
  let activeEra    = 'all';
  let sortOrder    = 'asc'; // 'asc' | 'desc'

  // ── DOM Refs ───────────────────────────────────────────────────────────────
  const container  = document.getElementById('timelineContainer');
  const countNum   = document.getElementById('countNum');
  const noResults  = document.getElementById('noResults');
  const filterPills = document.getElementById('filterPills');
  const eraBar     = document.getElementById('eraBar');
  const sortAsc    = document.getElementById('sortAsc');
  const sortDesc   = document.getElementById('sortDesc');

  // ── Theme Toggle ───────────────────────────────────────────────────────────
  (function () {
    const btn = document.querySelector('[data-theme-toggle]');
    const root = document.documentElement;
    // start dark
    let current = root.getAttribute('data-theme') || 'dark';
    updateThemeBtn(btn, current);
    if (btn) {
      btn.addEventListener('click', () => {
        current = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', current);
        updateThemeBtn(btn, current);
      });
    }
    function updateThemeBtn(b, theme) {
      if (!b) return;
      if (theme === 'dark') {
        b.setAttribute('aria-label', 'Switch to light mode');
        b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      } else {
        b.setAttribute('aria-label', 'Switch to dark mode');
        b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }
    }
  })();

  // ── Filter Logic ───────────────────────────────────────────────────────────
  function filterEvents() {
    let events = [...TIMELINE_EVENTS];

    if (activeFilter !== 'all') {
      events = events.filter(e => e.tags.includes(activeFilter));
    }
    if (activeEra !== 'all') {
      events = events.filter(e => e.era === activeEra);
    }

    events.sort((a, b) => sortOrder === 'asc' ? a.year - b.year : b.year - a.year);

    return events;
  }

  // ── Tag label map ──────────────────────────────────────────────────────────
  const TAG_LABELS = {
    'royal':       { label: 'Royal & Crown', color: 'tag-royal' },
    'commons':     { label: 'Commons & Rights', color: 'tag-commons' },
    'robin-hood':  { label: 'Robin Hood', color: 'tag-robin' },
    'enclosure':   { label: 'Enclosure', color: 'tag-enclosure' },
    'industry':    { label: 'Industry', color: 'tag-industry' },
    'conservation':{ label: 'Conservation', color: 'tag-conservation' },
  };

  // ── Render Timeline ────────────────────────────────────────────────────────
  function renderTimeline() {
    const events = filterEvents();
    container.innerHTML = '';
    countNum.textContent = events.length;

    if (events.length === 0) {
      noResults.removeAttribute('hidden');
      return;
    }
    noResults.setAttribute('hidden', '');

    events.forEach((ev, idx) => {
      const side = idx % 2 === 0 ? 'left' : 'right';
      const item = document.createElement('div');
      item.className = `timeline-item timeline-${side}`;
      item.setAttribute('role', 'listitem');
      item.dataset.id = ev.id;

      // Tags HTML
      const tagsHtml = ev.tags.map(t => {
        const info = TAG_LABELS[t] || { label: t, color: 'tag-default' };
        return `<span class="tag ${info.color}">${info.label}</span>`;
      }).join('');

      // Conflict badge
      const conflictBadge = ev.conflict
        ? `<span class="conflict-badge" title="This event involves conflict over commons or rights">⚔ Conflict</span>`
        : '';

      item.innerHTML = `
        <div class="timeline-connector">
          <div class="timeline-dot ${ev.conflict ? 'dot-conflict' : ''}"></div>
        </div>
        <div class="timeline-card" tabindex="0">
          <div class="card-header">
            <div class="card-year">${ev.yearLabel}</div>
            ${conflictBadge}
          </div>
          <h3 class="card-title">${ev.title}</h3>
          <div class="card-tags">${tagsHtml}</div>
          <p class="card-body">${ev.body}</p>
          <a class="card-source" href="${ev.sourceUrl}" target="_blank" rel="noopener" aria-label="Source: ${ev.source}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            ${ev.source}
          </a>
        </div>
      `;

      container.appendChild(item);
    });

    // Animate in
    requestAnimationFrame(() => {
      container.querySelectorAll('.timeline-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.04}s`;
        card.classList.add('card-animate-in');
      });
    });
  }

  // ── Filter Pills ───────────────────────────────────────────────────────────
  filterPills.addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    filterPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderTimeline();
  });

  // ── Era Bar ────────────────────────────────────────────────────────────────
  eraBar.addEventListener('click', e => {
    const btn = e.target.closest('.era-btn');
    if (!btn) return;
    eraBar.querySelectorAll('.era-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEra = btn.dataset.era;
    renderTimeline();
  });

  // ── Sort Buttons ───────────────────────────────────────────────────────────
  sortAsc.addEventListener('click', () => {
    sortOrder = 'asc';
    sortAsc.classList.add('active');
    sortDesc.classList.remove('active');
    renderTimeline();
  });

  sortDesc.addEventListener('click', () => {
    sortOrder = 'desc';
    sortDesc.classList.add('active');
    sortAsc.classList.remove('active');
    renderTimeline();
  });

  // ── Scroll-to-timeline from hero ───────────────────────────────────────────
  document.querySelectorAll('a[href="#timeline"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ── Keyboard nav on cards ──────────────────────────────────────────────────
  container.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.timeline-card');
      if (card) card.classList.toggle('expanded');
    }
  });

  // ── Scroll progress bar ────────────────────────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  // ── Init ───────────────────────────────────────────────────────────────────
  renderTimeline();

})();
