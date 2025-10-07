// script.js

// ========== Helpers ==========
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Smooth scroll to an element by selector or element
function smoothScrollTo(target, offset = 0) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ========== Mobile Navbar Toggle ==========
(function setupMobileNav() {
  const toggle = $('.menu-toggle');
  const nav = $('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });

  // Close nav when a link is clicked (mobile)
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ========== Smooth Scrolling for in-page links ==========
(function setupSmoothLinks() {
  const header = $('header');
  const headerOffset = header ? header.offsetHeight : 0;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    const target = $(hash);
    if (!target) return;

    e.preventDefault();
    smoothScrollTo(target, headerOffset + 8);
    history.pushState(null, '', hash);
  });
})();

// ========== Go Back buttons (keep existing href but smooth-scroll if on same page) ==========
(function setupGoBackButtons() {
  $$('.go-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href') || '';
      if (href.includes('#')) {
        // same-site anchor: smooth scroll
        const id = href.substring(href.indexOf('#'));
        const target = $(id);
        if (target) {
          e.preventDefault();
          const header = $('header');
          const headerOffset = header ? header.offsetHeight : 0;
          smoothScrollTo(target, headerOffset + 8);
        }
      }
    });
  });
})();

// ========== Scrollspy: highlight active nav link ==========
(function setupScrollSpy() {
  const sections = $$('section[id]');
  const links = $$('.nav-links a[href^="#"], .nav-links a[href*="index.html#"]');

  if (!sections.length || !links.length) return;

  const mapHrefToLink = new Map();
  links.forEach(link => {
    // normalize href to just the hash if present
    const href = link.getAttribute('href') || '';
    const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
    if (hash) mapHrefToLink.set(hash, link);
  });

  const header = $('header');
  const headerOffset = header ? header.offsetHeight : 0;

  function onScroll() {
    let currentId = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const top = rect.top - headerOffset - 12;
      if (top <= 0) currentId = '#' + sec.id;
    });

    links.forEach(l => l.classList.remove('active'));
    if (currentId && mapHrefToLink.has(currentId)) {
      mapHrefToLink.get(currentId).classList.add('active');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
})();

// ========== Footer Year ==========
(function setFooterYear() {
  const yearSpan = $('#year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
})();

// ========== Image Lightbox for About/Skills ==========
(function setupLightbox() {
  const clickableImages = $$(
    '.about-image img, .skills-grid img, .project-card img'
  );
  if (!clickableImages.length) return;

  // Create overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <figure class="lightbox-content" role="dialog" aria-modal="true" aria-label="Image preview">
      <img alt="">
      <figcaption class="lightbox-caption"></figcaption>
      <button class="lightbox-close" aria-label="Close">&times;</button>
    </figure>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('img');
  const captionEl = overlay.querySelector('.lightbox-caption');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const backdrop = overlay.querySelector('.lightbox-backdrop');

  function open(src, alt) {
    imgEl.src = src;
    imgEl.alt = alt || '';
    captionEl.textContent = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    imgEl.src = '';
    captionEl.textContent = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  clickableImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(img.src, img.alt));
  });
})();

// ========== Cards: hover focus and modal preview for projects ==========
(function setupProjectModals() {
  const projectCards = $$('.project-card');
  if (!projectCards.length) return;

  // Simple modal created once
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Project details">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');
  const body = modal.querySelector('.modal-body');

  function open(contentHtml) {
    body.innerHTML = contentHtml;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('open');
    body.innerHTML = '';
    document.body.style.overflow = '';
  }
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  projectCards.forEach(card => {
    // Add hover class handlers (CSS should style .hover)
    card.addEventListener('mouseenter', () => card.classList.add('hover'));
    card.addEventListener('mouseleave', () => card.classList.remove('hover'));

    // Click to open enlarged preview
    card.addEventListener('click', () => {
      const title = card.querySelector('h3')?.textContent || 'Project';
      const img = card.querySelector('img')?.outerHTML || '';
      const desc = card.querySelector('p')?.innerHTML || '';
      open(`
        <h3>${title}</h3>
        <div class="modal-content">
          ${img}
          <div class="modal-text">${desc}</div>
        </div>
      `);
    });
  });
})();

// ========== Contact: copy email + optional form validation ==========
(function setupContact() {
  // Copy email
  const copyButtons = $$('[data-copy-email]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email');
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy Email'), 1200);
      } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    });
  });

  // Optional: simple form validation if a contact form exists
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      const required = $$('[data-required="true"]', form);
      let valid = true;
      required.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add('field-error');
        } else {
          input.classList.remove('field-error');
        }
      });
      if (!valid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      }
    });
  }
})();

// ---------- Go Back: robust across pages ----------
(function setupGoBackRobust() {
  const header = document.querySelector('header');
  const headerOffset = header ? header.offsetHeight : 0;
  const goBackButtons = document.querySelectorAll('.go-back,[data-go-back="true"]');

  function sameOrigin(url) {
    try { return new URL(url, location.href).origin === location.origin; } catch { return false; }
  }

  goBackButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href') || '';
      const hasHistory = window.history.length > 1 && document.referrer && sameOrigin(document.referrer);

      // Prefer true back if we came from same-origin page
      if (hasHistory) {
        e.preventDefault();
        history.back();
        return;
      }

      // Fallbacks:
      if (href && href.includes('#')) {
        // Navigate to the hash target (may be other page)
        // Let default navigation happen; smooth will run on load handler below
        return;
      }

      // Ultimate fallback to home section
      e.preventDefault();
      window.location.href = 'index.html#home';
    });
  });

  // On load, if there is a hash, smooth scroll to it (accounts for header)
  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        // Allow layout to settle first
        setTimeout(() => {
          const top = target.getBoundingClientRect().top + window.pageYOffset - (headerOffset + 8);
          window.scrollTo({ top, behavior: 'smooth' });
        }, 0);
      }
    }
  });
})();

// ---------- Dark Mode with saved preference ----------
(function () {
  // Theme state
  const storageKey = 'preferred-theme';
  const root = document.documentElement; // <html>
  const toggleButton = document.getElementById('themeToggle');

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      toggleButton && (toggleButton.innerHTML = '<i class="fa-regular fa-sun"></i>');
      toggleButton && toggleButton.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      toggleButton && (toggleButton.innerHTML = '<i class="fa-regular fa-moon"></i>');
      toggleButton && toggleButton.setAttribute('aria-pressed', 'false');
    }
  }

  function getInitialTheme() {
    const fromStorage = localStorage.getItem(storageKey);
    if (fromStorage === 'light' || fromStorage === 'dark') return fromStorage;
    // Fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  // Initialize
  const initial = getInitialTheme();
  applyTheme(initial);

  // Button wiring
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTheme);
    toggleButton.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Active nav link highlighting based on current path
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(function (a) {
    const hrefFile = (a.getAttribute('href') || '').split('#')[0];
    if (hrefFile === currentPath) {
      a.classList.add('active');
    }
  });
})();

// ---------- Smooth scroll on in-page link clicks (ensure present) ----------
(function ensureSmoothLinks() {
  const header = document.querySelector('header');
  const headerOffset = header ? header.offsetHeight : 0;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - (headerOffset + 8);
    window.scrollTo({ top, behavior: 'smooth' });
    history.pushState(null, '', hash);
  });
})();