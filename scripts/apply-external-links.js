// Lê content-externo/links.json e, para pautas já publicadas externamente
// (Substack/Medium/LinkedIn preenchidos manualmente), insere uma caixa de
// destaque no MEIO do corpo do artigo (gera curiosidade para continuar lendo
// a versão completa) e marca a pauta como "aplicado".
// Uso: node scripts/apply-external-links.js
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const LINKS_PATH = path.join(__dirname, '..', 'content-externo', 'links.json');

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildBox(entry) {
  const items = [];
  if (entry.linkedinUrl) items.push(`<a href="${escapeHtml(entry.linkedinUrl)}" target="_blank" rel="noopener"><i data-lucide="linkedin" aria-hidden="true"></i>LinkedIn</a>`);
  if (entry.substackUrl) items.push(`<a href="${escapeHtml(entry.substackUrl)}" target="_blank" rel="noopener"><i data-lucide="rss" aria-hidden="true"></i>Substack</a>`);
  if (entry.mediumUrl) items.push(`<a href="${escapeHtml(entry.mediumUrl)}" target="_blank" rel="noopener"><i data-lucide="book-open" aria-hidden="true"></i>Medium</a>`);
  if (!items.length) return null;
  return `        <div class="article-continue-box">
          <div class="article-continue-icon"><i data-lucide="bookmark-check" aria-hidden="true"></i></div>
          <div class="article-continue-content">
            <span class="article-continue-eyebrow">Continue a leitura</span>
            <p>Leia a versão completa deste artigo em:</p>
            <div class="external-links-list">
${items.map(i => `              ${i}`).join('\n')}
            </div>
          </div>
        </div>

`;
}

// Insere a caixa no meio do <div class="article-body">, logo após o fechamento
// de um parágrafo próximo à metade do conteúdo — para criar curiosidade em vez
// de aparecer só no rodapé, onde o leitor já decidiu se vai continuar ou não.
function insertMidArticle(html, box) {
  const re = /(<div class="article-body">)([\s\S]*?)(<div class="article-tags">)/;
  let inserted = false;
  const result = html.replace(re, (full, openTag, body, closeTag) => {
    const positions = [];
    const paraCloseRegex = /<\/p>\s*\n/g;
    let m;
    while ((m = paraCloseRegex.exec(body))) positions.push(m.index + m[0].length);
    if (positions.length < 2) return full;
    const mid = positions[Math.floor(positions.length / 2) - 1];
    inserted = true;
    return openTag + body.slice(0, mid) + '\n' + box + body.slice(mid) + closeTag;
  });
  return inserted ? result : null;
}

function main() {
  if (!fs.existsSync(LINKS_PATH)) {
    console.log('content-externo/links.json não encontrado. Nada a fazer.');
    return;
  }
  const links = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'));
  let applied = 0;

  for (const entry of links) {
    if (entry.status === 'aplicado') continue;
    const hasAnyUrl = entry.substackUrl || entry.mediumUrl || entry.linkedinUrl;
    if (!hasAnyUrl) continue;

    const filePath = path.join(BLOG_DIR, `${entry.slug}.html`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Aviso: ${filePath} não existe, pulando pauta #${entry.pautaId}.`);
      continue;
    }

    const box = buildBox(entry);
    if (!box) continue;

    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('article-continue-box')) {
      // já tem a caixa (reaplicação manual) — não duplica
      entry.status = 'aplicado';
      applied += 1;
      continue;
    }

    const midResult = insertMidArticle(html, box);
    if (midResult) {
      html = midResult;
    } else {
      // Fallback: artigo com poucos parágrafos — insere antes do rodapé, dentro de um container.
      const wrapped = `<section class="article-section"><div class="container">\n${box}</div></section>\n\n`;
      html = html.replace(/(<footer class="footer">)/, `${wrapped}$1`);
    }
    fs.writeFileSync(filePath, html, 'utf8');
    entry.status = 'aplicado';
    applied += 1;
    console.log(`Links externos aplicados em blog/${entry.slug}.html (pauta #${entry.pautaId}).`);
  }

  fs.writeFileSync(LINKS_PATH, JSON.stringify(links, null, 2) + '\n', 'utf8');
  console.log(applied ? `${applied} artigo(s) atualizado(s).` : 'Nenhuma pauta pendente com links preenchidos.');
}

main();
