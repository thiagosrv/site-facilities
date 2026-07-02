// 8 variações de serviço (4 Limpeza + 4 Portaria) para o SEO Programático nichado.
// "parent" aponta para SERVICES.limpeza / SERVICES.portaria (services.js) para reaproveitar
// imagem, ícone-base e schemaDescription geral — o "angulo" é o diferencial de cada variação.
'use strict';

const SERVICE_VARIANTS = [
  {
    slug: 'limpeza',
    nome: 'Limpeza',
    nomeCurto: 'Limpeza',
    parent: 'limpeza',
    icon: 'sparkles',
    angulo: 'rotina completa de limpeza e conservação, com Procedimento Operacional Padrão (POP) definido, produtos adequados a cada ambiente e supervisão periódica',
    faqExtra: [
      ['O que está incluso no serviço de limpeza terceirizada?', 'A rotina de limpeza inclui conservação diária, produtos adequados a cada tipo de superfície e supervisão periódica, conforme o escopo definido em contrato.'],
      ['Como é feita a reposição em caso de falta do profissional?', 'Contamos com equipe de reserva treinada para cobrir faltas e afastamentos, evitando que o posto de limpeza fique descoberto.'],
    ],
  },
  {
    slug: 'auxiliar-de-limpeza',
    nome: 'Auxiliar de Limpeza',
    nomeCurto: 'Auxiliar de Limpeza',
    parent: 'limpeza',
    icon: 'users',
    angulo: 'profissional de apoio que reforça a equipe já existente ou atua em operações menores, com dimensionamento flexível de horas e dias',
    faqExtra: [
      ['O auxiliar de limpeza pode atuar poucas horas por dia ou dias específicos da semana?', 'Sim. O auxiliar de limpeza é dimensionado conforme a necessidade — período parcial, dias alternados ou reforço pontual da equipe.'],
      ['Qual a diferença entre contratar um auxiliar de limpeza e uma equipe completa?', 'O auxiliar de limpeza é indicado para operações menores ou para reforçar uma equipe já existente, sem a estrutura de uma operação completa de limpeza terceirizada.'],
    ],
  },
  {
    slug: 'limpeza-tecnica',
    nome: 'Limpeza Técnica',
    nomeCurto: 'Limpeza Técnica',
    parent: 'limpeza',
    icon: 'wrench',
    angulo: 'limpeza especializada de pisos técnicos, vidros em altura, estofados, pós-obra e ambientes que exigem equipamento e capacitação específicos',
    faqExtra: [
      ['Quais serviços entram na limpeza técnica?', 'A limpeza técnica cobre demandas específicas como vidros em altura, pisos técnicos, estofados, pós-obra e outras superfícies que exigem equipamento e capacitação especializados.'],
      ['A limpeza técnica é contratada de forma pontual ou recorrente?', 'Pode ser contratada tanto de forma pontual — como em pós-obra — quanto recorrente, conforme a necessidade do ambiente.'],
    ],
  },
  {
    slug: 'limpeza-corporativa',
    nome: 'Limpeza Corporativa',
    nomeCurto: 'Limpeza Corporativa',
    parent: 'limpeza',
    icon: 'building-2',
    angulo: 'cuidado com a apresentação e a imagem do ambiente corporativo, com rotina discreta e atenção especial às áreas de recepção de clientes e visitantes',
    faqExtra: [
      ['A limpeza corporativa tem foco diferente da limpeza terceirizada tradicional?', 'A limpeza corporativa dá atenção especial à apresentação do ambiente — recepção, salas de reunião e áreas de atendimento a clientes — mantendo a rotina discreta durante o expediente.'],
      ['É possível adaptar a rotina à agenda de reuniões e eventos da empresa?', 'Sim. A rotina pode ser ajustada conforme a agenda da empresa, evitando conflito com reuniões, eventos e horários de maior movimento.'],
    ],
  },
  {
    slug: 'portaria',
    nome: 'Portaria',
    nomeCurto: 'Portaria',
    parent: 'portaria',
    icon: 'shield-check',
    angulo: 'controle de entrada e saída, registro de ocorrências e procedimentos padronizados para o dia a dia e para situações de emergência',
    faqExtra: [
      ['Quais serviços de portaria terceirizada estão inclusos?', 'A portaria terceirizada inclui controle de acesso, recebimento de encomendas, registro de ocorrências e cumprimento do Procedimento Operacional Padrão (POP) definido para o posto.'],
      ['A escala de portaria pode ser ajustada conforme a necessidade do cliente?', 'Sim. A escala é dimensionada conforme o perfil de acesso e o horário de funcionamento do local.'],
    ],
  },
  {
    slug: 'portaria-24-horas',
    nome: 'Portaria 24 Horas',
    nomeCurto: 'Portaria 24h',
    parent: 'portaria',
    icon: 'moon',
    angulo: 'cobertura contínua em regime de turnos, incluindo período noturno, finais de semana e feriados, com escala de revezamento organizada',
    faqExtra: [
      ['Como funciona a escala de revezamento na portaria 24 horas?', 'A escala é organizada em turnos de revezamento, garantindo cobertura contínua do posto — incluindo período noturno, finais de semana e feriados.'],
      ['Há diferença de procedimento entre o turno diurno e o noturno?', 'Os procedimentos seguem o mesmo padrão operacional, com atenção adicional a protocolos de segurança e comunicação de ocorrências durante o período noturno.'],
    ],
  },
  {
    slug: 'controle-de-acesso',
    nome: 'Controle de Acesso',
    nomeCurto: 'Controle de Acesso',
    parent: 'portaria',
    icon: 'fingerprint',
    angulo: 'gestão do fluxo de pessoas com cadastro de visitantes, integração a sistemas de controle e catracas, com foco em processo e rastreabilidade',
    faqExtra: [
      ['O controle de acesso inclui sistemas eletrônicos, como catracas e crachás?', 'Conforme o escopo do contrato, a operação pode incluir integração com sistemas de controle de acesso eletrônico, cadastro de visitantes e registro digital de entrada e saída.'],
      ['Como é feito o cadastro de visitantes e prestadores de serviço?', 'O cadastro segue um Procedimento Operacional Padrão (POP) definido com o cliente, com identificação, registro e liberação conforme as regras estabelecidas.'],
    ],
  },
  {
    slug: 'portaria-condominial',
    nome: 'Portaria Condominial',
    nomeCurto: 'Portaria Condominial',
    parent: 'portaria',
    icon: 'home',
    angulo: 'atendimento a moradores e visitantes com foco residencial, recebimento de encomendas e comunicação direta com o síndico',
    faqExtra: [
      ['A portaria condominial atende moradores e visitantes de forma diferenciada?', 'Sim. O porteiro segue procedimentos específicos para identificar e liberar moradores, visitantes e prestadores de serviço, conforme as regras do condomínio.'],
      ['Como funciona o recebimento de encomendas na portaria condominial?', 'O recebimento de encomendas segue um processo de registro e armazenamento até a retirada pelo morador, conforme o procedimento definido com o síndico.'],
    ],
  },
];

module.exports = { SERVICE_VARIANTS };
