// 60 cidades-alvo do SEO Programático — Região Metropolitana de Campinas, Circuito das Águas e Piracicaba/Rio Claro
'use strict';

function slugify(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const RAW = [
  ['Campinas', 'rmc'], ['Americana', 'rmc'], ["Santa Bárbara d'Oeste", 'rmc'], ['Nova Odessa', 'rmc'],
  ['Sumaré', 'rmc'], ['Hortolândia', 'rmc'], ['Paulínia', 'rmc'], ['Valinhos', 'rmc'],
  ['Vinhedo', 'rmc'], ['Indaiatuba', 'rmc'], ['Monte Mor', 'rmc'], ['Elias Fausto', 'rmc'],
  ['Capivari', 'piracicaba'], ['Rafard', 'piracicaba'], ['Mombuca', 'piracicaba'], ['Rio das Pedras', 'piracicaba'],
  ['Piracicaba', 'piracicaba'], ['Limeira', 'piracicaba'], ['Iracemápolis', 'piracicaba'], ['Cordeirópolis', 'piracicaba'],
  ['Santa Gertrudes', 'piracicaba'], ['Rio Claro', 'piracicaba'], ['Araras', 'piracicaba'], ['Leme', 'piracicaba'],
  ['Pirassununga', 'piracicaba'], ['Porto Ferreira', 'piracicaba'], ['Santa Cruz da Conceição', 'piracicaba'],
  ['Santa Rita do Passa Quatro', 'piracicaba'], ['Descalvado', 'piracicaba'], ['Analândia', 'piracicaba'],
  ['Corumbataí', 'piracicaba'], ['Itirapina', 'piracicaba'], ['Brotas', 'piracicaba'], ['Águas de São Pedro', 'piracicaba'],
  ['São Pedro', 'piracicaba'], ['Charqueada', 'piracicaba'], ['Ipeúna', 'piracicaba'], ['Saltinho', 'piracicaba'],
  ['Tietê', 'piracicaba'], ['Cerquilho', 'piracicaba'], ['Jumirim', 'piracicaba'],
  ['Conchal', 'rmc'], ['Artur Nogueira', 'rmc'], ['Engenheiro Coelho', 'rmc'], ['Cosmópolis', 'rmc'],
  ['Holambra', 'rmc'], ['Jaguariúna', 'rmc'], ['Pedreira', 'rmc'],
  ['Amparo', 'aguas'], ['Serra Negra', 'aguas'], ['Lindóia', 'aguas'], ['Águas de Lindóia', 'aguas'],
  ['Socorro', 'aguas'], ['Monte Alegre do Sul', 'aguas'], ['Morungaba', 'aguas'],
  ['Itatiba', 'rmc'], ['Louveira', 'rmc'],
  ['Mogi Mirim', 'aguas'], ['Mogi Guaçu', 'aguas'], ['Estiva Gerbi', 'aguas'],
];

const REGION_LABEL = {
  rmc: 'Região Metropolitana de Campinas',
  piracicaba: 'Região de Piracicaba e Rio Claro',
  aguas: 'Circuito das Águas',
};

const CITIES = RAW.map(([name, region], i) => ({
  index: i,
  name,
  slug: slugify(name),
  region,
  regionLabel: REGION_LABEL[region],
}));

module.exports = { CITIES, slugify };
