/* ===================================================
   PS PROTEÇÃO — Main JavaScript
   GSAP + ScrollTrigger + Interactivity
   =================================================== */

/* ── Initialize Lucide Icons ── */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initAll();
});

function initAll() {
  gsap.registerPlugin(ScrollTrigger);

  initHeader();
  initMobileMenu();
  initHeroAnimation();
  initOnlineClock();
  initCounters();
  initScrollReveal();
  initFAQ();
  initSmoothAnchor();
  initBlogFilters();
}

/* =============================================
   HEADER — scroll effect
   ============================================= */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: (self) => {
      header.classList.toggle('scrolled', self.progress > 0);
    }
  });

  // Active nav link by section in viewport
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.nav-link[href*="#"]');

  if (sections.length && navLinks.length) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: () => {
        let current = '';
        sections.forEach(section => {
          const top = section.getBoundingClientRect().top;
          if (top < 120) current = section.id;
        });
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href')?.includes(current));
        });
      }
    });
  }
}

/* =============================================
   MOBILE MENU
   ============================================= */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const MOBILE_BP = 1200;
  const SVG_MENU  = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  const SVG_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // Inline styles = máxima prioridade, imune ao cascade do CSS
  function applyHidden() {
    menu.style.opacity       = '0';
    menu.style.transform     = 'translateY(-8px)';
    menu.style.pointerEvents = 'none';
  }
  function applyVisible() {
    menu.style.opacity       = '1';
    menu.style.transform     = 'translateY(0)';
    menu.style.pointerEvents = 'all';
  }
  function clearInline() {
    menu.style.opacity       = '';
    menu.style.transform     = '';
    menu.style.pointerEvents = '';
  }

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    applyVisible();
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = SVG_CLOSE;
  }
  function closeMenu() {
    isOpen = false;
    applyHidden();
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = SVG_MENU;
  }

  // Estado inicial
  if (window.innerWidth <= MOBILE_BP) applyHidden();

  toggle.addEventListener('click', (e) => {
    e.stopPropagation(); // impede bubbling ao document antes de trocar innerHTML
    isOpen ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target)) closeMenu();
  });

  // Ao redimensionar: limpa inline se desktop, re-esconde se voltou ao mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BP) {
      clearInline();
      isOpen = false;
    } else if (!isOpen) {
      applyHidden();
    }
  });
}

/* =============================================
   HERO ANIMATION — Fade simples
   ============================================= */
function initHeroAnimation() {
  const els = [
    document.querySelector('.hero-tag'),
    document.querySelector('.hero-title'),
    document.querySelector('.hero-subtitle'),
    document.querySelector('.hero-actions'),
    document.querySelector('.hero-trust'),
    document.querySelector('.hero-image-wrap'),
    document.querySelector('.hero-badge-1'),
  ].filter(Boolean);

  gsap.from(els, {
    opacity: 0,
    y: 16,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.06,
  });
}

/* =============================================
   ONLINE CLOCK
   ============================================= */
function initOnlineClock() {
  const timeEl = document.querySelector('.hero-online-time');
  if (!timeEl) return;

  function tick() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${h}:${m}`;
  }

  tick();
  // align to next full minute, then update every 60s
  const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
  setTimeout(() => { tick(); setInterval(tick, 60000); }, msToNextMinute);
}

/* =============================================
   COUNTER ANIMATION
   ============================================= */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  counters.forEach(counter => {
    const card    = counter.closest('[data-value]');
    const target  = parseInt(card?.dataset.value || 0);
    const suffix  = card?.dataset.suffix || '';
    const duration = 2;

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate() {
            const suffix_span = counter.nextElementSibling;
            counter.textContent = Math.round(this.targets()[0].val).toLocaleString('pt-BR');
          }
        });
      }
    });
  });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
function initScrollReveal() {
  // Stat cards
  gsap.fromTo('.stat-card',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .7,
      stagger: .12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' }
    }
  );

  // MVV cards — fade + rise com stagger, card central atrasa ligeiramente
  gsap.fromTo('.mvv-card',
    { y: 60, opacity: 0, scale: .96 },
    {
      y: 0, opacity: 1, scale: 1,
      duration: .75,
      stagger: { each: .18, ease: 'power1.in' },
      ease: 'power3.out',
      scrollTrigger: { trigger: '.mvv-grid', start: 'top 78%' }
    }
  );

  // Service image cards (home)
  gsap.fromTo('.svc-card',
    { y: 70, opacity: 0, scale: .97 },
    {
      y: 0, opacity: 1, scale: 1,
      duration: .7,
      stagger: { each: .12, ease: 'power1.in' },
      ease: 'power3.out',
      scrollTrigger: { trigger: '.services-img-grid', start: 'top 80%' }
    }
  );

  // Segment items
  gsap.fromTo('.segment-item',
    { y: 20, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .5,
      stagger: .08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.segments-scroll', start: 'top 85%' }
    }
  );

  // Testimonial cards
  gsap.fromTo('.testimonial-card',
    { y: 50, opacity: 0, scale: .97 },
    {
      y: 0, opacity: 1, scale: 1,
      duration: .7,
      stagger: .15,
      ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.testimonials-grid', start: 'top 78%' }
    }
  );

  // Timeline image
  gsap.fromTo('.timeline-main-image',
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.timeline-layout', start: 'top 75%' }
    }
  );

  // Timeline steps
  gsap.fromTo('.timeline-step',
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .7,
      stagger: .2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.timeline-steps', start: 'top 78%' }
    }
  );

  // Guarantee cards
  gsap.fromTo('.guarantee-card',
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .6,
      stagger: .1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.guarantees-grid', start: 'top 78%' }
    }
  );

  // About grid
  const aboutImg     = document.querySelector('.about-image-side');
  const aboutContent = document.querySelector('.about-content');
  if (aboutImg) {
    gsap.fromTo(aboutImg,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
      }
    );
  }
  if (aboutContent) {
    gsap.fromTo(aboutContent,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: .15,
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
      }
    );
  }

  // City tags
  gsap.fromTo('.city-tag',
    { scale: .85, opacity: 0 },
    {
      scale: 1, opacity: 1,
      duration: .4,
      stagger: .04,
      ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.cities-tags', start: 'top 80%' }
    }
  );

  // FAQ items
  gsap.fromTo('.faq-item',
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .5,
      stagger: .1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.faq-grid', start: 'top 78%' }
    }
  );

  // Blog cards (listing grid)
  gsap.fromTo('.blog-card',
    { y: 40, opacity: 0, scale: .97 },
    {
      y: 0, opacity: 1, scale: 1,
      duration: .6,
      stagger: { each: .1, ease: 'power1.in' },
      ease: 'power3.out',
      scrollTrigger: { trigger: '.blog-grid', start: 'top 82%' }
    }
  );

  // Blog featured post
  const blogFeatured = document.querySelector('.blog-featured');
  if (blogFeatured) {
    gsap.fromTo(blogFeatured,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: .8, ease: 'power3.out' }
    );
  }

  // Section headers
  document.querySelectorAll('.section-header').forEach(el => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: .7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 82%' }
      }
    );
  });

  // Page hero (sub-pages)
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    gsap.fromTo(pageHero.querySelectorAll('*'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power2.out', delay: .2 }
    );
  }

  // Value items
  gsap.fromTo('.value-item',
    { x: -20, opacity: 0 },
    {
      x: 0, opacity: 1,
      duration: .5,
      stagger: .1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about-values', start: 'top 82%' }
    }
  );
}

/* =============================================
   FAQ ACCORDION
   ============================================= */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question) return;

    const answerId = answer && !answer.id ? `faq-answer-${index}` : answer?.id;
    if (answer && answerId) answer.id = answerId;
    question.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    if (answerId) question.setAttribute('aria-controls', answerId);
    if (answer) answer.setAttribute('role', 'region');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* =============================================
   SMOOTH ANCHOR SCROLL
   ============================================= */
function initSmoothAnchor() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerH = document.querySelector('.header')?.offsetHeight || 80;

      gsap.to(window, {
        duration: 1,
        scrollTo: { y: target, offsetY: headerH },
        ease: 'power3.inOut'
      });
    });
  });
}

/* =============================================
   BLOG — Filtro de categorias
   ============================================= */
function initBlogFilters() {
  const buttons = document.querySelectorAll('.blog-filter-btn');
  const cards   = document.querySelectorAll('.blog-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

/* Contact form handled inline in contato.html via Web3Forms */

/* =============================================
   GSAP ScrollTo plugin fallback (native)
   ============================================= */
if (!gsap.plugins.scrollTo) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
