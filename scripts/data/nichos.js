// 8 nichos/segmentos de cliente para o SEO Programático nichado (Limpeza e Portaria).
// Cada nicho carrega vocabulário e necessidades próprias (dor, compliance, exemplo, FAQ)
// usados pelo motor de composição de parágrafos — não é find-and-replace de nome.
'use strict';

const NICHOS = [
  {
    slug: 'escritorios',
    nome: 'Escritórios',
    nomeSingular: 'escritório',
    dor: 'ambientes que precisam estar sempre apresentáveis para colaboradores, clientes e visitantes, sem interromper a rotina de trabalho',
    compliance: 'rotinas discretas, organizadas fora do horário comercial ou em janelas específicas do dia, para não atrapalhar reuniões e atendimentos',
    exemplo: 'salas de reunião, recepção, copa e estações de trabalho',
    faqExtra: [
      ['A limpeza de escritórios pode ser feita fora do horário comercial em {cidade}?', 'Sim. Definimos a janela de atendimento conforme a rotina do escritório em {cidade}, incluindo turnos fora do horário comercial quando necessário.'],
      ['É possível incluir copa e áreas de convivência no escopo?', 'Sim. O escopo é definido conforme o layout do escritório, podendo incluir copa, salas de reunião e áreas de convivência além das estações de trabalho.'],
    ],
  },
  {
    slug: 'empresas',
    nome: 'Empresas',
    nomeSingular: 'empresa',
    dor: 'operações que não podem parar por falta de profissional, atraso na escala ou gestão trabalhista mal estruturada',
    compliance: 'contrato claro, SLA definido e gestão trabalhista assumida integralmente pela PS Proteção',
    exemplo: 'áreas administrativas, operacionais e de circulação da empresa',
    faqExtra: [
      ['Como a terceirização reduz custos para empresas em {cidade}?', 'A empresa deixa de arcar com custos de contratação, treinamento, encargos e substituição de equipe própria — a PS Proteção assume toda a gestão trabalhista da operação em {cidade}.'],
      ['A PS Proteção atende empresas de diferentes portes em {cidade}?', 'Sim. Dimensionamos a operação proporcionalmente ao porte da empresa, de escritórios pequenos a operações com múltiplos setores em {cidade}.'],
    ],
  },
  {
    slug: 'industrias',
    nome: 'Indústrias',
    nomeSingular: 'indústria',
    dor: 'resíduos de óleo, poeira industrial e áreas técnicas de difícil acesso que exigem equipamento e procedimento específicos',
    compliance: 'procedimentos alinhados às normas de segurança do trabalho, incluindo uso correto de EPIs e cuidados com a NR-33 em espaços confinados',
    exemplo: 'chão de fábrica, áreas técnicas, vestiários e refeitórios',
    faqExtra: [
      ['A equipe está preparada para os riscos de um ambiente industrial em {cidade}?', 'Sim. Os profissionais recebem treinamento específico sobre procedimentos de segurança, uso de EPIs e riscos do ambiente industrial antes de assumir o posto em {cidade}.'],
      ['É possível atender fábricas com operação em turnos em {cidade}?', 'Sim. Dimensionamos a equipe conforme os turnos de produção da indústria em {cidade}, incluindo operação noturna e finais de semana quando necessário.'],
    ],
  },
  {
    slug: 'escolas',
    nome: 'Escolas',
    nomeSingular: 'escola',
    dor: 'ambientes que precisam de higienização rigorosa e produtos adequados, sem expor crianças e adolescentes a riscos',
    compliance: 'seleção de profissionais e uso de produtos adequados ao convívio com crianças e adolescentes, com rotina organizada fora do período de aula',
    exemplo: 'salas de aula, banheiros, pátio e refeitório',
    faqExtra: [
      ['Os profissionais alocados em escolas passam por alguma seleção adicional em {cidade}?', 'Sim. A seleção de profissionais para ambiente escolar em {cidade} segue critérios adicionais de perfil e conduta, além do treinamento padrão da PS Proteção.'],
      ['A limpeza é feita fora do horário de aula em {cidade}?', 'Sim. A rotina é organizada para não interferir nas atividades pedagógicas, com higienização de salas, banheiros e áreas comuns fora ou entre os períodos de aula em {cidade}.'],
    ],
  },
  {
    slug: 'postos-de-saude',
    nome: 'Postos de Saúde',
    nomeSingular: 'posto de saúde',
    dor: 'controle de infecção, biossegurança e descarte adequado de resíduos em ambientes de atendimento à saúde',
    compliance: 'procedimentos de biossegurança e higienização compatíveis com as boas práticas de estabelecimentos de saúde',
    exemplo: 'consultórios, salas de espera, banheiros e áreas de descarte de resíduos',
    faqExtra: [
      ['A limpeza de postos de saúde segue procedimentos de biossegurança em {cidade}?', 'Sim. A operação em unidades de saúde em {cidade} segue procedimentos de higienização e biossegurança compatíveis com as boas práticas do setor, incluindo separação de materiais por área.'],
      ['Os profissionais recebem treinamento específico para ambiente de saúde?', 'Sim. A equipe alocada em postos de saúde em {cidade} recebe treinamento sobre procedimentos de higienização, uso de EPIs e descarte adequado de resíduos.'],
    ],
  },
  {
    slug: 'shopping',
    nome: 'Shoppings',
    nomeSingular: 'shopping',
    dor: 'grande fluxo de pessoas, áreas comuns extensas e necessidade de operação contínua durante todo o horário de funcionamento',
    compliance: 'equipe dimensionada para cobrir picos de movimento sem comprometer a experiência do visitante',
    exemplo: 'praça de alimentação, banheiros públicos, corredores e estacionamento',
    faqExtra: [
      ['Como funciona a operação em áreas de grande circulação, como shoppings, em {cidade}?', 'Dimensionamos a equipe para cobrir o fluxo de visitantes ao longo de todo o horário de funcionamento, com rondas frequentes em áreas críticas como banheiros e praça de alimentação em {cidade}.'],
      ['É possível integrar a equipe com a segurança do shopping em {cidade}?', 'Sim. A operação é estruturada em conjunto com a administração do shopping em {cidade}, alinhando procedimentos, horários e pontos de atenção.'],
    ],
  },
  {
    slug: 'condominios',
    nome: 'Condomínios',
    nomeSingular: 'condomínio',
    dor: 'controle de acesso de moradores e visitantes, recebimento de encomendas e áreas comuns que precisam de manutenção constante',
    compliance: 'procedimentos alinhados às normas internas definidas pelo síndico e pelo regimento do condomínio',
    exemplo: 'portaria, hall de entrada, áreas comuns e salão de festas',
    faqExtra: [
      ['Como funciona a relação da equipe com o síndico do condomínio em {cidade}?', 'A equipe segue as normas internas definidas pelo síndico e pelo regimento do condomínio em {cidade}, com alinhamento periódico sobre rotinas e ocorrências.'],
      ['É possível ter cobertura nos finais de semana e feriados em {cidade}?', 'Sim. Dimensionamos escalas que cobrem finais de semana e feriados conforme a necessidade do condomínio em {cidade}.'],
    ],
  },
  {
    slug: 'predios',
    nome: 'Prédios',
    nomeSingular: 'prédio',
    dor: 'coordenação entre múltiplos andares, empresas e prestadores de serviço em um mesmo edifício',
    compliance: 'procedimentos de acesso organizados por andar ou empresa, com comunicação constante com a administração do prédio',
    exemplo: 'hall de entrada, elevadores, escadas e áreas técnicas comuns',
    faqExtra: [
      ['Como funciona o controle de acesso em prédios com múltiplas empresas em {cidade}?', 'O controle de acesso é organizado por andar ou empresa, conforme as regras definidas pela administração do prédio em {cidade}, incluindo cadastro de visitantes e prestadores de serviço.'],
      ['A limpeza de prédios comerciais inclui áreas técnicas e comuns em {cidade}?', 'Sim. O escopo pode incluir hall de entrada, elevadores, escadas e áreas técnicas comuns, além dos andares ocupados pelas empresas, conforme contrato em {cidade}.'],
    ],
  },
];

module.exports = { NICHOS };
