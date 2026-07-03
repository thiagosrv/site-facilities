// Gera 1 novo post de blog (a partir da pauta do dia) usando a API da OpenAI.
// Atualiza blog/index.html + sitemap.xml, e gera a versão longa (1000-1500 palavras)
// em content-externo/{slug}.txt (texto puro, sem markdown) para publicação manual em Substack/Medium/LinkedIn.
// Uso: OPENAI_API_KEY=... node scripts/generate-blog-post.js
const fs = require('fs');
const path = require('path');
const CATEGORIES = require('./data/blog-categories');
const PAUTAS = require('./data/pautas-blog');
const { uploadToDrive } = require('./upload-to-drive');

const SITE = 'https://psprotecao.com.br';
const COVER_IMAGE = 'blog.webp';
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
const INDEX_PATH = path.join(BLOG_DIR, 'index.html');
const STATE_PATH = path.join(__dirname, 'data', 'pautas-state.json');
const EXTERNO_DIR = path.join(__dirname, '..', 'content-externo');
const LINKS_PATH = path.join(EXTERNO_DIR, 'links.json');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function dateBR(iso) {
  const [y, m, d] = iso.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

function slugify(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Lê os posts já publicados (título, categoria, imagem, data, slug) ──
function readExistingPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  return files.map(file => {
    const html = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const title = (html.match(/<h1>([\s\S]*?)<\/h1>/) || [, ''])[1].trim();
    const catMatch = html.match(/section-tag-gold"><i data-lucide="([a-z0-9-]+)" aria-hidden="true"><\/i>([^<]+)<\/span>/);
    const imgMatch = html.match(/<div class="article-cover">\s*<img src="\.\.\/([^"]+)" alt="([^"]*)"/);
    const dateMatch = html.match(/data-lucide="calendar" aria-hidden="true"><\/i>(\d{1,2} \w{3} \d{4})/);
    return {
      slug: file.replace(/\.html$/, ''),
      title,
      categoryIcon: catMatch ? catMatch[1] : 'layout-grid',
      categoryNome: catMatch ? catMatch[2] : 'Facilities',
      image: imgMatch ? imgMatch[1] : 'hero.webp',
      alt: imgMatch ? imgMatch[2] : '',
      dateLabel: dateMatch ? dateMatch[1] : '',
    };
  });
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { usedIds: [] };
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

// ── Pega a próxima pauta não usada, em ordem de id ──
function pickPauta(state) {
  const usedIds = new Set(state.usedIds);
  const sorted = [...PAUTAS].sort((a, b) => a.id - b.id);
  return sorted.find(p => !usedIds.has(p.id)) || null;
}

function findCategory(slug) {
  return CATEGORIES.find(c => c.slug === slug) || CATEGORIES[0];
}

async function callOpenAI(pauta, category, existingTitles) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY não definido.');

  const system = `Você é o redator de conteúdo do blog da PS Proteção, empresa de Facilities.
Fatos da empresa (use apenas estes dados, não invente números, prêmios, certificações ou clientes):
- Fundada em 1998, sede em Americana - SP, mais de 28 anos de experiência
- Atende a Região Metropolitana de Campinas: Americana, Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba, Santa Bárbara d'Oeste, Nova Odessa, Limeira, Piracicaba, Jundiaí
- Serviços: Portaria e Controle de Acesso, Limpeza e Conservação, Zeladoria, Recepção, Auxiliar Administrativo, Auxiliar Contábil
- Mais de 3.000 colaboradores treinados, mais de 1.000 clientes atendidos, supervisão ativa com relatórios periódicos
- Tom profissional, consultivo e direto. Público-alvo: gestores, RH e responsáveis por Facilities de empresas.
- Nunca cite concorrentes. Nunca invente estatísticas de mercado sem deixar claro que é uma referência genérica do setor.
Responda SEMPRE em JSON estrito, sem texto fora do JSON.`;

  const user = `Pauta a desenvolver: "${pauta.tema}" (categoria: ${category.nome}).
Abordagem sugerida: ${pauta.abordagem}
Palavras-chave sugeridas: ${pauta.keywords}
Intenção de busca: ${pauta.intencao} | Estágio de funil: ${pauta.funil}

Não repita nenhum destes títulos já publicados: ${existingTitles.length ? existingTitles.join(' | ') : '(nenhum ainda)'}.

Você vai escrever DUAS versões do mesmo tema:

1) "curto": versão enxuta de 400 a 500 palavras para o blog institucional do site (psprotecao.com.br/blog), no formato JSON abaixo.
2) "longo": versão aprofundada de 1000 a 1500 palavras no total, para publicação externa (Substack, Medium, LinkedIn), em uma estrutura FIXA e simples de copiar: título (H1), subtítulo (H2), um parágrafo de abertura ("subtexto") e EXATAMENTE 5 tópicos (nunca mais, nunca menos). Cada tópico é um parágrafo corrido (sem listas, sem markdown de negrito/itálico dentro do texto), com 150 a 220 palavras cada, para somar o total de 1000-1500 palavras. No parágrafo de "fechamento", inclua uma frase natural citando e linkando o artigo original do blog da PS Proteção usando exatamente este placeholder de link markdown: [artigo original no blog da PS Proteção]({{URL_INTERNA}}) — não troque o placeholder por outra URL.

Responda no seguinte formato JSON exato:
{
  "curto": {
    "title": "título do artigo, direto e específico",
    "metaDescription": "resumo de até 155 caracteres para meta description",
    "readingMinutes": numero_inteiro,
    "tags": ["tag1", "tag2", "tag3", "tag4"],
    "intro": ["parágrafo 1 de abertura", "parágrafo 2 de abertura (opcional, pode ser só 1)"],
    "pullQuote": "uma frase curta de destaque (pull quote) resumindo o ponto central do artigo",
    "sections": [
      {
        "heading": "título da seção (h2)",
        "paragraphs": ["parágrafo 1", "parágrafo 2 opcional"],
        "list": ["item opcional 1", "item opcional 2"],
        "subsections": [ { "heading": "subtítulo (h3)", "paragraphs": ["parágrafo"] } ]
      }
    ],
    "closingHeading": "título da seção final, algo como 'Como a PS Proteção...' relacionado ao tema",
    "closing": ["parágrafo final mencionando a PS Proteção e os +28 anos de experiência"]
  },
  "longo": {
    "titulo": "título do artigo longo (H1, pode ser igual ou uma variação do título curto)",
    "subtitulo": "subtítulo (H2) que expande o título em uma linha",
    "subtexto": "parágrafo de abertura (80 a 120 palavras) contextualizando o tema e o problema",
    "topicos": [
      { "titulo": "título do tópico 1 (h2)", "texto": "parágrafo corrido de 150 a 220 palavras, sem listas nem markdown de ênfase" },
      { "titulo": "título do tópico 2 (h2)", "texto": "parágrafo corrido de 150 a 220 palavras, sem listas nem markdown de ênfase" },
      { "titulo": "título do tópico 3 (h2)", "texto": "parágrafo corrido de 150 a 220 palavras, sem listas nem markdown de ênfase" },
      { "titulo": "título do tópico 4 (h2)", "texto": "parágrafo corrido de 150 a 220 palavras, sem listas nem markdown de ênfase" },
      { "titulo": "título do tópico 5 (h2)", "texto": "parágrafo corrido de 150 a 220 palavras, sem listas nem markdown de ênfase" }
    ],
    "fechamento": "parágrafo final (60 a 100 palavras) com o placeholder de link descrito acima"
  }
}
No "curto", inclua de 3 a 5 objetos em "sections". "list" e "subsections" são opcionais — omita quando não fizer sentido para o tema.
No "longo", "topicos" deve ter exatamente 5 itens, nem mais nem menos.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

function renderSection(section) {
  let html = `        <h2>${escapeHtml(section.heading)}</h2>\n`;
  for (const p of section.paragraphs || []) {
    html += `        <p>${p}</p>\n\n`;
  }
  if (section.list && section.list.length) {
    html += `        <ul>\n`;
    for (const item of section.list) html += `          <li>${item}</li>\n`;
    html += `        </ul>\n\n`;
  }
  for (const sub of section.subsections || []) {
    html += `        <h3>${escapeHtml(sub.heading)}</h3>\n`;
    for (const p of sub.paragraphs || []) html += `        <p>${p}</p>\n\n`;
  }
  return html;
}

function buildRelatedCards(related) {
  return related.map(p => `      <article class="blog-card">
        <div class="svc-card">
          <a href="/blog/${p.slug}.html" class="svc-card-img-wrap">
            <img src="../${p.image}" alt="${escapeHtml(p.alt)}" loading="lazy" width="800" height="600">
            <span class="svc-card-tag"><i data-lucide="${p.categoryIcon}" aria-hidden="true"></i>${escapeHtml(p.categoryNome)}</span>
          </a>
          <div class="svc-card-body">
            <div class="blog-card-meta">
              <span><i data-lucide="calendar" aria-hidden="true"></i>${p.dateLabel}</span>
            </div>
            <h3 class="svc-card-title">${escapeHtml(p.title)}</h3>
            <a href="/blog/${p.slug}.html" class="svc-card-link">Ler artigo<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>`).join('\n');
}

function buildPostHtml({ post, category, slug, dateISO, related }) {
  const url = `${SITE}/blog/${slug}.html`;
  const dateLabel = dateBR(dateISO);
  const sectionsHtml = post.sections.map((s, i) => {
    let html = renderSection(s);
    if (i === 0 && post.pullQuote) {
      html += `        <blockquote>${escapeHtml(post.pullQuote)}</blockquote>\n\n`;
    }
    return html;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="llms" href="/llms.txt" type="text/plain">
  <title>${escapeHtml(post.title)} — PS Proteção</title>
  <meta name="description" content="${escapeHtml(post.metaDescription)}">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type"        content="article">
  <meta property="og:site_name"   content="PS Proteção">
  <meta property="og:locale"      content="pt_BR">
  <meta property="og:title"       content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.metaDescription)}">
  <meta property="og:url"         content="${url}">
  <meta property="og:image"       content="${SITE}/${COVER_IMAGE}">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.metaDescription)}">
  <meta name="twitter:image"       content="${SITE}/${COVER_IMAGE}">

  <link rel="icon" type="image/png" href="../logo-servicos.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="../css/style.css">
  <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js" defer></script>

  <!-- Structured Data — BlogPosting -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": "${url}",
    "headline": "${escapeHtml(post.title)}",
    "description": "${escapeHtml(post.metaDescription)}",
    "image": "${SITE}/${COVER_IMAGE}",
    "datePublished": "${dateISO}",
    "dateModified": "${dateISO}",
    "author": { "@type": "Person", "name": "Thiago Stephano" },
    "publisher": { "@id": "${SITE}/#business" },
    "mainEntityOfPage": "${url}",
    "articleSection": "${category.nome}"
  }
  </script>
</head>
<body>

<header id="header" class="header">
  <nav class="nav container">
    <a href="../index.html" class="nav-logo">
      <img src="../logo-servicos.webp" alt="PS Proteção" class="logo-img">
    </a>
    <ul class="nav-menu" id="nav-menu">
      <li><a href="../index.html"       class="nav-link">Home</a></li>
      <li><a href="../servicos.html"    class="nav-link">Serviços e Soluções</a></li>
      <li><a href="../segmentos.html"   class="nav-link">Segmentos</a></li>
      <li><a href="../sobre.html"       class="nav-link">Quem Somos</a></li>
      <li><a href="./"                  class="nav-link active">Blog</a></li>
      <li><a href="../contato.html"     class="nav-link">Entre em Contato</a></li>
      <li><a href="../canal-etica.html" class="nav-link">Canal de Ética</a></li>
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

<section class="article-hero">
  <div class="container">
    <div class="article-hero-inner">
      <div class="page-breadcrumb">
        <a href="../index.html">Home</a>
        <i data-lucide="chevron-right" aria-hidden="true"></i>
        <a href="./">Blog</a>
        <i data-lucide="chevron-right" aria-hidden="true"></i>
        <span>${escapeHtml(category.nome)}</span>
      </div>
      <span class="section-tag section-tag-gold"><i data-lucide="${category.icon}" aria-hidden="true"></i>${escapeHtml(category.nome)}</span>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="blog-meta">
        <span><i data-lucide="calendar" aria-hidden="true"></i>${dateLabel}</span>
        <span><i data-lucide="clock" aria-hidden="true"></i>${post.readingMinutes} min de leitura</span>
        <span><i data-lucide="user" aria-hidden="true"></i>Thiago Stephano</span>
      </div>
    </div>
    <div class="article-cover">
      <img src="../${COVER_IMAGE}" alt="${escapeHtml(category.alt)}" width="800" height="600">
    </div>
  </div>
</section>

<section class="stats" id="numeros">
  <div class="container">
    <div class="stats-grid">

      <div class="stat-card" data-value="3000" data-suffix="+">
        <div class="stat-icon"><i data-lucide="users-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">0</span><span>+</span></div>
          <p class="stat-label">Colaboradores Treinados por Nós</p>
        </div>
      </div>

      <div class="stat-card" data-value="1000" data-suffix="+">
        <div class="stat-icon"><i data-lucide="building-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">0</span><span>+</span></div>
          <p class="stat-label">Clientes Atendidos</p>
        </div>
      </div>

      <div class="stat-card stat-card-gold" data-value="28" data-suffix="+">
        <div class="stat-icon"><i data-lucide="calendar-check-2"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">0</span><span>+</span></div>
          <p class="stat-label">Anos de Experiência no Mercado</p>
        </div>
      </div>

      <div class="stat-card" data-value="100" data-suffix="%">
        <div class="stat-icon"><i data-lucide="shield-check" aria-hidden="true"></i></div>
        <div class="stat-content">
          <div class="stat-number"><span class="counter">0</span><span>%</span></div>
          <p class="stat-label">Supervisão Ativa com Relatórios</p>
        </div>
      </div>

    </div>
  </div>
</section>

<section class="article-section">
  <div class="container">
    <div class="article-layout">

      <div class="article-share">
        <span class="article-share-label">Compartilhar</span>
        <a href="https://wa.me/?text=${url}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp"><i data-lucide="message-circle" aria-hidden="true"></i></a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn"><i data-lucide="linkedin" aria-hidden="true"></i></a>
        <a href="mailto:?subject=${encodeURIComponent(post.title)}&body=${url}" aria-label="Compartilhar por e-mail"><i data-lucide="mail" aria-hidden="true"></i></a>
      </div>

      <div class="article-body">
${post.intro.map(p => `        <p>${p}</p>`).join('\n\n')}

${sectionsHtml}        <h2>${escapeHtml(post.closingHeading)}</h2>
${post.closing.map(p => `        <p>${p}</p>`).join('\n\n')}

        <div class="article-tags">
${post.tags.map(t => `          <span class="article-tag">${escapeHtml(t)}</span>`).join('\n')}
        </div>

        <div class="author-box">
          <div class="author-avatar"><i data-lucide="${category.icon}" aria-hidden="true"></i></div>
          <div class="author-info">
            <h4>Thiago Stephano</h4>
            <p>Especialista em Facilities na PS Proteção, empresa com +28 anos de experiência em portaria, limpeza, zeladoria e suporte administrativo para empresas da Região Metropolitana de Campinas.</p>
          </div>
        </div>

        <div class="article-cta-box">
          <div class="article-cta-text">
            <span class="article-cta-eyebrow"><i data-lucide="shield-check" aria-hidden="true"></i>Diagnóstico gratuito</span>
            <h4>Solicite um diagnóstico preciso sobre Portaria e Facilities para sua empresa</h4>
            <p>Nossa equipe técnica avalia sua operação e retorna com um plano objetivo de cobertura, custo e supervisão.</p>
          </div>
          <div class="article-cta-buttons">
            <a href="mailto:empresas@psprotecao.com.br" class="btn btn-gold"><i data-lucide="mail" aria-hidden="true"></i>E-mail</a>
            <a href="https://wa.me/5519978210246" target="_blank" rel="noopener" class="btn btn-wpp"><i data-lucide="message-circle" aria-hidden="true"></i>WhatsApp</a>
            <a href="https://instagram.com/protecao_seguranca" target="_blank" rel="noopener" class="btn btn-outline-white"><i data-lucide="instagram" aria-hidden="true"></i>Instagram</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="related-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Continue lendo</span>
      <h2 class="section-title">Outros artigos que podem te interessar</h2>
    </div>
    <div class="blog-grid">
${buildRelatedCards(related)}
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-content">
        <h2>Quer uma proposta de Facilities para sua empresa?</h2>
        <p>Fale com nossa equipe e receba uma proposta personalizada de acordo com a sua operação.</p>
      </div>
      <div class="cta-actions">
        <a href="https://wa.me/5519982892037" target="_blank" rel="noopener" class="btn btn-gold btn-xl">
          <i data-lucide="message-circle" aria-hidden="true"></i>Falar pelo WhatsApp
        </a>
        <a href="../contato.html" class="btn btn-outline-white btn-xl">
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
        <img src="../logo-servicos.webp" alt="PS Proteção" class="footer-logo">
        <p class="footer-desc">Soluções completas em Facilities para empresas na Região Metropolitana de Campinas.</p>
        <div class="footer-social">
          <!-- WhatsApp -->
          <a href="https://wa.me/5519982892037" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </a>
          <!-- Instagram -->
          <a href="https://www.instagram.com/protecao_seguranca/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <!-- Facebook -->
          <a href="https://web.facebook.com/protecaoeseguranca" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <!-- LinkedIn -->
          <a href="https://www.linkedin.com/company/ps-protecao" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <!-- Google -->
          <a href="https://share.google/T93Dj9U0KXU4r2ZRx" target="_blank" rel="noopener" aria-label="Google Meu Negócio">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Serviços</h4>
        <ul class="footer-links">
          <li><a href="../servicos.html">Portaria e Controle de Acesso</a></li>
          <li><a href="../servicos.html">Limpeza e Conservação</a></li>
          <li><a href="../servicos.html">Zeladoria</a></li>
          <li><a href="../servicos.html">Auxiliar Administrativo</a></li>
          <li><a href="../servicos.html">Recepção</a></li>
          <li><a href="../servicos.html">Auxiliar Contábil</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-title">Institucional</h4>
        <ul class="footer-links">
          <li><a href="../sobre.html">Quem Somos</a></li>
          <li><a href="../segmentos.html">Segmentos</a></li>
          <li><a href="./">Blog</a></li>
          <li><a href="../contato.html">Entre em Contato</a></li>
          <li><a href="../canal-etica.html">Canal de Ética</a></li>
          <li><a href="https://protecaotalentos.online" target="_blank" rel="noopener">Trabalhe Conosco</a></li>
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
<script src="../js/main.js" defer></script>
</body>
</html>
`;
}

// ── Atualiza blog/index.html: JSON-LD, filtro de categoria e card novo ──
function updateBlogIndex({ post, category, slug, dateISO, url }) {
  let html = fs.readFileSync(INDEX_PATH, 'utf8');
  const dateLabel = dateBR(dateISO);

  // 1) JSON-LD blogPost — insere no topo do array
  const newEntry = `      {
        "@type": "BlogPosting",
        "headline": "${escapeHtml(post.title)}",
        "url": "${url}",
        "datePublished": "${dateISO}"
      },
`;
  html = html.replace(/("blogPost": \[\n)/, `$1${newEntry}`);

  // 2) Botão de filtro — adiciona se a categoria ainda não existir
  if (!html.includes(`data-filter="${category.slug}"`)) {
    html = html.replace(
      /(<button class="blog-filter-btn" data-filter="facilities">Facilities<\/button>\n)/,
      `$1    <button class="blog-filter-btn" data-filter="${category.slug}">${escapeHtml(category.nome)}</button>\n`
    );
  }

  // 3) Novo card no topo do grid
  const cardHtml = `      <article class="blog-card" data-category="${category.slug}">
        <div class="svc-card">
          <a href="/blog/${slug}.html" class="svc-card-img-wrap">
            <img src="../${COVER_IMAGE}" alt="${escapeHtml(category.alt)}" loading="lazy" width="800" height="600">
            <span class="svc-card-tag"><i data-lucide="${category.icon}" aria-hidden="true"></i>${escapeHtml(category.nome)}</span>
          </a>
          <div class="svc-card-body">
            <div class="blog-card-meta">
              <span><i data-lucide="calendar" aria-hidden="true"></i>${dateLabel}</span>
              <span><i data-lucide="clock" aria-hidden="true"></i>${post.readingMinutes} min</span>
            </div>
            <h3 class="svc-card-title">${escapeHtml(post.title)}</h3>
            <p class="svc-card-desc">${escapeHtml(post.metaDescription)}</p>
            <a href="/blog/${slug}.html" class="svc-card-link">Ler artigo<i data-lucide="arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>

`;
  html = html.replace(/(<div class="blog-grid">\n\n)/, `$1${cardHtml}`);

  fs.writeFileSync(INDEX_PATH, html, 'utf8');
}

// ── Atualiza sitemap.xml: adiciona a URL do novo post logo após o índice do blog ──
function updateSitemap({ url, dateISO }) {
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const entry = `
  <url>
    <loc>${url}</loc>
    <lastmod>${dateISO}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  xml = xml.replace(
    /(<loc>https:\/\/psprotecao\.com\.br\/blog\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>\s*<changefreq>[^<]+<\/changefreq>\s*<priority>[^<]+<\/priority>\s*<\/url>\n)/,
    `$1${entry}`
  );
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
}

// ── Salva a versão longa (1000-1500 palavras) para publicação externa ──
function saveLongform({ longo, pauta, category, slug, dateISO, url }) {
  if (!fs.existsSync(EXTERNO_DIR)) fs.mkdirSync(EXTERNO_DIR, { recursive: true });
  const clean = (s) => (s || '').replace(/\{\{URL_INTERNA\}\}/g, url).replace(/\[([^\]]*)\]\([^)]*\)/g, (_, label) => `${label} (${url})`);
  const subtexto = clean(longo.subtexto);
  const fechamento = clean(longo.fechamento);
  const topicos = (longo.topicos || []).slice(0, 5);
  const topicosTxt = topicos.map(t => `${t.titulo}\n${clean(t.texto)}`).join('\n\n');

  const txt = `${longo.titulo}

${longo.subtitulo || ''}

${subtexto}

${topicosTxt}

${fechamento}

---
Pauta #${pauta.id} · Categoria: ${category.nome} · Gerado em ${dateISO}
Artigo original no blog: ${url}
`;
  const filePath = path.join(EXTERNO_DIR, `${slug}.txt`);
  fs.writeFileSync(filePath, txt, 'utf8');

  const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const topicosHtml = topicos.map(t => `<h2>${esc(t.titulo)}</h2>\n<p>${esc(clean(t.texto))}</p>`).join('\n');
  const html = `<html><body>
<h1>${esc(longo.titulo)}</h1>
<h2>${esc(longo.subtitulo || '')}</h2>
<p>${esc(subtexto)}</p>
${topicosHtml}
<p>${esc(fechamento)}</p>
<p><em>Pauta #${pauta.id} · Categoria: ${esc(category.nome)} · Gerado em ${dateISO}</em></p>
</body></html>`;

  return { longformFile: `content-externo/${slug}.txt`, content: txt, html };
}

// ── Registra a pauta gerada em content-externo/links.json ──
function registerLink({ pauta, category, slug, url, dateISO, longformFile, driveUrl }) {
  let links = [];
  if (fs.existsSync(LINKS_PATH)) {
    links = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'));
  }
  links.push({
    pautaId: pauta.id,
    tema: pauta.tema,
    categoriaSlug: category.slug,
    slug,
    blogUrl: url,
    longformFile,
    driveUrl: driveUrl || '',
    geradoEm: dateISO,
    status: 'gerado',
    substackUrl: '',
    mediumUrl: '',
    linkedinUrl: '',
  });
  fs.writeFileSync(LINKS_PATH, JSON.stringify(links, null, 2) + '\n', 'utf8');
}

async function main() {
  const state = loadState();
  const pauta = pickPauta(state);

  if (!pauta) {
    console.log('Todas as 100 pautas já foram publicadas. Nenhum post novo gerado.');
    return;
  }

  const category = findCategory(pauta.categoriaSlug);
  const existingPosts = readExistingPosts();
  const existingSlugs = new Set(existingPosts.map(p => p.slug));

  const result = await callOpenAI(pauta, category, existingPosts.map(p => p.title));
  const post = result.curto;
  const longo = result.longo;

  let slug = slugify(post.title);
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${slugify(post.title)}-${suffix}`;
    suffix += 1;
  }

  const dateISO = todayISO();
  const url = `${SITE}/blog/${slug}.html`;

  // Posts relacionados: até 3 dos mais recentes já existentes
  const related = existingPosts.slice(-3).reverse();

  const html = buildPostHtml({ post, category, slug, dateISO, related });
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.html`), html, 'utf8');

  updateBlogIndex({ post, category, slug, dateISO, url });
  updateSitemap({ url, dateISO });

  const { longformFile, content: longformContent, html: longformHtml } = saveLongform({ longo, pauta, category, slug, dateISO, url });

  let driveUrl = '';
  try {
    const drive = await uploadToDrive({
      fileName: slug,
      content: longformHtml,
      mimeType: 'text/html',
      driveMimeType: 'application/vnd.google-apps.document',
    });
    if (drive) driveUrl = drive.webViewLink || '';
  } catch (err) {
    console.error('Falha ao enviar versão longa ao Google Drive (post gerado normalmente mesmo assim):', err.message);
  }

  registerLink({ pauta, category, slug, url, dateISO, longformFile, driveUrl });

  state.usedIds.push(pauta.id);
  saveState(state);

  console.log(`Post gerado: blog/${slug}.html`);
  console.log(`Título: ${post.title}`);
  console.log(`Categoria: ${category.nome}`);
  console.log(`Pauta #${pauta.id} — restam ${100 - state.usedIds.length} pautas.`);
  console.log(`Versão longa salva localmente em: ${longformFile}`);
  if (driveUrl) console.log(`Versão longa no Google Drive: ${driveUrl}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
