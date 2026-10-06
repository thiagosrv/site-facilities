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
  safeInit('initGclidCapture', initGclidCapture);
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
   LEAD MODAL — formulário único (Nome, WhatsApp, Cidade, Serviço, CNPJ)
   Fluxo: valida -> CRM (protocolo) + e-mail -> GTM -> WhatsApp
   ============================================= */
const LEAD_FORM_CONFIG = {
  accessKey: '31cbc197-cb46-4864-b9d1-0d1d31a0a52d',
  whatsapp: '5519982892037',
  crmUrl: 'https://crm-thiago-steel.vercel.app/api/leads/site',
  crmTimeoutMs: 3000,
  cnpjTimeoutMs: 6000,
};

// O CRM guarda exatamente esta frase como prova do consentimento (LGPD): o que
// aparece na tela e o que é enviado precisam ser a mesma constante.
const LEAD_CONSENT_TEXT = 'Ao enviar, você autoriza a PS Proteção a usar seu nome e WhatsApp para retornar este contato e enviar o orçamento.';

const LEAD_MODAL_SERVICES = [
  { value: 'portaria', label: 'Portaria e Controle de Acesso' },
  { value: 'limpeza', label: 'Limpeza e Conservação' },
  { value: 'zeladoria', label: 'Zeladoria' },
  { value: 'recepcao', label: 'Recepção' },
  { value: 'administrativo', label: 'Auxiliar Administrativo' },
  { value: 'contabil', label: 'Auxiliar Contábil' },
  { value: 'outros', label: 'Outro' },
];

// Mesmas cidades atendidas das páginas por cidade (scripts/data/cities.js), em ordem alfabética.
const LEAD_CITY_NAMES = ["Águas de Lindóia","Águas de São Pedro","Americana","Amparo","Analândia","Araras","Artur Nogueira","Brotas","Campinas","Capivari","Cerquilho","Charqueada","Conchal","Cordeirópolis","Corumbataí","Cosmópolis","Descalvado","Elias Fausto","Engenheiro Coelho","Estiva Gerbi","Holambra","Hortolândia","Indaiatuba","Ipeúna","Iracemápolis","Itatiba","Itirapina","Jaguariúna","Jumirim","Leme","Limeira","Lindóia","Louveira","Mogi Guaçu","Mogi Mirim","Mombuca","Monte Alegre do Sul","Monte Mor","Morungaba","Nova Odessa","Paulínia","Pedreira","Piracicaba","Pirassununga","Porto Ferreira","Rafard","Rio Claro","Rio das Pedras","Saltinho","Santa Bárbara d'Oeste","Santa Cruz da Conceição","Santa Gertrudes","Santa Rita do Passa Quatro","São Pedro","Serra Negra","Socorro","Sumaré","Tietê","Valinhos","Vinhedo"];

/* ---- CNPJ ----
   Desde jul/2026 a Receita emite CNPJ alfanumérico (12 primeiras posições A-Z/0-9,
   2 dígitos verificadores numéricos). O DV usa (código ASCII - 48) como valor. */
const LEAD_CNPJ_W1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const LEAD_CNPJ_W2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function leadCleanCnpj(value) {
  return String(value).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14);
}

function leadMaskCnpj(value) {
  const c = leadCleanCnpj(value);
  const len = c.length;
  if (len <= 2) return c;
  if (len <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
  if (len <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
  if (len <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}

function leadCnpjCheckDigit(chars, weights) {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += (chars.charCodeAt(i) - 48) * weights[i];
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function leadIsValidCnpj(value) {
  const c = leadCleanCnpj(value);
  if (c.length !== 14) return false;
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) return false;
  // Sequências repetidas passam no cálculo, mas não existem.
  if (/^(.)\1{13}$/.test(c)) return false;
  const dv1 = leadCnpjCheckDigit(c, LEAD_CNPJ_W1);
  const dv2 = leadCnpjCheckDigit(c.slice(0, 12) + dv1, LEAD_CNPJ_W2);
  return c[12] === String(dv1) && c[13] === String(dv2);
}

// Consulta pública (dados da Receita) via BrasilAPI. É um "extra": qualquer
// falha/demora devolve { status: 'error' } e NUNCA bloqueia o envio.
async function leadLookupCnpj(cnpj, signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LEAD_FORM_CONFIG.cnpjTimeoutMs);
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { signal: controller.signal });
    // 400/404 = base não conhece esse CNPJ (empresa muito nova, ou alfanumérico ainda não indexado).
    if (res.status === 404 || res.status === 400) return { status: 'not_found' };
    if (!res.ok) return { status: 'error' };
    const data = await res.json();
    if (!data.razao_social) return { status: 'not_found' };
    return {
      status: 'found',
      razaoSocial: data.razao_social,
      situacao: data.descricao_situacao_cadastral || '',
    };
  } catch (err) {
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

/* ---- Telefone, gclid, CRM ---- */
function leadMaskPhone(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  const len = digits.length;
  if (len === 0) return '';
  if (len <= 2) return `(${digits}`;
  if (len <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function leadIsValidPhone(value) {
  return String(value).replace(/\D/g, '').length === 11;
}

const LEAD_GCLID_KEY = 'ps_gclid';
const LEAD_GCLID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// Guarda o gclid da URL de entrada (anúncio) para que ele sobreviva à navegação
// até o envio do formulário em outra página.
function initGclidCapture() {
  try {
    const gclid = new URLSearchParams(window.location.search).get('gclid');
    if (gclid) localStorage.setItem(LEAD_GCLID_KEY, JSON.stringify({ v: gclid, t: Date.now() }));
  } catch (err) { /* storage indisponível (modo privado etc.) */ }
}

function getLeadGclid() {
  try {
    const raw = localStorage.getItem(LEAD_GCLID_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (!stored.v || Date.now() - stored.t > LEAD_GCLID_TTL_MS) return null;
    return stored.v;
  } catch (err) {
    return null;
  }
}

// Avisa o CRM comercial. Roda no navegador (o CRM só aceita as origens listadas
// em LEADS_SITE_ORIGENS) e NUNCA trava o contato: qualquer falha/demora devolve
// null e o fluxo segue para o WhatsApp sem protocolo.
async function registerLeadInCrm(lead) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LEAD_FORM_CONFIG.crmTimeoutMs);
  try {
    const res = await fetch(LEAD_FORM_CONFIG.crmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: lead.nome,
        telefone: lead.telefone,
        empresa: lead.empresa ? lead.empresa.slice(0, 160) : undefined,
        consentimento_texto: LEAD_CONSENT_TEXT,
        gclid: lead.gclid || undefined,
        pagina_origem: lead.pagina,
        referrer: document.referrer || undefined,
        website: lead.honeypot,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok && data.protocolo ? String(data.protocolo) : null;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function leadServiceLabel(value) {
  const found = LEAD_MODAL_SERVICES.find((s) => s.value === value);
  return found ? found.label : value;
}

function leadNormalize(value) {
  return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function leadEscape(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/* ---- Estado do popup ---- */
const leadState = {
  touched: {},
  submitting: false,
  lookup: null,      // { cnpj, result } — resultado amarrado ao CNPJ consultado
  lookupAbort: null,
};

function leadErrors(values) {
  const errors = {};
  if (values.nome.trim().length < 2) errors.nome = 'Informe seu nome completo.';
  if (!leadIsValidPhone(values.whatsapp)) errors.whatsapp = 'Informe um WhatsApp válido com DDD.';
  if (values.cidade.trim().length < 2) errors.cidade = 'Informe sua cidade.';
  if (!values.servico) errors.servico = 'Selecione o serviço desejado.';
  // CNPJ obrigatório (barra currículos/contatos de pessoa física) e com DV válido.
  if (!values.cnpj.trim()) errors.cnpj = 'Informe o CNPJ da empresa.';
  else if (!leadIsValidCnpj(values.cnpj)) errors.cnpj = 'CNPJ inválido. Confira os números.';
  return errors;
}

function leadValues(form) {
  return {
    nome: form.querySelector('#lead-nome').value,
    whatsapp: form.querySelector('#lead-whatsapp').value,
    cidade: form.querySelector('#lead-cidade').value,
    servico: form.querySelector('#lead-servico').value,
    cnpj: form.querySelector('#lead-cnpj').value,
    honeypot: form.querySelector('#lead-website').value,
  };
}

const LEAD_FIELDS = ['nome', 'whatsapp', 'cidade', 'servico', 'cnpj'];

function renderLeadErrors(form) {
  const values = leadValues(form);
  const errors = leadErrors(values);
  LEAD_FIELDS.forEach((field) => {
    const input = form.querySelector(`#lead-${field}`);
    const errorEl = form.querySelector(`#lead-${field}-error`);
    // O CNPJ também mostra o erro assim que fecha 14 caracteres, mesmo antes do blur.
    const show = !!errors[field] && (leadState.touched[field] || (field === 'cnpj' && leadCleanCnpj(values.cnpj).length === 14));
    errorEl.textContent = show ? errors[field] : '';
    errorEl.hidden = !show;
    input.classList.toggle('is-invalid', show);
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
  });
  return errors;
}

function renderLeadCnpjStatus(form) {
  const statusEl = form.querySelector('#lead-cnpj-status');
  const cnpjRaw = form.querySelector('#lead-cnpj').value;
  statusEl.textContent = '';
  if (!leadIsValidCnpj(cnpjRaw)) return;

  const cnpj = leadCleanCnpj(cnpjRaw);
  const done = leadState.lookup && leadState.lookup.cnpj === cnpj ? leadState.lookup.result : null;

  const line = (className, text) => {
    const p = document.createElement('p');
    p.className = className;
    p.textContent = text;
    statusEl.appendChild(p);
  };

  if (!done) {
    line('lead-cnpj-line is-muted', 'Consultando CNPJ na Receita Federal...');
  } else if (done.status === 'found') {
    line('lead-cnpj-line is-found', '✓ ' + done.razaoSocial);
    if (done.situacao && done.situacao.toUpperCase() !== 'ATIVA') {
      line('lead-cnpj-line is-warn', `Situação cadastral: ${done.situacao.toLowerCase()}. Confira se o CNPJ está correto.`);
    }
  } else if (done.status === 'not_found') {
    line('lead-cnpj-line is-muted', 'Não encontramos esse CNPJ na base da Receita, mas você pode enviar normalmente.');
  }
}

function startLeadCnpjLookup(form) {
  const cnpjRaw = form.querySelector('#lead-cnpj').value;
  if (leadState.lookupAbort) leadState.lookupAbort.abort();
  leadState.lookupAbort = null;
  renderLeadCnpjStatus(form);
  if (!leadIsValidCnpj(cnpjRaw)) return;

  const cnpj = leadCleanCnpj(cnpjRaw);
  if (leadState.lookup && leadState.lookup.cnpj === cnpj) return;

  const controller = new AbortController();
  leadState.lookupAbort = controller;
  leadLookupCnpj(cnpj, controller.signal).then((result) => {
    if (controller.signal.aborted) return;
    leadState.lookup = { cnpj, result };
    renderLeadCnpjStatus(form);
  });
}

function setupLeadCityCombobox(form) {
  const input = form.querySelector('#lead-cidade');
  const list = form.querySelector('#lead-cidade-list');
  let activeIndex = -1;
  let suggestions = [];

  function render() {
    const query = leadNormalize(input.value);
    suggestions = (query ? LEAD_CITY_NAMES.filter((name) => leadNormalize(name).includes(query)) : LEAD_CITY_NAMES).slice(0, 8);
    list.innerHTML = suggestions
      .map((name, i) => `<li role="option" id="lead-cidade-opt-${i}" data-index="${i}" aria-selected="${i === activeIndex}" class="lead-combo-option${i === activeIndex ? ' is-active' : ''}">${leadEscape(name)}</li>`)
      .join('');
  }

  function open() {
    render();
    const isOpen = suggestions.length > 0;
    list.hidden = !isOpen;
    input.setAttribute('aria-expanded', String(isOpen));
  }

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function select(name) {
    input.value = name;
    close();
    leadState.touched.cidade = true;
    renderLeadErrors(form);
  }

  input.addEventListener('input', () => { activeIndex = -1; open(); renderLeadErrors(form); });
  input.addEventListener('focus', open);
  input.addEventListener('blur', () => {
    // Atraso para o clique na sugestão (mousedown) registrar antes do fechamento.
    setTimeout(close, 120);
    leadState.touched.cidade = true;
    renderLeadErrors(form);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') open();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        select(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      // Fecha só a lista, sem fechar o popup inteiro.
      e.stopPropagation();
      close();
    }
  });
  list.addEventListener('mousedown', (e) => {
    const option = e.target.closest('.lead-combo-option');
    if (!option) return;
    e.preventDefault();
    select(suggestions[Number(option.dataset.index)]);
  });
}

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
      <form id="lead-modal-form" novalidate>
        <div class="lead-modal-step is-active" data-step="1">
          <h3 id="lead-modal-title" class="lead-modal-title">Formulário de Contato</h3>
          <p class="lead-modal-subtitle">Retornamos em até 2h úteis. Sem compromisso.</p>

          <div class="form-group">
            <label class="form-label" for="lead-nome">Nome</label>
            <input class="form-input" type="text" id="lead-nome" name="nome" autocomplete="name" placeholder="Seu nome completo" aria-describedby="lead-nome-error">
            <p class="lead-field-error" id="lead-nome-error" hidden></p>
          </div>

          <div class="form-group">
            <label class="form-label" for="lead-whatsapp">WhatsApp</label>
            <input class="form-input" type="tel" id="lead-whatsapp" name="whatsapp" inputmode="numeric" autocomplete="tel" placeholder="(00) 00000-0000" aria-describedby="lead-whatsapp-error">
            <p class="lead-field-error" id="lead-whatsapp-error" hidden></p>
          </div>

          <div class="form-group lead-combo">
            <label class="form-label" for="lead-cidade">Cidade</label>
            <input class="form-input" type="text" id="lead-cidade" name="cidade" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="lead-cidade-list" autocomplete="off" placeholder="Digite sua cidade" aria-describedby="lead-cidade-error">
            <ul class="lead-combo-list" id="lead-cidade-list" role="listbox" hidden></ul>
            <p class="lead-field-error" id="lead-cidade-error" hidden></p>
          </div>

          <div class="form-group">
            <label class="form-label" for="lead-servico">Serviço</label>
            <select class="form-select" id="lead-servico" name="servico" aria-describedby="lead-servico-error">
              <option value="" disabled selected>Selecione o serviço</option>
              ${LEAD_MODAL_SERVICES.map((s) => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
            <p class="lead-field-error" id="lead-servico-error" hidden></p>
          </div>

          <div class="form-group">
            <label class="form-label" for="lead-cnpj">CNPJ da empresa</label>
            <input class="form-input" type="text" id="lead-cnpj" name="cnpj" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="18" placeholder="00.000.000/0000-00" aria-describedby="lead-cnpj-error lead-cnpj-status">
            <div class="lead-cnpj-status" id="lead-cnpj-status" aria-live="polite"></div>
            <p class="lead-field-error" id="lead-cnpj-error" hidden></p>
          </div>

          <div class="lead-hp" aria-hidden="true">
            <label for="lead-website">Não preencha este campo</label>
            <input type="text" id="lead-website" name="website" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="btn btn-gold form-submit">Solicitar cotação</button>
          <p class="lead-modal-consent">${LEAD_CONSENT_TEXT}</p>
        </div>

        <div class="lead-modal-step" data-step="2">
          <div class="lead-modal-loading" role="status">
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

  form.querySelector('#lead-whatsapp').addEventListener('input', (e) => {
    e.target.value = leadMaskPhone(e.target.value);
    renderLeadErrors(form);
  });
  form.querySelector('#lead-cnpj').addEventListener('input', (e) => {
    e.target.value = leadMaskCnpj(e.target.value);
    startLeadCnpjLookup(form);
    renderLeadErrors(form);
  });
  ['nome', 'whatsapp', 'servico', 'cnpj'].forEach((field) => {
    const input = form.querySelector(`#lead-${field}`);
    input.addEventListener('blur', () => { leadState.touched[field] = true; renderLeadErrors(form); });
    input.addEventListener('input', () => renderLeadErrors(form));
  });
  form.querySelector('#lead-servico').addEventListener('change', () => renderLeadErrors(form));

  setupLeadCityCombobox(form);
  setupLeadFocusTrap(overlay);

  form.addEventListener('submit', handleLeadModalSubmit);
}

// Mantém o Tab dentro do popup enquanto ele está aberto.
function setupLeadFocusTrap(overlay) {
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const active = overlay.querySelector('.lead-modal-step.is-active');
    const focusables = [overlay.querySelector('.lead-modal-close'), ...(active ? active.querySelectorAll('input:not([tabindex="-1"]), select, button') : [])]
      .filter((el) => el && !el.disabled);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function goToLeadStep(step) {
  const overlay = document.getElementById('lead-modal-overlay');
  if (!overlay) return;
  overlay.querySelectorAll('.lead-modal-step').forEach((el) => {
    el.classList.toggle('is-active', Number(el.dataset.step) === step);
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
  if (!overlay || leadState.submitting) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    const form = overlay.querySelector('#lead-modal-form');
    if (form) {
      form.reset();
      leadState.touched = {};
      leadState.lookup = null;
      if (leadState.lookupAbort) leadState.lookupAbort.abort();
      leadState.lookupAbort = null;
      renderLeadErrors(form);
      renderLeadCnpjStatus(form);
    }
    goToLeadStep(1);
  }, 300);
}

async function handleLeadModalSubmit(e) {
  e.preventDefault();
  if (leadState.submitting) return;
  const form = e.target;

  LEAD_FIELDS.forEach((field) => { leadState.touched[field] = true; });
  const errors = renderLeadErrors(form);
  const firstInvalid = LEAD_FIELDS.find((field) => errors[field]);
  if (firstInvalid) {
    form.querySelector(`#lead-${firstInvalid}`).focus();
    return;
  }

  const values = leadValues(form);

  // Honeypot preenchido = bot: responde como se tivesse dado certo, sem enviar nada.
  if (values.honeypot.trim()) {
    closeLeadModal();
    return;
  }

  // Abre a aba do WhatsApp já dentro do clique do usuário, para o navegador
  // não bloquear o popup quando ela for navegada depois das chamadas assíncronas.
  const waWindow = window.open('', '_blank');

  leadState.submitting = true;
  goToLeadStep(2);

  const nome = values.nome.trim();
  const telefone = values.whatsapp.replace(/\D/g, '');
  const cidade = values.cidade.trim();
  const servico = leadServiceLabel(values.servico);
  const cnpj = leadCleanCnpj(values.cnpj);
  const lookup = leadState.lookup && leadState.lookup.cnpj === cnpj ? leadState.lookup.result : null;
  const razaoSocial = lookup && lookup.status === 'found' ? lookup.razaoSocial : '';
  const gclid = getLeadGclid();
  const pagina = window.location.pathname;

  // E-mail de aviso (Web3Forms) em paralelo ao CRM; falha em qualquer um não bloqueia o contato.
  const data = new FormData();
  data.append('access_key', LEAD_FORM_CONFIG.accessKey);
  data.append('subject', 'Novo lead — Site PS Proteção');
  data.append('from_name', 'Site PS Proteção');
  data.append('nome', nome);
  data.append('whatsapp', values.whatsapp);
  data.append('cidade', cidade);
  data.append('servico', servico);
  data.append('cnpj', values.cnpj);
  if (razaoSocial) data.append('razao_social', razaoSocial);
  data.append('pagina', pagina);
  if (gclid) data.append('gclid', gclid);

  const sendEmail = fetch('https://api.web3forms.com/submit', { method: 'POST', body: data }).catch(() => null);
  const sendCrm = registerLeadInCrm({ nome, telefone, empresa: razaoSocial, gclid, pagina, honeypot: values.honeypot });
  const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
  const [, protocol] = await Promise.all([sendEmail, sendCrm, minDelay]);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit_lead',
    form_location: 'popup',
    lead_name: nome,
    lead_whatsapp: values.whatsapp,
    lead_city: cidade,
    lead_cnpj: values.cnpj,
    lead_services: servico,
    lead_protocol: protocol || null,
    gclid: gclid || null,
  });

  // O protocolo liga a conversa do WhatsApp ao lead que já está no CRM.
  const base = `Olá, me chamo ${nome} e preciso de uma cotação de ${servico} em ${cidade}. Obrigado(a)!`;
  const waText = protocol ? `${base} (Protocolo ${protocol})` : base;
  const waUrl = `https://wa.me/${LEAD_FORM_CONFIG.whatsapp}?text=${encodeURIComponent(waText)}`;

  // Dá tempo do GTM processar o evento antes de a página perder o foco.
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (waWindow) {
    waWindow.location.href = waUrl;
  } else {
    window.open(waUrl, '_blank', 'noopener');
  }

  leadState.submitting = false;
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
