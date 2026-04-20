/* ============================================
   FILTER BAR — keep top flush with nav
   ============================================ */
const navEl = document.querySelector('.nav');
const filterBar = document.querySelector('.works-filter-bar');
if (navEl && filterBar) {
  const syncFilterTop = () => {
    filterBar.style.top = navEl.offsetHeight + 'px';
  };
  syncFilterTop();
  window.addEventListener('resize', syncFilterTop);
}

/* ============================================
   NAV TOGGLE (mobile)
   ============================================ */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.textContent = isOpen ? '✕' : '☰';
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.textContent = '☰';
    });
  });
}

/* ============================================
   WORKS FILTER
   ============================================ */
const filterTabs  = document.querySelectorAll('.filter-tab');
const workCards   = document.querySelectorAll('.work-card');
const emptyState  = document.getElementById('works-empty');

if (filterTabs.length) {
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      let visibleCount = 0;
      workCards.forEach(card => {
        const cats = card.dataset.category || '';
        const match = filter === 'all' || cats.includes(filter);
        card.classList.toggle('hidden', !match);
        if (match) visibleCount++;
      });

      // Show/hide empty state
      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    });
  });
}

/* ============================================
   CONTACT FORM
   ============================================ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    const originalLabel = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'sending…';

    try {
      const res = await fetch('https://formspree.io/f/mqewllpy', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        contactForm.hidden = true;
        formSuccess.hidden = false;
      } else {
        const json = await res.json();
        const msg = json.errors
          ? json.errors.map(err => err.message).join(', ')
          : 'Something went wrong — please try again.';
        showFormError(contactForm, msg);
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    } catch {
      showFormError(contactForm, 'Network error — check your connection and try again.');
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

function showFormError(form, message) {
  let el = form.querySelector('.form-error-msg');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-error-msg';
    form.appendChild(el);
  }
  el.textContent = message;
}

/* ============================================
   LIGHTBOX
   ============================================ */
(function () {
  // Build overlay once
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <img class="lb-img" src="" alt="">
  `;
  document.body.appendChild(overlay);

  const lbImg   = overlay.querySelector('.lb-img');
  const lbClose = overlay.querySelector('.lb-close');

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.classList.toggle('lb-svg', src.endsWith('.svg'));
    overlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('lb-open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  lbClose.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Wire up all content images (skip nav-logo, tool logos, badges, deco, and slider items)
  document.querySelectorAll(
    '.cluster-img-placeholder img, .featured-img img, .about-photo-placeholder img, ' +
    '.work-img img, .pj-card img, .misc-img img, .pj-panel img, ' +
    '.showcase-ph img, .screen-ph img, .cluster-label img, .cluster-ph img, ' +
    '.pj-placeholder img'
  ).forEach(img => {
    // Skip items that have their own before/after slider
    if (img.closest('.has-slider')) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      open(img.src, img.alt);
    });
  });
})();

/* ============================================
   STICKER HOVER TILT (subtle mouse parallax)
   ============================================ */
document.querySelectorAll('.sticker-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / rect.width;
    const dy     = (e.clientY - cy) / rect.height;
    const tiltX  = dy * -6;
    const tiltY  = dx *  6;
    card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ============================================
   CUSTOM CURSOR + STICKER TRAIL
   ============================================ */
(function () {
  // Skip on touch / coarse-pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* ── Star cursor SVG ── */
  const PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" fill="#3E2723" stroke="#FFFAF3" stroke-width="1.2"/>
  </svg>`;

  /* ── Trail config ── */
  const SHAPES  = ['✦', '★', '♥', '●'];
  const COLORS  = ['#FFB3C6', '#FFE566', '#C5B4E3', '#B2E8D8', '#A8D8EA', '#FF8C7A'];
  const SIZES   = [13, 15, 17, 12];
  const MAX_POOL = 30;           // reuse DOM nodes
  const SPAWN_DIST = 22;         // px between trail particles
  const TRAIL_DUR  = 750;        // ms, must match CSS animation duration

  /* ── Create cursor plane element ── */
  const plane = document.createElement('div');
  plane.className = 'cursor-plane';
  plane.innerHTML = PLANE_SVG;
  document.body.appendChild(plane);

  /* ── Particle pool ── */
  const pool = [];
  for (let i = 0; i < MAX_POOL; i++) {
    const el = document.createElement('span');
    el.className = 'cursor-trail';
    el.hidden = true;
    document.body.appendChild(el);
    pool.push(el);
  }
  let poolIdx = 0;

  function getParticle() {
    const el = pool[poolIdx % MAX_POOL];
    poolIdx++;
    return el;
  }

  /* ── State ── */
  let mouseX = -200, mouseY = -200;
  let renderX = -200, renderY = -200;
  let lastSpawnX = -9999, lastSpawnY = -9999;
  let visible = false;

  /* ── Activate ── */
  document.documentElement.classList.add('custom-cursor');

  /* ── Mouse tracking ── */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      renderX = mouseX;
      renderY = mouseY;
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => { visible = false; });
  document.addEventListener('mouseenter', () => { visible = true;  });

  /* ── Spawn a trail particle ── */
  function spawnParticle(x, y) {
    const el     = getParticle();
    const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size   = SIZES[Math.floor(Math.random() * SIZES.length)];
    // random gentle drift
    const tx = (Math.random() - 0.5) * 28;
    const ty = -(Math.random() * 28 + 16);

    el.textContent  = shape;
    el.style.color  = color;
    el.style.fontSize = size + 'px';
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.setProperty('--tx', tx + 'px');
    el.style.setProperty('--ty', ty + 'px');
    el.hidden = false;

    // Restart animation
    el.classList.remove('cursor-trail-animate');
    void el.offsetWidth; // reflow
    el.classList.add('cursor-trail-animate');

    // Hide after animation ends
    setTimeout(() => { el.hidden = true; }, TRAIL_DUR);
  }

  /* ── RAF loop ── */
  function loop() {
    requestAnimationFrame(loop);

    // Snap directly to mouse — no lag
    renderX = mouseX;
    renderY = mouseY;

    // Position star cursor centered on mouse
    plane.style.transform = `translate(${renderX - 12}px, ${renderY - 12}px)`;
    plane.style.opacity   = visible ? '1' : '0';

    // Spawn trail particles every SPAWN_DIST px
    const ddx  = renderX - lastSpawnX;
    const ddy  = renderY - lastSpawnY;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy);
    if (visible && dist >= SPAWN_DIST) {
      spawnParticle(renderX, renderY);
      lastSpawnX = renderX;
      lastSpawnY = renderY;
    }
  }

  requestAnimationFrame(loop);
})();
