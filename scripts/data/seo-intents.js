// Rotação de intenção de busca (H1) + tagline (2ª parte) para variar título/copy entre as 60 cidades
'use strict';

const INTENTS = [
  'Cotação de',
  'Orçamento de',
  'PS Proteção -',
  'Empresa de',
  'Melhor Empresa de',
  'Procurando por',
  'Terceirização de',
  'Quanto Custa',
  'Precisando de',
  'Contratar',
  'Profissionais de',
];

const TAGLINES = [
  'Com 28 Anos de Experiência.',
  'Com Procedimentos Profissional e Treinamento',
  'Com Implantação Rápida',
  'Com excelência em cada detalhe',
  'PS Proteção - Feita para servir.',
  'Servindo com Excelência e Profissionalismo',
  'Sua satisfação, nosso compromisso.',
];

// offset por serviço para não repetir a mesma combinação intent/tagline nas 2 páginas de uma mesma cidade
function pickIntent(cityIndex, serviceOffset) {
  return INTENTS[(cityIndex + serviceOffset) % INTENTS.length];
}
function pickTagline(cityIndex, serviceOffset) {
  return TAGLINES[(cityIndex + serviceOffset * 3) % TAGLINES.length];
}

module.exports = { INTENTS, TAGLINES, pickIntent, pickTagline };
