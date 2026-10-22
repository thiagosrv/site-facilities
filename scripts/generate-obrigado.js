// Gera as páginas de obrigado (uma por serviço) a partir do cabeçalho/rodapé do contato.html.
// Uso: node scripts/generate-obrigado.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(root, 'contato.html'), 'utf8');

const PAGES = [
  {
    file: 'obrigado-limpeza.html',
    image: 'pagina-obrigado-limpeza.webp',
    alt: 'Equipe de limpeza e conservação da PS Proteção',
    servico: 'Limpeza e Conservação',
    lead: 'Recebemos seu pedido de Limpeza e Conservação. Um consultor vai falar com você, tirar suas dúvidas e entender a sua demanda para montar uma proposta sob medida.',
  },
  {
    file: 'obrigado-portaria.html',
    image: 'pagina-obrigado-porteiro.webp',
    alt: 'Porteiro da PS Proteção em atendimento',
    servico: 'Portaria e Controle de Acesso',
    lead: 'Recebemos seu pedido de Portaria e Controle de Acesso. Um consultor vai falar com você, tirar suas dúvidas e entender a sua demanda para montar uma proposta sob medida.',
  },
  {
    file: 'obrigado.html',
    image: 'pagina-obrigado-geral.webp',
    alt: 'Atendimento PS Proteção',
    servico: 'Facilities',
    lead: 'Recebemos seu pedido. Um consultor vai falar com você, tirar suas dúvidas e entender a sua demanda para montar uma proposta sob medida.',
  },
];

const headEnd = tpl.indexOf('</head>');
const headerStart = tpl.indexOf('<header id="header"');
const headerEnd = tpl.indexOf('</header>') + '</header>'.length;
const footerStart = tpl.indexOf('<footer class="footer">');
const footerEnd = tpl.indexOf('</footer>') + '</footer>'.length;
const floatStart = tpl.indexOf('<a href="https://wa.me/5519982892037"');

let head = tpl.slice(0, headEnd);
// Remove SEO/social e CSS específico do contato; a página de obrigado não é indexada.
head = head
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Obrigado! Recebemos seu pedido | PS Proteção</title>')
  .replace(/\s*<meta name="description"[^>]*>/, '')
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow">')
  .replace(/\s*<meta property="og:[^>]*>/g, '')
  .replace(/\s*<meta name="twitter:[^>]*>/g, '')
  .replace(/\s*<!-- Twitter Card -->/, '')
  .replace(/\s*<style>[\s\S]*?<\/style>/, '')
  .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');

const header = tpl.slice(headerStart, headerEnd);
const footer = tpl.slice(footerStart, footerEnd);
const tail = tpl.slice(floatStart);

function esc(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

function main(p) {
  return `<main class="thanks-main">
  <div class="container">
    <div class="thanks-grid">
      <div class="thanks-copy">
        <span class="thanks-check" aria-hidden="true"><i data-lucide="check" style="width:30px;height:30px"></i></span>
        <h1 class="thanks-title">Obrigado!</h1>
        <h2 class="thanks-lead" id="thanks-lead">${p.lead}</h2>
      </div>
      <div class="thanks-chatwrap">
        <dl class="thanks-id" id="thanks-id" hidden>
          <div><dt>Nome</dt><dd id="thanks-id-nome"></dd></div>
          <div id="thanks-id-empresa-row" hidden><dt>Empresa</dt><dd id="thanks-id-empresa"></dd></div>
        </dl>
        <div class="thanks-chat" aria-live="polite">
          <div class="thanks-chat-head">
            <img src="alvaro.webp" alt="Álvaro, consultor da PS Proteção" width="44" height="44">
            <div>
              <div class="thanks-chat-name">Álvaro · Consultor PS Proteção</div>
              <div class="thanks-chat-status"><span class="wa-online-dot"></span>online agora</div>
            </div>
          </div>
          <div class="thanks-bubble is-in" id="thanks-greet">Olá, me chamo Álvaro.</div>
          <div class="thanks-bubble is-in">Você será redirecionado(a) para o meu WhatsApp agora.</div>
        </div>

        <div class="thanks-progress" id="thanks-progress">
          <span class="thanks-progress-label" id="thanks-progress-label">Abrindo o WhatsApp com o Álvaro em instantes...</span>
          <div class="thanks-progress-bar"><span class="thanks-progress-fill" id="thanks-progress-fill"></span></div>
        </div>
        <div class="thanks-actions">
          <a class="btn btn-gold" id="thanks-wa" href="https://wa.me/5519982892037" data-wa-direct rel="noopener">Abrir o WhatsApp agora</a>
          <button type="button" class="thanks-cancel" id="thanks-cancel">Não abrir automaticamente</button>
        </div>
      </div>
      <div class="thanks-media">
        <img src="${p.image}" alt="${esc(p.alt)}" width="400" height="600">
      </div>
    </div>
  </div>
</main>
<script>
(function () {
  var WA = '5519982892037';
  var lead = null;
  try { lead = JSON.parse(sessionStorage.getItem('ps_lead')); sessionStorage.removeItem('ps_lead'); } catch (e) {}

  var link = document.getElementById('thanks-wa');
  var fill = document.getElementById('thanks-progress-fill');
  var label = document.getElementById('thanks-progress-label');
  var cancel = document.getElementById('thanks-cancel');
  var hour = new Date().getHours();
  document.getElementById('thanks-greet').textContent = (hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite') + ', me chamo Álvaro.';

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'thank_you_view', thank_you_service: '${p.servico}' });

  // Sem dados do formulário (acesso direto/recarregamento): só o botão, sem redirecionar sozinho.
  if (!lead || !lead.nome) {
    document.getElementById('thanks-progress').hidden = true;
    cancel.hidden = true;
    link.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Olá, gostaria de solicitar uma cotação. Obrigado(a)!');
    return;
  }

  document.getElementById('thanks-id-nome').textContent = lead.nome;
  if (lead.empresa) {
    document.getElementById('thanks-id-empresa').textContent = lead.empresa;
    document.getElementById('thanks-id-empresa-row').hidden = false;
  }
  document.getElementById('thanks-id').hidden = false;
  // Caracteres de formatação do WhatsApp dentro dos dados quebrariam o negrito/itálico.
  var clean = function (v) { return String(v || '').replace(/[*_~\x60]/g, '').trim(); };
  var lines = ['Olá! Gostaria de uma cotação de *' + clean(lead.servico) + '*.', ''];
  if (lead.empresa) lines.push('*Empresa:* ' + clean(lead.empresa));
  lines.push('*Nome:* ' + clean(lead.nome), '*Cidade:* ' + clean(lead.cidade));
  if (lead.protocolo) lines.push('*Protocolo:* ' + clean(lead.protocolo));
  var text = lines.join('\\n');
  var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  link.href = url;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = 3000, start = null, stopped = false;
  function step(ts) {
    if (stopped) return;
    if (start === null) start = ts;
    var pct = Math.min((ts - start) / DURATION, 1);
    fill.style.width = (pct * 100) + '%';
    if (pct < 1) { requestAnimationFrame(step); } else { window.location.href = url; }
  }
  if (reduce) { fill.style.width = '100%'; setTimeout(function () { if (!stopped) window.location.href = url; }, DURATION); }
  else { requestAnimationFrame(step); }

  cancel.addEventListener('click', function () {
    stopped = true;
    label.textContent = 'Tudo bem! Quando quiser, é só abrir a conversa.';
    fill.style.width = '0';
    cancel.hidden = true;
  });
})();
</script>`;
}

for (const p of PAGES) {
  const html = `${head}</head>\n<body>\n<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TBR8J899"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->\n\n${header}\n\n${main(p)}\n\n${footer}\n\n${tail}`;
  fs.writeFileSync(path.join(root, p.file), html);
  console.log('gerado', p.file);
}
