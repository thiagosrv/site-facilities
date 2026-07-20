// Gerador de páginas programáticas de SEO — estrutura por pasta/cidade, URLs limpas via index.html:
//   cidade:   /{cidade}/                              (nova página-índice por cidade)
//   hub:      /{cidade}/{servico}/                     (ex.: /americana/portaria)
//   nichada:  /{cidade}/{variacao}/{nicho}/            (ex.: /americana/portaria-condominial/condominios)
// Uso: node scripts/generate-servicos.js            -> gera piloto (Americana: home + 2 hub + 64 nichadas)
//      node scripts/generate-servicos.js --all       -> gera tudo (60 cidades x (1 + 2 + 64) = 4.020 páginas)
'use strict';

const fs = require('fs');
const path = require('path');
const { CITIES } = require('./data/cities');
const { SERVICES } = require('./data/services');
const { pickIntent, pickTagline } = require('./data/seo-intents');
const { NICHOS } = require('./data/nichos');
const { SERVICE_VARIANTS } = require('./data/service-variants');
const { FAQ_GENERICO } = require('./data/faq-generico');

const SITE = 'https://psprotecao.com.br';
const ROOT_DIR = path.join(__dirname, '..');

const TEL_DISPLAY = '(19) 3478-7799';
const TEL_HREF = 'tel:+551934787799';
// WhatsApp exclusivo do SEO Programático (organic) — diferente do (19) 98289-2037 usado na Home/site comum (ads)
const WPP_DISPLAY = '(19) 97821-0246';
const WPP_HREF = 'https://wa.me/5519978210246';
const EMAIL = 'empresas@psprotecao.com.br';
const EMAIL_HREF = `mailto:${EMAIL}`;
const GOOGLE_REVIEW_URL = 'https://share.google/ooNJXAY0U2mRvWnU1';

// Depoimentos genéricos por cargo — nome curto (sem empresa vinculada), sem nota/schema associado.
// foto: null até o cliente enviar as fotos reais; enquanto isso exibimos um avatar com iniciais.
const TESTEMUNHOS = [
  {
    nome: 'Fernanda M.',
    cargo: 'RH',
    foto: null,
    texto: 'A terceirização com a PS Proteção trouxe mais previsibilidade para a nossa operação: a equipe chega treinada, os postos não ficam descobertos em caso de falta e o suporte é rápido sempre que precisamos ajustar algo na escala.',
  },
  {
    nome: 'Carlos R.',
    cargo: 'Segurança do Trabalho',
    foto: null,
    texto: 'O que mais valorizo é o cumprimento dos procedimentos operacionais e o cuidado com uniformes e EPIs. Isso facilita bastante o nosso trabalho de acompanhamento e auditoria interna.',
  },
  {
    nome: 'Rodrigo A.',
    cargo: 'Supervisor',
    foto: null,
    texto: 'Desde que passamos a trabalhar com a PS Proteção, a comunicação melhorou bastante. Qualquer ajuste na escala ou reposição de profissional é resolvido com agilidade, sem burocracia.',
  },
];
function iniciais(nome) {
  return nome.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function fill(tpl, city) {
  return tpl.replace(/\{cidade\}/g, city.name);
}
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Caminhos/URLs (estrutura por pasta — todos os links são absolutos a partir da raiz do site) ──
function cityPath(city) {
  return `/${city.slug}`;
}
function cityUrl(city) {
  return `${SITE}${cityPath(city)}`;
}
function hubPath(service, city) {
  return `/${city.slug}/${service.slug}`;
}
function hubUrl(service, city) {
  return `${SITE}${hubPath(service, city)}`;
}
function nichoPath(variacao, nicho, city) {
  return `/${city.slug}/${variacao.slug}/${nicho.slug}`;
}
function nichoUrl(variacao, nicho, city) {
  return `${SITE}${nichoPath(variacao, nicho, city)}`;
}

// Links institucionais reaproveitados nos blocos "outras páginas" (serviço, nicho e cidade)
function coreLinks() {
  return [
    ['/index.html', 'PS Proteção — Home'],
    ['/servicos.html', 'Serviços e Soluções'],
    ['/segmentos.html', 'Segmentos Atendidos'],
    ['/sobre.html', 'Quem Somos'],
    ['/contato.html', 'Entre em Contato'],
    ['/blog/', 'Blog PS Proteção'],
  ];
}

// ── Motor de composição de conteúdo por nicho + variação ──────────
// Cada posição (p1-p4) tem 3 variantes de frase, selecionadas por city.index % 3
// (mesma mecânica de SERVICES.*.paragraphs), interpolando o ângulo da variação
// e a dor/compliance/exemplo do nicho — texto genuinamente distinto por combinação.
function buildNichoParagraphs(variacao, nicho) {
  const v = variacao.nome.toLowerCase();
  const n = nicho.nome.toLowerCase();
  return {
    p1: [
      `A PS Proteção oferece ${v} para ${n} em {cidade}, com equipe treinada e mais de 28 anos de experiência em Facilities na Região Metropolitana de Campinas.`,
      `Para ${n} em {cidade}, a PS Proteção estrutura operações de ${v} com processo definido, profissionais capacitados e atenção às particularidades desse tipo de ambiente.`,
      `${nicho.nome} em {cidade} contam com a PS Proteção para terceirizar ${v}, com equipe dimensionada especificamente para esse tipo de operação.`,
    ],
    p2: [
      `A operação de ${v} para ${n} lida com ${nicho.dor}. Por isso, trabalhamos com ${nicho.compliance}.`,
      `Sabemos que ${n} enfrentam ${nicho.dor} — nossa operação de ${v} em {cidade} é estruturada com ${nicho.compliance}.`,
      `Cada posto de ${v} para ${n} em {cidade} é implantado considerando ${nicho.dor}, com ${nicho.compliance}.`,
    ],
    p3: [
      `O escopo de ${v} contempla ${variacao.angulo}, cobrindo áreas como ${nicho.exemplo} em {cidade}.`,
      `Em {cidade}, ${v} para ${n} envolve ${variacao.angulo}, com atenção a ${nicho.exemplo}.`,
      `Nossa abordagem de ${v} combina ${variacao.angulo} com o cuidado necessário em ${nicho.exemplo}, típicos de ${n} em {cidade}.`,
    ],
    p4: [
      `Diferenciais da PS Proteção: supervisão ativa, backup de profissionais, relatórios de acompanhamento e mais de 28 anos de experiência no setor de Facilities — agora aplicados a ${n} em {cidade}.`,
      `Trabalhamos com contrato claro, equipe treinada e SLA definido — para que ${v} para ${n} em {cidade} seja sinônimo de tranquilidade para sua operação.`,
      `Nosso compromisso é com a continuidade da operação: cobertura de faltas, supervisão constante e melhoria contínua dos processos de ${v} para ${n}.`,
    ],
  };
}

// Evita redundância léxica quando a variação já carrega o mesmo radical do nicho
// (ex.: "Portaria Condominial" + "Condomínios" → apenas "Portaria Condominial",
// sem repetir "para Condomínios"). Só se aplica a esse par específico.
const REDUNDANT_VARIACAO_NICHO = new Set(['portaria-condominial:condominios']);
function nichoLabel(variacao, nicho) {
  if (REDUNDANT_VARIACAO_NICHO.has(`${variacao.slug}:${nicho.slug}`)) return variacao.nome;
  return `${variacao.nome} para ${nicho.nome}`;
}

// Monta um "service" sintético (mesmo formato de SERVICES.limpeza/portaria) a partir de
// uma variação + nicho, para reaproveitar heroServico/implantacaoSection/faqSection/etc sem alteração.
function buildNichoService(variacao, nicho, variantIndex, nichoIndex) {
  const parent = SERVICES[variacao.parent];
  return {
    nome: nichoLabel(variacao, nicho),
    nomeCurto: variacao.nomeCurto,
    icon: variacao.icon,
    image: parent.image,
    imageAlt: parent.imageAlt,
    serviceOffset: variantIndex * NICHOS.length + nichoIndex,
    schemaDescription: `Serviço de ${variacao.nome.toLowerCase()} para ${nicho.nome.toLowerCase()} (${nicho.exemplo}), com ${variacao.angulo}. ${cap(nicho.compliance)}.`,
    paragraphs: buildNichoParagraphs(variacao, nicho),
    implantacaoSubtitle: `A PS Proteção presta serviços de ${variacao.nome.toLowerCase()} para ${nicho.nome.toLowerCase()} em {cidade} com SLA, Procedimentos Operacionais e Implantação Profissional — considerando ${nicho.dor}, do diagnóstico à supervisão contínua da equipe.`,
    faq: [...FAQ_GENERICO, ...nicho.faqExtra, ...variacao.faqExtra],
    variacao,
    nicho,
  };
}

function buildH1(city, service) {
  const intent = pickIntent(city.index, service.serviceOffset);
  return `${intent} ${service.nome} em ${city.name} - SP`;
}
function buildTagline(city, service) {
  return pickTagline(city.index, service.serviceOffset);
}

function nearbyCities(city, count) {
  const sameRegion = CITIES.filter((c) => c.region === city.region && c.slug !== city.slug);
  const others = CITIES.filter((c) => c.region !== city.region && c.slug !== city.slug);
  return [...sameRegion, ...others].slice(0, count);
}

// ── FAQ HTML + JSON-LD ──────────────────────────────────────────
function faqHtml(service, city) {
  return service.faq
    .map(([q, a], i) => `
        <details class="faq-item"${i === 0 ? ' open' : ''}>
          <summary><span>${fill(q, city)}</span><span class="faq-icon"><i data-lucide="plus" aria-hidden="true"></i></span></summary>
          <div class="faq-answer">${fill(a, city)}</div>
        </details>`)
    .join('');
}
function faqSchema(service, city) {
  return service.faq.map(([q, a]) => ({
    '@type': 'Question',
    name: fill(q, city),
    acceptedAnswer: { '@type': 'Answer', text: fill(a, city) },
  }));
}

// ── Schema completo (Americana) — reaproveitado do index.html ──
function localBusinessNode() {
  return {
    '@type': 'LocalBusiness',
    '@id': `${SITE}/#business`,
    name: 'PS Proteção — Serviços e Facilities',
    alternateName: 'PS Proteção',
    description: 'Empresa especializada em Facilities com mais de 28 anos de experiência. Oferece portaria e controle de acesso, limpeza e conservação, zeladoria, recepção, auxiliar administrativo e auxiliar contábil para empresas na Região Metropolitana de Campinas.',
    url: SITE,
    logo: `${SITE}/logo-servicos.png`,
    image: `${SITE}/hero.webp`,
    telephone: ['+551934787799', '+5519997818615'],
    email: EMAIL,
    foundingDate: '1998',
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 50, maxValue: 500 },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua São Gabriel, 1623 — Vila Belvedere',
      addressLocality: 'Americana',
      addressRegion: 'SP',
      postalCode: '13473-000',
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: -22.7301816, longitude: -47.30249 },
    hasMap: 'https://maps.app.goo.gl/BosmPPYoMQjiKP4f9',
    areaServed: [
      'Americana', 'Campinas', 'Sumaré', 'Hortolândia', 'Paulínia',
      'Valinhos', 'Vinhedo', 'Indaiatuba', "Santa Bárbara d'Oeste",
      'Nova Odessa', 'Limeira', 'Piracicaba', 'Jundiaí',
      'Região Metropolitana de Campinas',
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: -22.7301816, longitude: -47.30249 },
      geoRadius: '100000',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de Facilities',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Portaria e Controle de Acesso', description: 'Profissionais treinados para gestão de acesso, controle de visitantes e procedimentos operacionais padronizados.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Limpeza e Conservação', description: 'Equipes especializadas para manter ambientes impecáveis com rotinas de limpeza definidas e produtos adequados.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Zeladoria', description: 'Suporte completo de manutenção preventiva, organização de dependências e conservação do patrimônio.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Recepção', description: 'Recepcionistas treinados para atender visitantes com excelência e representar a imagem da empresa.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Auxiliar Administrativo', description: 'Profissionais de suporte para organização de documentos e apoio à gestão operacional.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Auxiliar Contábil', description: 'Suporte nas rotinas contábeis e financeiras, lançamentos e processos de controle.' } },
      ],
    },
    sameAs: [
      'https://share.google/cIgaj2GGRqZtFddxp',
      'https://share.google/T93Dj9U0KXU4r2ZRx',
      'https://maps.app.goo.gl/BosmPPYoMQjiKP4f9',
      'https://www.instagram.com/protecao_seguranca/',
      'https://web.facebook.com/protecaoeseguranca',
      'https://www.linkedin.com/company/ps-protecao',
    ],
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '12:00' },
    ],
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+5519982892037', contactType: 'sales', availableLanguage: 'Portuguese', areaServed: 'BR' },
      { '@type': 'ContactPoint', telephone: '+5519997818615', contactType: 'customer support', availableLanguage: 'Portuguese', areaServed: 'BR' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '71',
      bestRating: '5',
      worstRating: '1',
    },
  };
}
function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: 'PS Proteção — Serviços e Facilities',
    description: 'Soluções completas em Facilities para empresas na Região Metropolitana de Campinas.',
    publisher: { '@id': `${SITE}/#business` },
    inLanguage: 'pt-BR',
  };
}

function buildSchema(service, city, h1, url, includeBusiness) {
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Serviços e Soluções', item: `${SITE}/servicos.html` },
      { '@type': 'ListItem', position: 3, name: city.name, item: cityUrl(city) },
      { '@type': 'ListItem', position: 4, name: h1, item: url },
    ],
  };
  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqSchema(service, city),
  };
  const serviceNode = {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: h1,
    serviceType: service.nome,
    description: service.schemaDescription,
    areaServed: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: 'São Paulo' } },
    provider: { '@id': `${SITE}/#business` },
    url,
  };

  const graph = includeBusiness
    ? [localBusinessNode(), websiteNode(), serviceNode, faqPage, breadcrumb]
    : [serviceNode, faqPage, breadcrumb];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

// Schema da página-índice de cidade (sem nó de Service — agrega múltiplos serviços)
function buildCitySchema(city, h1, url, includeBusiness) {
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: h1, item: url },
    ],
  };
  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: FAQ_GENERICO.map(([q, a]) => ({
      '@type': 'Question',
      name: fill(q, city),
      acceptedAnswer: { '@type': 'Answer', text: fill(a, city) },
    })),
  };
  const graph = includeBusiness ? [localBusinessNode(), websiteNode(), faqPage, breadcrumb] : [faqPage, breadcrumb];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

// ── Blocos HTML reutilizáveis ───────────────────────────────────
// Ícones sociais — mesmo conjunto/SVGs da Home (index.html footer-social), tamanho parametrizável.
function socialIconsHTML(size) {
  return `
      <a href="${WPP_HREF}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>
      <a href="https://www.instagram.com/protecao_seguranca/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
      <a href="https://web.facebook.com/protecaoeseguranca" target="_blank" rel="noopener" aria-label="Facebook"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
      <a href="https://www.linkedin.com/company/ps-protecao" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
      <a href="${GOOGLE_REVIEW_URL}" target="_blank" rel="noopener" aria-label="Google Meu Negócio"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></a>`;
}

function microHeader(city) {
  return `
<div class="micro-header">
  <div class="container">
    <span class="micro-header-city"><i data-lucide="map-pin" aria-hidden="true"></i>${city.name} - São Paulo</span>
    <div class="micro-header-links">
      <a href="${TEL_HREF}"><i data-lucide="phone" aria-hidden="true"></i>${TEL_DISPLAY}</a>
      <a href="${WPP_HREF}" target="_blank" rel="noopener"><i data-lucide="message-circle" aria-hidden="true"></i>${WPP_DISPLAY}</a>
      <a href="${EMAIL_HREF}"><i data-lucide="mail" aria-hidden="true"></i>${EMAIL}</a>
    </div>
    <div class="micro-header-social">${socialIconsHTML(12)}
    </div>
  </div>
</div>`;
}

function siteHeader() {
  return `
<header id="header" class="header header-servico">
  <nav class="nav container">
    <a href="/index.html" class="nav-logo">
      <img src="/logo-servicos.webp" alt="PS Proteção" class="logo-img">
    </a>
    <ul class="nav-menu" id="nav-menu">
      <li><a href="/index.html"       class="nav-link">Home</a></li>
      <li class="nav-item has-submenu">
        <a href="/servicos.html" class="nav-link active">Serviços e Soluções</a>
        <button type="button" class="nav-submenu-toggle" aria-expanded="false" aria-label="Abrir submenu de Segmentos">
          <i data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
        <ul class="nav-submenu">
          <li><a href="/segmentos.html" class="nav-sublink">Segmentos Atendidos</a></li>
        </ul>
      </li>
      <li><a href="/sobre.html"       class="nav-link">Quem Somos</a></li>
      <li><a href="/blog/"            class="nav-link">Blog</a></li>
      <li><a href="/contato.html"     class="nav-link">Entre em Contato</a></li>
      <li><a href="/canal-etica.html" class="nav-link">Canal de Ética</a></li>
    </ul>
    <div class="nav-actions">
      <a href="https://protecaotalentos.online" target="_blank" rel="noopener" class="btn btn-outline-gold">
        <i data-lucide="user-plus" aria-hidden="true"></i>Trabalhe Conosco
      </a>
      <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp">
        <i data-lucide="message-circle" aria-hidden="true"></i>Solicitar Orçamento
      </a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menu">
      <i data-lucide="menu" aria-hidden="true"></i>
    </button>
  </nav>
</header>`;
}

// Bloco de números institucionais (3.000+ colaboradores, 1.000+ clientes, 28+ anos, 100% supervisão),
// reaproveitado sem alteração do index.html — exibido logo abaixo da hero em toda página do site.
function statsSection() {
  return `
<section class="stats" id="numeros">
  <div class="container">
    <div class="stats-grid">

      <div class="stat-card" data-value="3000" data-suffix="+">
        <div class="stat-icon"><i data-lucide="users-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">3.000</span><span>+</span></div>
          <p class="stat-label">Colaboradores Treinados por Nós</p>
        </div>
      </div>

      <div class="stat-card" data-value="1000" data-suffix="+">
        <div class="stat-icon"><i data-lucide="building-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">1.000</span><span>+</span></div>
          <p class="stat-label">Clientes Atendidos</p>
        </div>
      </div>

      <div class="stat-card stat-card-gold" data-value="28" data-suffix="+">
        <div class="stat-icon"><i data-lucide="calendar-check-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">28</span><span>+</span></div>
          <p class="stat-label">Anos de Experiência no Mercado</p>
        </div>
      </div>

      <div class="stat-card" data-value="100" data-suffix="%">
        <div class="stat-icon"><i data-lucide="shield-check" aria-hidden="true"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">100</span><span>%</span></div>
          <p class="stat-label">Supervisão Ativa com Relatórios</p>
        </div>
      </div>

    </div>
  </div>
</section>`;
}

function sedeSection() {
  return `
<section class="about about-sede" id="a-ps-protecao">
  <div class="container">
    <div class="about-grid">

      <div class="about-image-side">
        <div class="about-image-wrap">
          <img src="/fachada.webp" alt="Fachada da sede da PS Proteção, em Americana - SP" class="about-img sede-img" width="800" height="600" loading="lazy">
          <div class="about-image-badge badge-sede">
            <i data-lucide="map-pin" aria-hidden="true"></i>
            <div>
              <strong>Americana</strong>
              <span>SP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="about-content">
        <span class="section-tag">A PS Proteção</span>
        <h2 class="about-title">
          Conheça a <span>sede da PS Proteção</span>
        </h2>
        <p class="about-text">
          A PS Proteção está sediada na Rua São Gabriel, 1623 — Vila Belvedere, Americana - SP,
          desde <strong>1998</strong>. Não somos um intermediário: temos estrutura própria, viaturas
          identificadas e equipe fixa para atender toda a Região Metropolitana de Campinas.
        </p>
        <p class="about-text">
          Ao longo de mais de 28 anos, construímos processos próprios de recrutamento, treinamento e
          supervisão — o que nos permite colocar equipe qualificada em operação rapidamente, com
          acompanhamento em campo e relatórios periódicos.
        </p>

        <div class="about-values">
          <div class="value-item"><i data-lucide="check-circle-2"></i><span>Sede própria em Americana - SP, desde 1998</span></div>
          <div class="value-item"><i data-lucide="check-circle-2"></i><span>Viaturas e equipe identificadas com a marca PS Proteção</span></div>
          <div class="value-item"><i data-lucide="check-circle-2"></i><span>Mais de 1.000 clientes atendidos na região</span></div>
        </div>

        <a href="/sobre.html" class="btn btn-primary-blue">
          Conheça nossa história
          <i data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

    </div>

    <div class="selos-grid">
      <div class="selo-card"><div class="selo-icon"><i data-lucide="eye" aria-hidden="true"></i></div><span>Supervisão Ativa</span></div>
      <div class="selo-card"><div class="selo-icon"><i data-lucide="hard-hat" aria-hidden="true"></i></div><span>EPIs e Uniformização</span></div>
      <div class="selo-card"><div class="selo-icon"><i data-lucide="calendar-clock" aria-hidden="true"></i></div><span>Cobertura de Férias e Afastamentos</span></div>
      <div class="selo-card"><div class="selo-icon"><i data-lucide="clipboard-check" aria-hidden="true"></i></div><span>Alinhamento com NRs</span></div>
      <div class="selo-card"><div class="selo-icon"><i data-lucide="shield-check" aria-hidden="true"></i></div><span>Conformidade com CIPA</span></div>
    </div>

  </div>
</section>`;
}

function heroServico(service, city, h1, tagline) {
  const p = service.paragraphs;
  const v = city.index % 3;
  return `
<section class="hero-servico">
  <div class="container">
    <div class="page-breadcrumb">
      <a href="/index.html">Home</a>
      <i data-lucide="chevron-right" aria-hidden="true"></i>
      <a href="/servicos.html">Serviços</a>
      <i data-lucide="chevron-right" aria-hidden="true"></i>
      <a href="${cityPath(city)}">${city.name}</a>
      <i data-lucide="chevron-right" aria-hidden="true"></i>
      <span>${service.nomeCurto} em ${city.name}</span>
    </div>
    <div class="hero-servico-grid">
      <div class="hero-servico-text">
        <h1>${h1}</h1>
        <span class="hero-servico-tagline">${tagline}</span>
        <p>${fill(p.p1[v], city)}</p>
        <p>${fill(p.p2[v], city)}</p>
        <p>${fill(p.p3[v], city)}</p>
        <p>${fill(p.p4[v], city)}</p>
        <p class="hero-servico-cta-line">Gostaria de um orçamento ou entrar em contato sobre ${service.nomeCurto.toLowerCase()} terceirizada em ${city.name} - SP? Fale conosco pelo telefone ${TEL_DISPLAY} ou em nosso WhatsApp <a href="${WPP_HREF}" target="_blank" rel="noopener">clicando aqui</a>.</p>
        <div class="hero-servico-actions">
          <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp btn-lg">
            <i data-lucide="message-circle" aria-hidden="true"></i>Solicitar Orçamento
          </a>
          <a href="${EMAIL_HREF}" class="btn btn-outline-white btn-lg">
            <i data-lucide="mail" aria-hidden="true"></i>Enviar E-mail
          </a>
        </div>
      </div>
      <div class="hero-servico-img-frame">
        <img src="/${service.image}" alt="${service.imageAlt} em ${city.name}" width="800" height="1000" loading="eager">
        <span class="hero-servico-badge"><i data-lucide="badge-check" aria-hidden="true"></i>${city.name} - SP</span>
      </div>
    </div>
  </div>
</section>`;
}

function implantacaoSection(service, city) {
  return `
<section class="implantacao" id="implantacao">
  <div class="container">
    <div class="section-header">
      <span class="section-tag section-tag-light">Nossa metodologia</span>
      <h2 class="section-title section-title-light">Como estruturamos a operação de ${service.nomeCurto.toLowerCase()} em ${city.name}?</h2>
      <p class="section-subtitle section-subtitle-light">${fill(service.implantacaoSubtitle, city)}</p>
    </div>
    <div class="timeline-layout">
      <div class="timeline-main-image">
        <img src="/implantacao1.webp" alt="Planejamento de operação PS Proteção" class="timeline-cover-img" width="800" height="600" loading="lazy">
        <div class="timeline-image-overlay">
          <div class="timeline-badge">
            <i data-lucide="award" aria-hidden="true"></i>
            <span>Processo Técnico Certificado</span>
          </div>
        </div>
      </div>
      <div class="timeline-steps">
        <div class="timeline-step">
          <div class="step-connector"><div class="step-dot"><span>1</span></div><div class="step-line"></div></div>
          <div class="step-content">
            <div class="step-image-small"><img src="/implantacao2.webp" alt="Diagnóstico do posto de serviço" width="160" height="120" loading="lazy"></div>
            <div class="step-text"><h3>Diagnóstico do Posto de Serviço</h3><p>Analisamos o ambiente, fluxos de acesso, pontos críticos e necessidades operacionais em ${city.name}, definindo o escopo adequado para o local.</p></div>
          </div>
        </div>
        <div class="timeline-step">
          <div class="step-connector"><div class="step-dot"><span>2</span></div><div class="step-line"></div></div>
          <div class="step-content">
            <div class="step-image-small"><img src="/implantacao3.webp" alt="Dimensionamento e implantação da equipe" width="160" height="120" loading="lazy"></div>
            <div class="step-text"><h3>Dimensionamento e Implantação da Equipe</h3><p>Selecionamos profissionais conforme o perfil da operação, com treinamento, uniformização e definição das rotinas e procedimentos do posto.</p></div>
          </div>
        </div>
        <div class="timeline-step">
          <div class="step-connector"><div class="step-dot"><span>3</span></div><div class="step-line"></div></div>
          <div class="step-content">
            <div class="step-image-small"><img src="/implantacao4.webp" alt="Supervisão e auditoria operacional" width="160" height="120" loading="lazy"></div>
            <div class="step-text"><h3>Supervisão e Auditoria Operacional</h3><p>Acompanhamento periódico com supervisores, verificação de rotinas, cumprimento de procedimentos e apoio aos colaboradores em campo.</p></div>
          </div>
        </div>
        <div class="timeline-step timeline-step-last">
          <div class="step-connector"><div class="step-dot step-dot-gold"><span>4</span></div></div>
          <div class="step-content">
            <div class="step-image-small"><img src="/implantacao5.webp" alt="Relatórios e melhoria contínua" width="160" height="120" loading="lazy"></div>
            <div class="step-text"><h3>Relatórios e Melhoria Contínua</h3><p>Registro de ocorrências, ajustes operacionais e alinhamentos com o cliente para manter a operação em ${city.name} eficiente e organizada.</p></div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-cta section-cta-center">
      <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp btn-lg">
        <i data-lucide="message-circle" aria-hidden="true"></i>Solicitar Proposta Personalizada
      </a>
    </div>
  </div>
</section>`;
}

// Bloco nas páginas hub (120) e na home de cidade, linkando para as 8 páginas nichadas do serviço+cidade.
function verPorSegmentoSection(service, city) {
  const baseVariant = SERVICE_VARIANTS.find((v) => v.slug === service.slug);
  if (!baseVariant) return '';
  const links = NICHOS.map((nicho) => `<a href="${nichoPath(baseVariant, nicho, city)}">${nichoLabel(baseVariant, nicho)} em ${city.name} - SP</a>`);
  return `
<section class="outras-paginas outras-paginas-segmento">
  <div class="container">
    <p class="outras-paginas-title">Ver por segmento: ${service.nomeCurto.toLowerCase()} especializada em ${city.name}</p>
    <div class="outras-paginas-grid">${links.join('')}
    </div>
  </div>
</section>`;
}

// "Veja também" para páginas nichadas: hub do serviço, 2 nichos irmãos da mesma variação,
// e o mesmo nicho no serviço-base cruzado (Limpeza <-> Portaria) — malha de silo real.
function vejaTambemNichoSection(variacao, nicho, city) {
  const parentService = SERVICES[variacao.parent];
  const nichoIdx = NICHOS.findIndex((n) => n.slug === nicho.slug);
  const siblingNichos = [NICHOS[(nichoIdx + 1) % NICHOS.length], NICHOS[(nichoIdx + 2) % NICHOS.length]];
  const otherParentKey = variacao.parent === 'limpeza' ? 'portaria' : 'limpeza';
  const otherParentService = SERVICES[otherParentKey];
  const otherBaseVariant = SERVICE_VARIANTS.find((v) => v.slug === otherParentKey);

  const cards = [
    {
      href: hubPath(parentService, city),
      img: parentService.image, imgAlt: `${parentService.imageAlt} em ${city.name}`,
      tagIcon: parentService.icon, tag: parentService.nomeCurto,
      title: `${parentService.nome} em ${city.name} - SP`,
      desc: `Conheça a operação completa de ${parentService.nomeCurto.toLowerCase()} terceirizada em ${city.name}, com todos os detalhes do serviço.`,
    },
    ...siblingNichos.map((sib) => ({
      href: nichoPath(variacao, sib, city),
      img: parentService.image, imgAlt: `${nichoLabel(variacao, sib)} em ${city.name}`,
      tagIcon: variacao.icon, tag: variacao.nomeCurto,
      title: `${nichoLabel(variacao, sib)} em ${city.name} - SP`,
      desc: `${variacao.nome} pensada para ${sib.nome.toLowerCase()}: ${sib.dor}.`,
    })),
    {
      href: nichoPath(otherBaseVariant, nicho, city),
      img: otherParentService.image, imgAlt: `${nichoLabel(otherBaseVariant, nicho)} em ${city.name}`,
      tagIcon: otherBaseVariant.icon, tag: otherBaseVariant.nomeCurto,
      title: `${nichoLabel(otherBaseVariant, nicho)} em ${city.name} - SP`,
      desc: `${nicho.nome} em ${city.name} também contam com ${otherBaseVariant.nome.toLowerCase()} especializada da PS Proteção.`,
    },
  ];

  const cardsHtml = cards.map((c) => `
      <article class="blog-card">
        <div class="svc-card">
          <a href="${c.href}" class="svc-card-img-wrap">
            <img src="/${c.img}" alt="${c.imgAlt}" width="800" height="600" loading="lazy">
            <span class="svc-card-tag"><i data-lucide="${c.tagIcon}" aria-hidden="true"></i>${c.tag}</span>
          </a>
          <div class="svc-card-body">
            <h3 class="svc-card-title">${c.title}</h3>
            <p class="svc-card-desc">${c.desc}</p>
            <a href="${c.href}" class="svc-card-link">Saiba mais<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>`).join('');

  return `
<section class="related-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Veja também</span>
      <h2 class="section-title">Outras soluções PS Proteção em ${city.name}</h2>
    </div>
    <div class="blog-grid">${cardsHtml}
    </div>
  </div>
</section>`;
}

function outrasPaginasNichoSection(variacao, nicho, city) {
  const near = nearbyCities(city, 14);
  const links = near.map((c) => `<a href="${nichoPath(variacao, nicho, c)}">${nichoLabel(variacao, nicho)} em ${c.name} - SP</a>`);
  const core = coreLinks().map(([href, label]) => `<a href="${href}">${label}</a>`);
  return `
<section class="outras-paginas">
  <div class="container">
    <p class="outras-paginas-title">Outras páginas e serviços</p>
    <div class="outras-paginas-grid">${[...links, ...core].join('')}
    </div>
  </div>
</section>`;
}

function vejaTambemSection(service, city) {
  const outro = SERVICES[service.outroServico];
  return `
<section class="related-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Veja também</span>
      <h2 class="section-title">Outras soluções PS Proteção em ${city.name}</h2>
    </div>
    <div class="blog-grid">
      <article class="blog-card">
        <div class="svc-card">
          <a href="${hubPath(outro, city)}" class="svc-card-img-wrap">
            <img src="/${outro.image}" alt="${outro.imageAlt} em ${city.name}" width="800" height="600" loading="lazy">
            <span class="svc-card-tag"><i data-lucide="${outro.icon}" aria-hidden="true"></i>${outro.nomeCurto}</span>
          </a>
          <div class="svc-card-body">
            <h3 class="svc-card-title">${outro.nome} em ${city.name} - SP</h3>
            <p class="svc-card-desc">${fill(outro.paragraphs.p1[city.index % 3], city)}</p>
            <a href="${hubPath(outro, city)}" class="svc-card-link">Saiba mais<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>
      <article class="blog-card">
        <div class="svc-card">
          <a href="/servicos.html" class="svc-card-img-wrap">
            <img src="/hero.webp" alt="Todos os serviços de Facilities PS Proteção" width="800" height="600" loading="lazy">
            <span class="svc-card-tag"><i data-lucide="layout-grid" aria-hidden="true"></i>Facilities</span>
          </a>
          <div class="svc-card-body">
            <h3 class="svc-card-title">Todos os serviços de Facilities da PS Proteção</h3>
            <p class="svc-card-desc">Conheça a linha completa: portaria, limpeza, zeladoria, recepção, auxiliar administrativo e auxiliar contábil.</p>
            <a href="/servicos.html" class="svc-card-link">Ver serviços<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>
      <article class="blog-card">
        <div class="svc-card">
          <a href="/sobre.html" class="svc-card-img-wrap">
            <img src="/historia.webp" alt="Quem é a PS Proteção" width="800" height="600" loading="lazy">
            <span class="svc-card-tag"><i data-lucide="shield-check" aria-hidden="true"></i>Institucional</span>
          </a>
          <div class="svc-card-body">
            <h3 class="svc-card-title">Quem é a PS Proteção</h3>
            <p class="svc-card-desc">Mais de 28 anos de atuação em Facilities na Região Metropolitana de Campinas.</p>
            <a href="/sobre.html" class="svc-card-link">Conhecer a empresa<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>`;
}

function faqSection(service, city, h1) {
  return `
<section class="faq-servico" id="faq">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Perguntas frequentes</span>
      <h2 class="section-title">Dúvidas sobre ${service.nomeCurto.toLowerCase()} terceirizada em ${city.name}</h2>
    </div>
    <div class="faq-list">${faqHtml(service, city)}
    </div>
  </div>
</section>`;
}

function outrasPaginasSection(service, city) {
  const near = nearbyCities(city, 14);
  const links = near.map((c) => `<a href="${hubPath(service, c)}">${service.nome} em ${c.name} - SP</a>`);
  const core = coreLinks().map(([href, label]) => `<a href="${href}">${label}</a>`);
  return `
<section class="outras-paginas">
  <div class="container">
    <p class="outras-paginas-title">Outras páginas e serviços</p>
    <div class="outras-paginas-grid">${[...links, ...core].join('')}
    </div>
  </div>
</section>`;
}

function outrasCidadesSection(city) {
  const near = nearbyCities(city, 14);
  const links = near.map((c) => `<a href="${cityPath(c)}">PS Proteção em ${c.name} - SP</a>`);
  const core = coreLinks().map(([href, label]) => `<a href="${href}">${label}</a>`);
  return `
<section class="outras-paginas">
  <div class="container">
    <p class="outras-paginas-title">Outras cidades atendidas</p>
    <div class="outras-paginas-grid">${[...links, ...core].join('')}
    </div>
  </div>
</section>`;
}

function depoimentosSection() {
  const stars = Array.from({ length: 5 }).map(() => '<i data-lucide="star" aria-hidden="true"></i>').join('');
  const cards = TESTEMUNHOS.map((t) => `
        <div class="depoimento-card">
          <i data-lucide="quote" class="depoimento-card-icon"></i>
          <p>${t.texto}</p>
          <div class="depoimento-card-author">
            ${t.foto
              ? `<img src="${t.foto}" alt="${t.nome}" class="depoimento-card-avatar">`
              : `<span class="depoimento-card-avatar depoimento-card-avatar-placeholder">${iniciais(t.nome)}</span>`}
            <div class="depoimento-card-author-text">
              <span class="depoimento-card-nome">${t.nome}</span>
              <span class="depoimento-card-cargo">${t.cargo}</span>
            </div>
          </div>
        </div>`).join('');
  return `
<section class="depoimentos-gmb">
  <div class="container">
    <div class="depoimentos-gmb-inner">
      <span class="section-tag section-tag-light">Avaliações reais</span>
      <div class="depoimentos-stars">${stars}</div>
      <p>Nossos clientes avaliam a PS Proteção diretamente no Google. Confira as avaliações reais e verificadas de quem já contratou nossos serviços de Facilities.</p>
      <a href="${GOOGLE_REVIEW_URL}" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg depoimentos-gmb-google">
        <i data-lucide="external-link" aria-hidden="true"></i>Ver avaliações no Google
      </a>
    </div>
    <div class="depoimentos-cards">${cards}
    </div>
  </div>
</section>`;
}

function ctaSection(service, city) {
  return `
<section class="cta-section cta-section-servico">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-content">
        <h2>Precisa de ${service.nomeCurto.toLowerCase()} terceirizada em ${city.name}?</h2>
        <p>Fale com nossa equipe e receba uma proposta personalizada para o seu tipo de operação.</p>
      </div>
      <div class="cta-actions">
        <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp btn-xl">
          <i data-lucide="message-circle" aria-hidden="true"></i>Falar pelo WhatsApp
        </a>
        <a href="${EMAIL_HREF}" class="btn btn-outline-white btn-xl">
          <i data-lucide="mail" aria-hidden="true"></i>Enviar E-mail
        </a>
      </div>
    </div>
  </div>
</section>`;
}

function ctaSectionCidade(city) {
  return `
<section class="cta-section cta-section-servico">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-content">
        <h2>Precisa de portaria ou limpeza terceirizada em ${city.name}?</h2>
        <p>Fale com nossa equipe e receba uma proposta personalizada para o seu tipo de operação em ${city.name} - SP.</p>
      </div>
      <div class="cta-actions">
        <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp btn-xl">
          <i data-lucide="message-circle" aria-hidden="true"></i>Falar pelo WhatsApp
        </a>
        <a href="${EMAIL_HREF}" class="btn btn-outline-white btn-xl">
          <i data-lucide="mail" aria-hidden="true"></i>Enviar E-mail
        </a>
      </div>
    </div>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="/logo-servicos.webp" alt="PS Proteção" class="footer-logo" width="220" height="60" loading="lazy">
        <p class="footer-desc">Soluções completas em Facilities para empresas na Região Metropolitana de Campinas.</p>
        <div class="footer-social">${socialIconsHTML(17)}
        </div>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Serviços</h4>
        <ul class="footer-links">
          <li><a href="/servicos.html">Portaria e Controle de Acesso</a></li>
          <li><a href="/servicos.html">Limpeza e Conservação</a></li>
          <li><a href="/servicos.html">Zeladoria</a></li>
          <li><a href="/servicos.html">Auxiliar Administrativo</a></li>
          <li><a href="/servicos.html">Recepção</a></li>
          <li><a href="/servicos.html">Auxiliar Contábil</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Institucional</h4>
        <ul class="footer-links">
          <li><a href="/sobre.html">Quem Somos</a></li>
          <li><a href="/segmentos.html">Segmentos</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contato.html">Entre em Contato</a></li>
          <li><a href="/canal-etica.html">Canal de Ética</a></li>
          <li><a href="https://protecaotalentos.online" target="_blank" rel="noopener">Trabalhe Conosco</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Contato</h4>
        <div class="footer-contact">
          <div class="contact-item"><i data-lucide="map-pin" aria-hidden="true"></i><a href="https://maps.google.com/maps?q=-22.7301816,-47.30249" target="_blank" rel="noopener">Rua São Gabriel, 1623 — Americana, SP</a></div>
          <div class="contact-item"><i data-lucide="phone" aria-hidden="true"></i><a href="${TEL_HREF}">${TEL_DISPLAY}</a></div>
          <div class="contact-item"><i data-lucide="message-circle" aria-hidden="true"></i><a href="${WPP_HREF}" target="_blank" rel="noopener">WhatsApp Comercial</a></div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 PS Proteção — Serviços e Facilities. Todos os direitos reservados.</p>
      <p class="footer-region">Americana · Campinas · Região Metropolitana de Campinas · SP</p>
    </div>
  </div>
</footer>

<a href="${WPP_HREF}" target="_blank" rel="noopener" class="whatsapp-float" aria-label="WhatsApp">
  <i data-lucide="message-circle" aria-hidden="true"></i>
</a>
<script src="/js/main.js" defer></script>`;
}

// ── Cabeçalho <head> comum (título/description/OG/schema variam por página) ──
function headBlock({ title, description, url, ogImage, schemaJson }) {
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="llms" href="/llms.txt" type="text/plain">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="PS Proteção">
  <meta property="og:locale"      content="pt_BR">
  <meta property="og:title"       content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url"         content="${url}">
  <meta property="og:image"       content="${ogImage}">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image"       content="${ogImage}">

  <link rel="icon" type="image/png" href="/logo-servicos.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="/css/style.css">
  <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js" defer></script>

  <!-- Structured Data -->
  <script type="application/ld+json">
  ${schemaJson}
  </script>`;
}

// ── Página hub (serviço x cidade) ──────────────────────────────────
function buildPage(service, city) {
  const h1 = buildH1(city, service);
  const tagline = buildTagline(city, service);
  const url = hubUrl(service, city);
  const title = `${h1} — PS Proteção`;
  const description = `${service.nome} em ${city.name} - SP com a PS Proteção: equipe treinada, supervisão contínua, SLA e mais de 28 anos de experiência em Facilities. Solicite um orçamento.`;
  const schemaJson = buildSchema(service, city, h1, url, city.slug === 'americana');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBR8J899');</script>
<!-- End Google Tag Manager -->
${headBlock({ title, description, url, ogImage: `${SITE}/${service.image}`, schemaJson })}
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TBR8J899"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
${microHeader(city)}
${siteHeader()}

<main>
${heroServico(service, city, h1, tagline)}
${statsSection()}
${sedeSection()}
${verPorSegmentoSection(service, city)}
${implantacaoSection(service, city)}
${vejaTambemSection(service, city)}
${faqSection(service, city, h1)}
${depoimentosSection()}
${outrasPaginasSection(service, city)}
${ctaSection(service, city)}
</main>

${footer()}
<script>
  document.addEventListener('DOMContentLoaded', () => { if (window.lucide) lucide.createIcons(); });
</script>
</body>
</html>
`;
}

// ── Página nichada (variação x nicho x cidade) ─────────────────────
function buildPageNicho(variacao, nicho, city, variantIndex, nichoIndex) {
  const service = buildNichoService(variacao, nicho, variantIndex, nichoIndex);
  const h1 = buildH1(city, service);
  const tagline = buildTagline(city, service);
  const url = nichoUrl(variacao, nicho, city);
  const title = `${h1} — PS Proteção`;
  const description = `${service.nome} em ${city.name} - SP com a PS Proteção: equipe treinada, ${nicho.compliance}, supervisão contínua e mais de 28 anos de experiência em Facilities. Solicite um orçamento.`;
  const schemaJson = buildSchema(service, city, h1, url, false);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBR8J899');</script>
<!-- End Google Tag Manager -->
${headBlock({ title, description, url, ogImage: `${SITE}/${service.image}`, schemaJson })}
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TBR8J899"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
${microHeader(city)}
${siteHeader()}

<main>
${heroServico(service, city, h1, tagline)}
${statsSection()}
${sedeSection()}
${implantacaoSection(service, city)}
${vejaTambemNichoSection(variacao, nicho, city)}
${faqSection(service, city, h1)}
${depoimentosSection()}
${outrasPaginasNichoSection(variacao, nicho, city)}
${ctaSection(service, city)}
</main>

${footer()}
<script>
  document.addEventListener('DOMContentLoaded', () => { if (window.lucide) lucide.createIcons(); });
</script>
</body>
</html>
`;
}

// ── Página-índice de cidade (nova): resumo + cards Limpeza/Portaria + tabela dos 8 nichos de cada ──
function buildCidadeParagraphs(city) {
  const templates = [
    `A PS Proteção atua em ${city.name} - SP há mais de 28 anos, oferecendo soluções completas de portaria e limpeza terceirizada para empresas, condomínios e instituições da região.`,
    `Em ${city.name} - SP, a PS Proteção estrutura operações de portaria e limpeza terceirizada com processo definido, equipe treinada e supervisão contínua.`,
    `Empresas, condomínios e instituições de ${city.name} - SP contam com a PS Proteção para terceirizar portaria e limpeza, com equipes dimensionadas para cada tipo de operação.`,
  ];
  return templates[city.index % 3];
}

function heroCidade(city, h1, tagline) {
  return `
<section class="hero-servico">
  <div class="container">
    <div class="page-breadcrumb">
      <a href="/index.html">Home</a>
      <i data-lucide="chevron-right" aria-hidden="true"></i>
      <span>${city.name}</span>
    </div>
    <div class="hero-servico-grid">
      <div class="hero-servico-text">
        <h1>${h1}</h1>
        <span class="hero-servico-tagline">${tagline}</span>
        <p>${buildCidadeParagraphs(city)}</p>
        <p>Atuamos com portaria, controle de acesso, portaria condominial e portaria 24 horas, além de limpeza, limpeza técnica, limpeza corporativa e auxiliar de limpeza — sempre com contrato claro, SLA definido e gestão trabalhista assumida integralmente pela PS Proteção.</p>
        <p class="hero-servico-cta-line">Gostaria de um orçamento ou entrar em contato sobre serviços de Facilities em ${city.name} - SP? Fale conosco pelo telefone ${TEL_DISPLAY} ou em nosso WhatsApp <a href="${WPP_HREF}" target="_blank" rel="noopener">clicando aqui</a>.</p>
        <div class="hero-servico-actions">
          <a href="${WPP_HREF}" target="_blank" rel="noopener" class="btn btn-wpp btn-lg">
            <i data-lucide="message-circle" aria-hidden="true"></i>Solicitar Orçamento
          </a>
          <a href="${EMAIL_HREF}" class="btn btn-outline-white btn-lg">
            <i data-lucide="mail" aria-hidden="true"></i>Enviar E-mail
          </a>
        </div>
      </div>
      <div class="hero-servico-img-frame">
        <img src="/hero.webp" alt="PS Proteção em ${city.name}" width="800" height="1000" loading="eager">
        <span class="hero-servico-badge"><i data-lucide="badge-check" aria-hidden="true"></i>${city.name} - SP</span>
      </div>
    </div>
  </div>
</section>`;
}

// Cards linkando para os 2 hubs de serviço (Limpeza/Portaria) da cidade.
function servicosCidadeSection(city) {
  const cards = Object.values(SERVICES).map((service) => ({
    href: hubPath(service, city),
    img: service.image, imgAlt: `${service.imageAlt} em ${city.name}`,
    tagIcon: service.icon, tag: service.nomeCurto,
    title: `${service.nome} em ${city.name} - SP`,
    desc: fill(service.paragraphs.p1[city.index % 3], city),
  }));
  const cardsHtml = cards.map((c) => `
      <article class="blog-card">
        <div class="svc-card">
          <a href="${c.href}" class="svc-card-img-wrap">
            <img src="/${c.img}" alt="${c.imgAlt}" width="800" height="600" loading="lazy">
            <span class="svc-card-tag"><i data-lucide="${c.tagIcon}" aria-hidden="true"></i>${c.tag}</span>
          </a>
          <div class="svc-card-body">
            <h3 class="svc-card-title">${c.title}</h3>
            <p class="svc-card-desc">${c.desc}</p>
            <a href="${c.href}" class="svc-card-link">Saiba mais<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>`).join('');
  return `
<section class="related-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Nossos serviços</span>
      <h2 class="section-title">Portaria e Limpeza Terceirizada em ${city.name}</h2>
    </div>
    <div class="blog-grid">${cardsHtml}
    </div>
  </div>
</section>`;
}

function faqSectionCidade(city, h1) {
  const items = FAQ_GENERICO.map(([q, a], i) => `
        <details class="faq-item"${i === 0 ? ' open' : ''}>
          <summary><span>${fill(q, city)}</span><span class="faq-icon"><i data-lucide="plus" aria-hidden="true"></i></span></summary>
          <div class="faq-answer">${fill(a, city)}</div>
        </details>`).join('');
  return `
<section class="faq-servico" id="faq">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Perguntas frequentes</span>
      <h2 class="section-title">Dúvidas sobre Facilities em ${city.name}</h2>
    </div>
    <div class="faq-list">${items}
    </div>
  </div>
</section>`;
}

function buildPageCidade(city) {
  const h1 = `Portaria e Limpeza Terceirizada em ${city.name} - SP`;
  const tagline = pickTagline(city.index, 50);
  const url = cityUrl(city);
  const title = `${h1} — PS Proteção`;
  const description = `PS Proteção em ${city.name} - SP: portaria, controle de acesso e limpeza terceirizada para empresas, condomínios e instituições, com mais de 28 anos de experiência em Facilities. Solicite um orçamento.`;
  const schemaJson = buildCitySchema(city, h1, url, city.slug === 'americana');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBR8J899');</script>
<!-- End Google Tag Manager -->
${headBlock({ title, description, url, ogImage: `${SITE}/hero.webp`, schemaJson })}
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TBR8J899"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
${microHeader(city)}
${siteHeader()}

<main>
${heroCidade(city, h1, tagline)}
${statsSection()}
${sedeSection()}
${servicosCidadeSection(city)}
${verPorSegmentoSection(SERVICES.limpeza, city)}
${verPorSegmentoSection(SERVICES.portaria, city)}
${depoimentosSection()}
${faqSectionCidade(city, h1)}
${outrasCidadesSection(city)}
${ctaSectionCidade(city)}
</main>

${footer()}
<script>
  document.addEventListener('DOMContentLoaded', () => { if (window.lucide) lucide.createIcons(); });
</script>
</body>
</html>
`;
}

// ── Execução ──────────────────────────────────────────────────────
function writeIndexHtml(dir, html) {
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, 'index.html');
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      fs.writeFileSync(outPath, html, 'utf8');
      return outPath;
    } catch (err) {
      if (attempt === 30) throw err;
      const until = Date.now() + 400;
      while (Date.now() < until) {} // busy-wait retry (OneDrive transient file lock)
    }
  }
  return outPath;
}

function generate(cities) {
  const written = [];
  for (const city of cities) {
    written.push(writeIndexHtml(path.join(ROOT_DIR, city.slug), buildPageCidade(city)));

    for (const service of Object.values(SERVICES)) {
      const html = buildPage(service, city);
      written.push(writeIndexHtml(path.join(ROOT_DIR, city.slug, service.slug), html));
    }
    SERVICE_VARIANTS.forEach((variacao, variantIndex) => {
      NICHOS.forEach((nicho, nichoIndex) => {
        const html = buildPageNicho(variacao, nicho, city, variantIndex, nichoIndex);
        written.push(writeIndexHtml(path.join(ROOT_DIR, city.slug, variacao.slug, nicho.slug), html));
      });
    });
  }
  return written;
}

const all = process.argv.includes('--all');
const cities = all ? CITIES : CITIES.filter((c) => c.slug === 'americana');
const written = generate(cities);
console.log(`Geradas ${written.length} páginas (estrutura por pasta/cidade).`);
written.forEach((f) => console.log(' -', path.relative(process.cwd(), f)));
