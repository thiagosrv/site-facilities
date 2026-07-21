/* ===================================================
   PS PROTEÇÃO — Main JavaScript
   GSAP + ScrollTrigger + Interactivity
   =================================================== */

/* ── Initialize Lucide Icons ── */
document.addEventListener('DOMContentLoaded', () => {
  safeInit('lucide.createIcons', () => lucide.createIcons());
  initAll();
});

function safeInit(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[init] ${name} failed:`, err);
  }
}

function initAll() {
  // CTA/lead-capture wiring must never be skipped, so it runs first and is
  // isolated from any failure in the GSAP-dependent inits below (GSAP is
  // loaded via async CDN <script> tags with no ordering guarantee against
  // this deferred script, so it may not be ready yet when DOMContentLoaded fires).
  safeInit('initLeadModal', initLeadModal);
  safeInit('initCTAIntercept', initCTAIntercept);
  safeInit('initContactFormPage', initContactFormPage);

  safeInit('gsap.registerPlugin', () => gsap.registerPlugin(ScrollTrigger));
  safeInit('initHeader', initHeader);
  safeInit('initMobileMenu', initMobileMenu);
  safeInit('initHeroAnimation', initHeroAnimation);
  safeInit('initOnlineClock', initOnlineClock);
  safeInit('initCounters', initCounters);
  safeInit('initScrollReveal', initScrollReveal);
  safeInit('initFAQ', initFAQ);
  safeInit('initSmoothAnchor', initSmoothAnchor);
  safeInit('initBlogFilters', initBlogFilters);
  safeInit('initNavSubmenu', initNavSubmenu);
  safeInit('initHeroVideoBg', initHeroVideoBg);
  safeInit('initTechSolutions', initTechSolutions);
}

/* =============================================
   HERO — video background (deferred, picks desktop or mobile source)
   ============================================= */
function initHeroVideoBg() {
  const wrap = document.querySelector('.hero-video-bg');
  if (!wrap) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && (conn.saveData || /^(slow-2g|2g)$/.test(conn.effectiveType || '')));

  if (reducedMotion || saveData) return;

  const video = wrap.querySelector(isMobile ? '.hero-video-mobile' : '.hero-video');
  if (!video) return;

  const start = () => {
    video.querySelectorAll('source[data-src]').forEach((s) => {
      s.src = s.getAttribute('data-src');
    });
    video.addEventListener('canplay', () => video.classList.add('is-loaded'), { once: true });
    video.load();
    video.play().catch(() => {});
  };

  if (document.readyState === 'complete') {
    setTimeout(start, 300);
  } else {
    window.addEventListener('load', () => setTimeout(start, 300), { once: true });
  }
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

  menu.querySelectorAll('.nav-link, .nav-sublink').forEach(link => {
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
   NAV SUBMENU — Serviços e Soluções > Segmentos
   ============================================= */
function initNavSubmenu() {
  const items = document.querySelectorAll('.nav-item.has-submenu');
  if (!items.length) return;

  function closeItem(item) {
    item.classList.remove('open');
    item.querySelector('.nav-submenu-toggle')?.setAttribute('aria-expanded', 'false');
  }
  function closeAll(except) {
    items.forEach(item => { if (item !== except) closeItem(item); });
  }

  items.forEach(item => {
    const toggle = item.querySelector('.nav-submenu-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = item.classList.contains('open');
      closeAll(item);
      item.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (e) => {
    items.forEach(item => {
      if (!item.contains(e.target)) closeItem(item);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(null);
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
  // Stat cards — cada bloco "encaixa" no lugar, como peça de quebra-cabeça
  gsap.fromTo('.stat-card',
    { scale: .4, opacity: 0, rotation: (i) => (i % 2 === 0 ? -10 : 10) },
    {
      scale: 1, opacity: 1, rotation: 0,
      duration: .65,
      stagger: .15,
      ease: 'back.out(1.7)',
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
    gsap.fromTo(pageHero.children,
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
   TECH SOLUTIONS — fundo navy → branco ao chegar + tabs
   ============================================= */
function initTechSolutions() {
  const section = document.querySelector('.tech-solutions');
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    end: 'bottom 20%',
    onEnter: () => section.classList.add('is-active'),
    onLeaveBack: () => section.classList.remove('is-active'),
  });

  const items  = section.querySelectorAll('.tech-list-item');
  const panels = section.querySelectorAll('.tech-detail-panel');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const key = item.dataset.tech;

      items.forEach((i) => {
        const isActive = i === item;
        i.classList.toggle('active', isActive);
        i.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((p) => p.classList.toggle('active', p.dataset.tech === key));
    });
  });

  /* ── Entrada "tech": slide + sweep de scan + scramble digital ── */
  gsap.set(items, { opacity: 0, x: -24 });

  ScrollTrigger.create({
    trigger: '.tech-solutions-list',
    start: 'top 82%',
    once: true,
    onEnter: () => {
      items.forEach((item, i) => {
        const numEl  = item.querySelector('.tech-list-num');
        const scanEl = item.querySelector('.tech-list-scan');
        const finalNum = numEl ? numEl.textContent : '';
        const delay = i * 0.12;

        gsap.to(item, { opacity: 1, x: 0, duration: .5, ease: 'power2.out', delay });

        if (scanEl) {
          gsap.fromTo(scanEl,
            { xPercent: -120 },
            { xPercent: 120, duration: .6, ease: 'power1.inOut', delay }
          );
        }

        if (numEl) {
          setTimeout(() => {
            let ticks = 0;
            const scramble = setInterval(() => {
              numEl.textContent = String(Math.floor(Math.random() * 90) + 10);
              ticks++;
              if (ticks > 5) {
                clearInterval(scramble);
                numEl.textContent = finalNum;
              }
            }, 45);
          }, delay * 1000);
        }
      });
    },
  });
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

/* =============================================
   LEAD MODAL — popup em 3 etapas (Dados -> Serviços -> Conectando) + GTM + e-mail + WhatsApp
   ============================================= */
const LEAD_FORM_CONFIG = {
  accessKey: '31cbc197-cb46-4864-b9d1-0d1d31a0a52d',
  whatsapp: '5519982892037',
};

const LEAD_MODAL_SERVICES = [
  'Portaria e Controle de Acesso',
  'Limpeza e Conservação',
  'Zeladoria',
  'Auxiliar Administrativo',
  'Recepção',
  'Auxiliar Contábil',
];

function buildLeadModal() {
  if (document.getElementById('lead-modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'lead-modal-overlay';
  overlay.className = 'lead-modal-overlay';
  overlay.innerHTML = `
    <div class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
      <button type="button" class="lead-modal-close" aria-label="Fechar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="lead-modal-progress">
        <span class="lead-modal-step-dot is-active" data-step-dot="1"></span>
        <span class="lead-modal-step-dot" data-step-dot="2"></span>
      </div>
      <form id="lead-modal-form" novalidate>
        <div class="lead-modal-step is-active" data-step="1">
          <h3 id="lead-modal-title" class="lead-modal-title">Solicite seu orçamento</h3>
          <p class="lead-modal-subtitle">Preencha seus dados para começar.</p>
          <div class="form-group">
            <label class="form-label" for="lead-nome">Nome</label>
            <input class="form-input" type="text" id="lead-nome" name="nome" placeholder="Seu nome" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-email">E-mail</label>
            <input class="form-input" type="email" id="lead-email" name="email" placeholder="seu@email.com.br" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-cnpj">CNPJ</label>
            <input class="form-input" type="text" id="lead-cnpj" name="cnpj" placeholder="00.000.000/0001-00" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-whatsapp">WhatsApp <span class="form-label-optional">(opcional)</span></label>
            <input class="form-input" type="tel" id="lead-whatsapp" name="whatsapp" placeholder="(19) 99999-9999">
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-contato-preferido">Por onde prefere ser contatado? <span class="form-label-optional">(opcional)</span></label>
            <select class="form-select" id="lead-contato-preferido" name="contato_preferido">
              <option value="">Selecione uma opção</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="E-mail">E-mail</option>
            </select>
          </div>
          <p class="lead-modal-error" data-error-for="1"></p>
          <button type="button" class="btn btn-gold form-submit" data-step-next>Avançar</button>
        </div>

        <div class="lead-modal-step" data-step="2">
          <h3 class="lead-modal-title">Quais serviços você precisa?</h3>
          <p class="lead-modal-subtitle">Selecione uma ou mais opções.</p>
          <div class="lead-modal-services">
            ${LEAD_MODAL_SERVICES.map((servico, i) => `
              <label class="lead-modal-service-item">
                <input type="checkbox" name="servicos" value="${servico}" id="lead-servico-${i}">
                <span>${servico}</span>
              </label>
            `).join('')}
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-mensagem">Mensagem <span class="form-label-optional">(opcional)</span></label>
            <textarea class="form-textarea" id="lead-mensagem" name="mensagem" placeholder="Conte um pouco sobre o serviço que você precisa..."></textarea>
          </div>
          <p class="lead-modal-error" data-error-for="2"></p>
          <div class="lead-modal-nav">
            <button type="button" class="lead-modal-back-btn" data-step-back>Voltar</button>
            <button type="submit" class="btn btn-gold form-submit">Enviar e falar com especialista</button>
          </div>
        </div>

        <div class="lead-modal-step" data-step="3">
          <div class="lead-modal-loading">
            <span class="lead-modal-spinner"></span>
            <p class="lead-modal-loading-text">Estamos conectando você com um especialista...</p>
          </div>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const form = overlay.querySelector('#lead-modal-form');

  overlay.querySelector('.lead-modal-close').addEventListener('click', closeLeadModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLeadModal(); });

  overlay.querySelector('[data-step-next]').addEventListener('click', () => {
    const nome  = form.querySelector('#lead-nome');
    const email = form.querySelector('#lead-email');
    const cnpj  = form.querySelector('#lead-cnpj');
    const errorEl = form.querySelector('[data-error-for="1"]');
    if (!nome.value.trim() || !email.value.trim() || !cnpj.value.trim() || !email.checkValidity()) {
      errorEl.textContent = 'Preencha nome, e-mail e CNPJ corretamente.';
      errorEl.classList.add('is-visible');
      return;
    }
    errorEl.classList.remove('is-visible');
    goToLeadStep(2);
  });

  overlay.querySelector('[data-step-back]').addEventListener('click', () => goToLeadStep(1));

  form.addEventListener('submit', (e) => handleLeadWizardSubmit(e));
}

function goToLeadStep(step) {
  const overlay = document.getElementById('lead-modal-overlay');
  if (!overlay) return;
  overlay.querySelectorAll('.lead-modal-step').forEach((el) => {
    el.classList.toggle('is-active', Number(el.dataset.step) === step);
  });
  overlay.querySelectorAll('.lead-modal-step-dot').forEach((el) => {
    el.classList.toggle('is-active', Number(el.dataset.stepDot) <= step);
  });
}

function openLeadModal() {
  buildLeadModal();
  const overlay = document.getElementById('lead-modal-overlay');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    setTimeout(() => overlay.querySelector('#lead-nome')?.focus(), 100);
  }
}

function closeLeadModal() {
  const overlay = document.getElementById('lead-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    const form = overlay.querySelector('#lead-modal-form');
    if (form) form.reset();
    goToLeadStep(1);
    overlay.querySelectorAll('.lead-modal-error').forEach((el) => el.classList.remove('is-visible'));
  }, 300);
}

async function handleLeadWizardSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errorEl = form.querySelector('[data-error-for="2"]');
  const checked = Array.from(form.querySelectorAll('input[name="servicos"]:checked')).map((el) => el.value);

  if (checked.length === 0) {
    errorEl.textContent = 'Selecione ao menos um serviço.';
    errorEl.classList.add('is-visible');
    return;
  }
  errorEl.classList.remove('is-visible');

  // Abre a aba do WhatsApp já dentro do clique do usuário, para o navegador
  // não bloquear o popup quando ela for navegada depois do fetch assíncrono.
  const waWindow = window.open('', '_blank');

  goToLeadStep(3);

  const nome     = form.querySelector('#lead-nome').value.trim();
  const email    = form.querySelector('#lead-email').value.trim();
  const cnpj     = form.querySelector('#lead-cnpj').value.trim();
  const whatsapp = form.querySelector('#lead-whatsapp').value.trim();
  const contatoPreferido = form.querySelector('#lead-contato-preferido').value.trim();
  const mensagem = form.querySelector('#lead-mensagem').value.trim();

  const data = new FormData();
  data.append('access_key', LEAD_FORM_CONFIG.accessKey);
  data.append('subject', 'Novo lead — Site PS Proteção');
  data.append('from_name', 'Site PS Proteção');
  data.append('nome', nome);
  data.append('email', email);
  data.append('cnpj', cnpj);
  if (whatsapp) data.append('whatsapp', whatsapp);
  data.append('servicos', checked.join(', '));
  if (contatoPreferido) data.append('contato_preferido', contatoPreferido);
  if (mensagem) data.append('mensagem', mensagem);

  const sendEmail = fetch('https://api.web3forms.com/submit', { method: 'POST', body: data }).catch(() => null);
  const minDelay  = new Promise((resolve) => setTimeout(resolve, 1600));
  await Promise.all([sendEmail, minDelay]);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit_lead',
    form_location: 'popup',
    lead_name: nome,
    lead_email: email,
    lead_cnpj: cnpj,
    lead_whatsapp: whatsapp,
    lead_services: checked.join(', '),
    lead_preferred_contact: contatoPreferido,
    lead_message: mensagem,
  });

  const waText = `Olá! Meu nome é ${nome} (CNPJ ${cnpj}).${whatsapp ? ` WhatsApp: ${whatsapp}.` : ''} Tenho interesse em: ${checked.join(', ')}.${contatoPreferido ? ` Prefiro ser contatado por: ${contatoPreferido}.` : ''}${mensagem ? ` Mensagem: ${mensagem}` : ''} Gostaria de solicitar um orçamento.`;
  const waUrl  = `https://wa.me/${LEAD_FORM_CONFIG.whatsapp}?text=${encodeURIComponent(waText)}`;

  if (waWindow) {
    waWindow.location.href = waUrl;
  } else {
    window.open(waUrl, '_blank', 'noopener');
  }

  closeLeadModal();
}

async function handleLeadSubmit(e, origin) {
  e.preventDefault();
  const form  = e.target;
  const btn   = form.querySelector('.form-submit');
  const msgEl = form.querySelector('.form-submit-msg');
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = 'Enviando...';
  if (msgEl) msgEl.classList.remove('is-visible');

  const data = new FormData(form);
  data.append('access_key', LEAD_FORM_CONFIG.accessKey);
  data.append('subject', 'Novo lead — Site PS Proteção');
  data.append('from_name', 'Site PS Proteção');

  const nome     = (data.get('nome') || '').toString();
  const telefone = (data.get('telefone') || '').toString();
  const mensagem = (data.get('mensagem') || '').toString();

  try {
    const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Erro desconhecido');

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submit_lead',
      form_location: origin,
      lead_name: nome,
      lead_phone: telefone,
    });

    if (msgEl) {
      msgEl.textContent = '✓ Recebemos seus dados! Abrindo o WhatsApp...';
      msgEl.style.color = '#16a34a';
      msgEl.classList.add('is-visible');
    }
    form.reset();

    const waText = `Olá! Meu nome é ${nome}. Gostaria de solicitar um orçamento.${mensagem ? ' ' + mensagem : ''}`;
    const waUrl  = `https://wa.me/${LEAD_FORM_CONFIG.whatsapp}?text=${encodeURIComponent(waText)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 900);

  } catch (err) {
    if (msgEl) {
      msgEl.textContent = '✕ Erro ao enviar — tente novamente.';
      msgEl.style.color = '#dc2626';
      msgEl.classList.add('is-visible');
    }
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function initLeadModal() {
  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lead-modal-overlay');
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeLeadModal();
  });
}

function initCTAIntercept() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a[href^="https://wa.me/"], a[href^="wa.me/"], a[href^="mailto:"], .whatsapp-float');
    if (!trigger) return;
    e.preventDefault();
    openLeadModal();
  });
}

function initContactFormPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => handleLeadSubmit(e, 'contato'));
}

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
