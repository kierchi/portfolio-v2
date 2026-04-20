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
