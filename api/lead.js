// Ponte entre o formulário do site e o CRM. O CRM só aceita chamadas autenticadas
// (LEADS_SITE_TOKEN); o token fica aqui, no servidor, nunca no JS do navegador.
// Variáveis de ambiente (Vercel do site): LEADS_SITE_TOKEN e, opcional, CRM_LEADS_URL.

const CRM_URL = process.env.CRM_LEADS_URL || 'https://crm-thiago-steel.vercel.app/api/leads/site';
const ORIGENS = ['https://www.protecaoeseguranca.com.br', 'https://protecaoeseguranca.com.br'];
const CAMPOS = [
  'nome', 'telefone', 'empresa', 'cnpj', 'cidade', 'servico', 'servico_rotulo',
  'consentimento_texto', 'gclid', 'pagina_origem', 'referrer', 'website',
];

function responder(res, status, corpo) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(corpo);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { ok: false, erro: 'metodo_nao_permitido' });

  const origem = req.headers.origin;
  if (origem && !ORIGENS.includes(origem) && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origem)) {
    return responder(res, 403, { ok: false, erro: 'origem_nao_permitida' });
  }

  const token = (process.env.LEADS_SITE_TOKEN || '').trim();
  if (!token) return responder(res, 500, { ok: false, erro: 'configuracao_ausente' });

  const entrada = req.body && typeof req.body === 'object' ? req.body : null;
  if (!entrada) return responder(res, 400, { ok: false, erro: 'corpo_invalido' });

  const lead = {};
  for (const campo of CAMPOS) {
    if (typeof entrada[campo] === 'string') lead[campo] = entrada[campo].slice(0, 500);
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 64);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const crm = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(ip ? { 'X-Visitor-IP': ip } : {}),
      },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    const dados = await crm.json().catch(() => ({}));
    if (!crm.ok) return responder(res, crm.status, { ok: false, erro: dados.erro || 'falha_no_crm' });
    return responder(res, 200, { ok: true, protocolo: dados.protocolo ?? null });
  } catch (err) {
    return responder(res, 502, { ok: false, erro: 'crm_indisponivel' });
  } finally {
    clearTimeout(timer);
  }
};
