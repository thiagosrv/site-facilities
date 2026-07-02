// Gera sitemap.xml completo: páginas estáticas (raiz + blog) + páginas por cidade
// (60 city-home + 120 hub + 3.840 nichadas) a partir dos mesmos dados usados por generate-servicos.js.
// Uso: node scripts/generate-sitemap.js
'use strict';

const fs = require('fs');
const path = require('path');
const { CITIES } = require('./data/cities');
const { SERVICES } = require('./data/services');
const { NICHOS } = require('./data/nichos');
const { SERVICE_VARIANTS } = require('./data/service-variants');

const SITE = 'https://psprotecao.com.br';
const OUT_FILE = path.join(__dirname, '..', 'sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  ['/', 'weekly', '1.0', '2026-07-02'],
  ['/servicos.html', 'monthly', '0.9', '2026-07-02'],
  ['/segmentos.html', 'monthly', '0.8', '2026-07-02'],
  ['/sobre.html', 'monthly', '0.8', '2026-07-02'],
  ['/contato.html', 'monthly', '0.7', '2026-07-02'],
  ['/canal-etica.html', 'yearly', '0.5', '2026-07-02'],
  ['/blog/', 'weekly', '0.8', '2026-07-02'],
  ['/blog/como-escolher-empresa-portaria-terceirizada.html', 'monthly', '0.6', '2026-06-15'],
  ['/blog/terceirizacao-limpeza-corporativa-vantagens.html', 'monthly', '0.6', '2026-05-28'],
  ['/blog/zeladoria-preventiva-evitar-prejuizos.html', 'monthly', '0.6', '2026-05-10'],
  ['/blog/facilities-management-reduzir-custos.html', 'monthly', '0.6', '2026-04-22'],
];

function urlEntry(loc, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = STATIC_PAGES.map(([p, freq, prio, lastmod]) => urlEntry(`${SITE}${p}`, freq, prio, lastmod));

for (const city of CITIES) {
  entries.push(urlEntry(`${SITE}/${city.slug}`, 'weekly', '0.8', TODAY));
  for (const service of Object.values(SERVICES)) {
    const loc = `${SITE}/${city.slug}/${service.slug}`;
    entries.push(urlEntry(loc, 'monthly', '0.6', TODAY));
  }
  for (const variacao of SERVICE_VARIANTS) {
    for (const nicho of NICHOS) {
      const loc = `${SITE}/${city.slug}/${variacao.slug}/${nicho.slug}`;
      entries.push(urlEntry(loc, 'monthly', '0.5', TODAY));
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries.join('\n\n')}

</urlset>
`;

fs.writeFileSync(OUT_FILE, xml, 'utf8');
console.log(`sitemap.xml gerado com ${entries.length} URLs (${STATIC_PAGES.length} estáticas + ${entries.length - STATIC_PAGES.length} de serviço).`);
