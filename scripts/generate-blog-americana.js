// Publica os 10 posts de blog hiperlocais de Americana a partir dos rascunhos em
// scripts/data/americana-posts-drafts/*.json (conteúdo já escrito, sem chamada à OpenAI).
// Reaproveita o mesmo template/HTML/schema do gerador padrão (generate-blog-post.js).
// Uso: node scripts/generate-blog-americana.js
const fs = require('fs');
const path = require('path');
const {
  buildPostHtml, updateBlogIndex, updateSitemap, findCategory,
  todayISO, readExistingPosts, BLOG_DIR, SITE,
} = require('./generate-blog-post.js');

const DRAFTS_DIR = path.join(__dirname, 'data', 'americana-posts-drafts');

// slug (nome do arquivo) -> categoria (deve bater com scripts/data/blog-categories.js)
const ORDER = [
  ['portaria-terceirizada-em-americana-sp-como-escolher', 'portaria'],
  ['limpeza-terceirizada-em-americana-sp-guia-completo', 'limpeza'],
  ['seguranca-patrimonial-em-americana-o-papel-da-portaria-profissional', 'portaria'],
  ['portaria-condominial-em-americana-o-que-o-sindico-precisa-saber', 'portaria'],
  ['limpeza-tecnica-em-americana-clinicas-laboratorios-e-industrias', 'limpeza'],
  ['controle-de-acesso-para-empresas-em-americana-como-funciona', 'portaria'],
  ['limpeza-para-escolas-em-americana-protocolos-de-higienizacao', 'limpeza'],
  ['facilities-para-industrias-em-americana-portaria-limpeza-e-nr33', 'facilities'],
  ['zeladoria-preventiva-em-condominios-de-americana', 'zeladoria'],
  ['quanto-custa-terceirizar-portaria-e-limpeza-em-americana-sp', 'contratacao-gestao'],
];

function countWords(str) {
  return typeof str === 'string' ? (str.match(/\S+/g) || []).length : 0;
}
function sumWords(arr) {
  return Array.isArray(arr) ? arr.reduce((acc, s) => acc + countWords(s), 0) : 0;
}
function countWordsCurto(post) {
  let words = sumWords(post.intro) + sumWords(post.closing);
  for (const section of post.sections || []) words += sumWords(section.paragraphs);
  return words;
}

function main() {
  let existingPosts = readExistingPosts();
  const existingSlugs = new Set(existingPosts.map(p => p.slug));
  const dateISO = todayISO();

  let published = 0;
  for (const [slug, categorySlug] of ORDER) {
    const draftPath = path.join(DRAFTS_DIR, `${slug}.json`);
    if (!fs.existsSync(draftPath)) {
      console.error(`FALTA: ${slug}.json não encontrado em ${DRAFTS_DIR}`);
      continue;
    }
    const post = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
    const category = findCategory(categorySlug);
    const url = `${SITE}/blog/${slug}.html`;
    const words = countWordsCurto(post);
    console.log(`- ${slug}: ${words} palavras (curto), categoria ${category.nome}`);

    if (existingSlugs.has(slug)) {
      console.log(`  (já existe blog/${slug}.html — pulando geração do arquivo, mas mantendo no índice/sitemap se necessário)`);
    } else {
      const related = existingPosts.slice(-3).reverse();
      const html = buildPostHtml({ post, category, slug, dateISO, related });
      fs.writeFileSync(path.join(BLOG_DIR, `${slug}.html`), html, 'utf8');
      updateBlogIndex({ post, category, slug, dateISO, url });
      updateSitemap({ url, dateISO });
      published++;
      // Atualiza a lista local para que os "related" dos próximos posts já considerem os anteriores.
      existingPosts.push({
        slug, title: post.title, categoryIcon: category.icon, categoryNome: category.nome,
        image: 'blog.webp', alt: category.alt, dateLabel: dateISO,
      });
      existingSlugs.add(slug);
    }
  }
  console.log(`\nTotal publicado: ${published}/${ORDER.length}`);
}

main();
