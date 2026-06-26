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

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    // Swap icon
    toggle.innerHTML = isOpen
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });

  // Close menu on link click
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });
}

/* =============================================
   HERO ANIMATION — Typewriter
   ============================================= */
function initHeroAnimation() {
  const heroTag      = document.querySelector('.hero-tag');
  const heroTitle    = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroActions  = document.querySelector('.hero-actions');
  const heroTrust    = document.querySelector('.hero-trust');
  const heroImage    = document.querySelector('.hero-image-wrap');
  const heroBadge1   = document.querySelector('.hero-badge-1');
  const heroBadge2   = document.querySelector('.hero-badge-2');

  /* ── 1. Split hero title into individual character spans ── */
  if (heroTitle) {
    function wrapCharsInNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const chars = node.textContent.split('');
        const frag  = document.createDocumentFragment();
        chars.forEach(ch => {
          const s = document.createElement('span');
          s.className    = 'char';
          s.textContent  = ch;
          s.style.opacity = '0.5';
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        // recurse into child nodes (handles <span class="hero-title-accent">)
        Array.from(node.childNodes).forEach(wrapCharsInNode);
      }
    }
    wrapCharsInNode(heroTitle);
  }

  /* ── 2. Parallel timeline: image + tag enter first ── */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroImage)    tl.from(heroImage,  { x: 40, opacity: 0, duration: .5 }, 0.05);
  if (heroBadge2)   tl.from(heroBadge2, { y: -14, opacity: 0, duration: .3 }, 0.3);
  if (heroBadge1)   tl.from(heroBadge1, { y: 14, opacity: 0, duration: .3 }, 0.4);
  if (heroTag)      tl.from(heroTag,    { y: 14, opacity: 0, duration: .3 }, 0.1);

  /* ── 3. Hero title: slides in at 50% opacity ── */
  if (heroTitle) {
    tl.fromTo(heroTitle,
      { y: 20, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.35, ease: 'power2.out' },
      0.2
    );

    /* ── 4. Typewriter: chars animate 0.5 → 1 one by one ── */
    const chars = heroTitle.querySelectorAll('.char');
    tl.to(chars, {
      opacity: 1,
      duration: 0.006,
      stagger: { each: 0.014, ease: 'none' },
      ease: 'none'
    }, 0.48);
  }

  /* ── 5. Remaining elements cascade after typing ── */
  const afterType = chars => {
    const count = heroTitle ? heroTitle.querySelectorAll('.char').length : 0;
    return 0.48 + count * 0.014 + 0.06;
  };
  const afterDelay = afterType();

  if (heroSubtitle) tl.from(heroSubtitle, { y: 14, opacity: 0, duration: .35 }, afterDelay);
  if (heroActions)  tl.from(heroActions,  { y: 10, opacity: 0, duration: .35 }, afterDelay + 0.08);
  if (heroTrust)    tl.from(heroTrust,    { y: 8,  opacity: 0, duration: .35 }, afterDelay + 0.16);
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

  // Service cards
  gsap.fromTo('.service-card',
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: .7,
      stagger: .1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.services-grid', start: 'top 78%' }
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
    { x: -60, opacity: 0 },
    {
      x: 0, opacity: 1,
      duration: .9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.timeline-layout', start: 'top 75%' }
    }
  );

  // Timeline steps
  gsap.fromTo('.timeline-step',
    { x: 40, opacity: 0 },
    {
      x: 0, opacity: 1,
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
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
      }
    );
  }
  if (aboutContent) {
    gsap.fromTo(aboutContent,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: .15,
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
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(other => other.classList.remove('open'));

      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
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
