'use strict';
const fs = require('fs');
const { CITIES } = require('./data/cities.js');

const SITE = 'https://psprotecao.com.br';
const REGION_ORDER = ['rmc', 'piracicaba', 'aguas'];
const REGION_INTRO = {
  rmc: 'Cobertura consolidada na Região Metropolitana de Campinas, do polo industrial de Americana e Sumaré aos centros empresariais de Campinas, Valinhos e Indaiatuba.',
  piracicaba: 'Atuação em toda a região de Piracicaba e Rio Claro, atendendo indústrias, instituições de ensino e comércios de médio e grande porte.',
  aguas: 'Presença no Circuito das Águas Paulista — de Amparo e Serra Negra a Mogi Guaçu e Mogi Mirim — com equipes dimensionadas para a rotina de cada município.',
};
const REGION_LABEL = {
  rmc: 'Região Metropolitana de Campinas',
  piracicaba: 'Região de Piracicaba e Rio Claro',
  aguas: 'Circuito das Águas Paulista',
};

const byRegion = {};
for (const c of CITIES) (byRegion[c.region] = byRegion[c.region] || []).push(c);
for (const r in byRegion) byRegion[r].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

const regionSections = REGION_ORDER.map((r) => {
  const cities = byRegion[r] || [];
  const links = cities.map((c) =>
    `        <a href="/${c.slug}" class="city-link"><i data-lucide="map-pin" aria-hidden="true"></i><span>${c.name}</span></a>`
  ).join('\n');
  return `    <div class="region-block">
      <div class="region-head">
        <h2 class="region-title">${REGION_LABEL[r]}</h2>
        <span class="region-count">${cities.length} cidades</span>
      </div>
      <p class="region-intro">${REGION_INTRO[r]}</p>
      <div class="city-grid">
${links}
      </div>
    </div>`;
}).join('\n\n');

// ItemList schema — cidades atendidas
const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cidades atendidas pela PS Proteção',
  description: 'Municípios com atendimento de Facilities (portaria, limpeza, zeladoria) da PS Proteção.',
  numberOfItems: CITIES.length,
  itemListElement: CITIES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `PS Proteção em ${c.name} - SP`,
    url: `${SITE}/${c.slug}`,
  })),
};

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="llms" href="/llms.txt" type="text/plain">
  <title>Onde Atuamos — PS Proteção | Facilities em 60 cidades de SP</title>
  <meta name="description" content="A PS Proteção atende 60 cidades da Região Metropolitana de Campinas, Piracicaba/Rio Claro e Circuito das Águas com portaria, limpeza e zeladoria. Veja se atendemos a sua cidade.">
  <link rel="canonical" href="${SITE}/onde-atuamos.html">

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="PS Proteção">
  <meta property="og:locale"      content="pt_BR">
  <meta property="og:title"       content="Onde Atuamos — PS Proteção">
  <meta property="og:description" content="Facilities (portaria, limpeza e zeladoria) em 60 cidades de SP: Região Metropolitana de Campinas, Piracicaba/Rio Claro e Circuito das Águas.">
  <meta property="og:url"         content="${SITE}/onde-atuamos.html">
  <meta property="og:image"       content="${SITE}/hero.webp">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="Onde Atuamos — PS Proteção">
  <meta name="twitter:description" content="Facilities em 60 cidades de SP: RMC, Piracicaba/Rio Claro e Circuito das Águas.">
  <meta name="twitter:image"       content="${SITE}/hero.webp">

  <link rel="icon" type="image/png" href="logo-servicos.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="css/style.css">
  <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js" defer></script>
  <style>
    .regions-page { padding: var(--section-py) 0; background: var(--gray-light); }
    .region-block { margin-top: 56px; }
    .region-block:first-child { margin-top: 40px; }
    .region-head { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
    .region-title { font-size: 1.5rem; color: var(--primary-dark); margin: 0; }
    .region-count { font-size: .8rem; font-weight: 700; color: var(--primary); background: rgba(13,21,48,.06); padding: 4px 12px; border-radius: 999px; }
    .region-intro { font-size: .95rem; color: var(--gray-text); line-height: 1.6; margin: 12px 0 24px; max-width: 760px; }
    .city-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .city-link {
      display: flex; align-items: center; gap: 10px;
      background: var(--white); border-radius: var(--radius-md, 12px);
      padding: 14px 16px; text-decoration: none;
      color: var(--primary-dark); font-weight: 600; font-size: .92rem;
      box-shadow: var(--shadow-sm); border: 1px solid transparent;
      transition: box-shadow var(--t), transform var(--t), border-color var(--t), color var(--t);
    }
    .city-link i { width: 18px; height: 18px; color: var(--gold); flex-shrink: 0; }
    .city-link:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); border-color: var(--gold); color: var(--primary); }
    @media (max-width: 1024px) { .city-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 720px)  { .city-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 420px)  { .city-grid { grid-template-columns: 1fr; } }
  </style>
  <script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
  </script>
</head>
<body>

<header id="header" class="header">
  <nav class="nav container">
    <a href="index.html" class="nav-logo">
      <img src="logo-servicos.webp" alt="PS Proteção" class="logo-img">
    </a>
    <ul class="nav-menu" id="nav-menu">
      <li><a href="index.html"       class="nav-link">Home</a></li>
      <li class="nav-item has-submenu">
        <a href="servicos.html" class="nav-link">Serviços e Soluções</a>
        <button type="button" class="nav-submenu-toggle" aria-expanded="false" aria-label="Abrir submenu de Serviços">
          <i data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
        <ul class="nav-submenu">
          <li><a href="segmentos.html" class="nav-sublink">Segmentos Atendidos</a></li>
          <li><a href="onde-atuamos.html" class="nav-sublink active">Onde Atuamos</a></li>
        </ul>
      </li>
      <li><a href="sobre.html"       class="nav-link">Quem Somos</a></li>
      <li><a href="blog/"            class="nav-link">Blog</a></li>
      <li><a href="contato.html"     class="nav-link">Entre em Contato</a></li>
      <li><a href="canal-etica.html" class="nav-link">Canal de Ética</a></li>
    </ul>
    <div class="nav-actions">
      <a href="https://protecaotalentos.online" target="_blank" rel="noopener" class="btn btn-outline-gold">
        <i data-lucide="user-plus" aria-hidden="true"></i>Trabalhe Conosco
      </a>
      <a href="https://wa.me/5519982892037" target="_blank" rel="noopener" class="btn btn-gold">
        <i data-lucide="message-circle" aria-hidden="true"></i>Solicitar Orçamento
      </a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menu">
      <i data-lucide="menu" aria-hidden="true"></i>
    </button>
  </nav>
</header>

<main>

<section class="page-hero">
  <div class="container">
    <div class="page-breadcrumb">
      <a href="index.html">Home</a>
      <i data-lucide="chevron-right" aria-hidden="true"></i>
      <span>Onde Atuamos</span>
    </div>
    <span class="section-tag section-tag-gold"><i data-lucide="map-pinned" aria-hidden="true"></i>Área de atuação</span>
    <h1>Onde a PS Proteção atua</h1>
    <p>Atendemos <strong>60 cidades</strong> em três regiões do interior de São Paulo com portaria, limpeza, zeladoria e serviços de apoio. Selecione a sua cidade para ver as soluções de Facilities disponíveis localmente.</p>
  </div>
</section>

<section class="regions-page">
  <div class="container">
${regionSections}
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-content">
        <h2>Não encontrou a sua cidade?</h2>
        <p>Nossa área de atuação está em expansão contínua na região. Fale com a nossa equipe e verificamos a viabilidade de atendimento para o seu endereço.</p>
      </div>
      <div class="cta-actions">
        <a href="https://wa.me/5519982892037" target="_blank" rel="noopener" class="btn btn-gold btn-xl">
          <i data-lucide="message-circle" aria-hidden="true"></i>Falar pelo WhatsApp
        </a>
        <a href="contato.html" class="btn btn-outline-white btn-xl">
          <i data-lucide="mail" aria-hidden="true"></i>Enviar mensagem
        </a>
      </div>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="logo-servicos.webp" alt="PS Proteção" class="footer-logo">
        <p class="footer-desc">Soluções completas em Facilities para empresas na Região Metropolitana de Campinas.</p>
        <div class="footer-social">
          <a href="https://wa.me/5519982892037" target="_blank" rel="noopener" aria-label="WhatsApp"><i data-lucide="message-circle" aria-hidden="true"></i></a>
          <a href="https://share.google/T93Dj9U0KXU4r2ZRx" target="_blank" rel="noopener" aria-label="Google"><i data-lucide="star" aria-hidden="true"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Serviços</h4>
        <ul class="footer-links">
          <li><a href="servicos.html">Portaria e Controle de Acesso</a></li>
          <li><a href="servicos.html">Limpeza e Conservação</a></li>
          <li><a href="servicos.html">Zeladoria</a></li>
          <li><a href="servicos.html">Auxiliar Administrativo</a></li>
          <li><a href="servicos.html">Recepção</a></li>
          <li><a href="servicos.html">Auxiliar Contábil</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Institucional</h4>
        <ul class="footer-links">
          <li><a href="sobre.html">Quem Somos</a></li>
          <li><a href="segmentos.html">Segmentos</a></li>
          <li><a href="onde-atuamos.html">Onde Atuamos</a></li>
          <li><a href="blog/">Blog</a></li>
          <li><a href="contato.html">Entre em Contato</a></li>
          <li><a href="canal-etica.html">Canal de Ética</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Contato</h4>
        <div class="footer-contact">
          <div class="contact-item"><i data-lucide="map-pin" aria-hidden="true"></i><span>Americana, SP · Região Metropolitana de Campinas</span></div>
          <div class="contact-item"><i data-lucide="phone" aria-hidden="true"></i><a href="tel:+5519982892037">(19) 98289-2037</a></div>
          <div class="contact-item"><i data-lucide="message-circle" aria-hidden="true"></i><a href="https://wa.me/5519982892037" target="_blank" rel="noopener">WhatsApp Comercial</a></div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 PS Proteção — Serviços e Facilities. Todos os direitos reservados.</p>
      <p class="footer-region">Americana · Campinas · Região Metropolitana de Campinas · SP</p>
    </div>
  </div>
</footer>

<a href="https://wa.me/5519982892037" target="_blank" rel="noopener" class="whatsapp-float" aria-label="WhatsApp">
  <i data-lucide="message-circle" aria-hidden="true"></i>
</a>
<script src="js/main.js" defer></script>
</body>
</html>
`;

fs.writeFileSync('onde-atuamos.html', html);
console.log('onde-atuamos.html gerado — ' + CITIES.length + ' cidades em ' + REGION_ORDER.length + ' regiões');
