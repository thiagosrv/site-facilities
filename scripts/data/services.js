// Dados dos 2 serviços em escopo do SEO Programático: Limpeza e Portaria
'use strict';

const SERVICES = {
  limpeza: {
    slug: 'limpeza',
    key: 'limpeza',
    nome: 'Limpeza Terceirizada',
    nomeCurto: 'Limpeza',
    icon: 'sparkles',
    image: 'limpeza.webp',
    imageAlt: 'Equipe de limpeza terceirizada em ação — PS Proteção',
    serviceOffset: 0,
    schemaDescription: 'Serviço de limpeza e conservação terceirizada para empresas, condomínios e instituições, com equipe treinada, supervisão contínua e procedimentos operacionais padronizados.',
    outroServico: 'portaria',

    paragraphs: {
      p1: [
        'A PS Proteção oferece limpeza terceirizada em {cidade} com equipes treinadas, supervisão contínua e mais de 28 anos de experiência em Facilities na Região Metropolitana de Campinas.',
        'Manter um ambiente limpo, organizado e seguro exige mais do que uma equipe de limpeza — exige processo. A PS Proteção estrutura operações de limpeza terceirizada em {cidade} com procedimentos definidos e profissionais capacitados.',
        'Empresas e condomínios em {cidade} contam com a PS Proteção para terceirizar a limpeza e conservação de seus ambientes, com equipes dimensionadas para cada tipo de operação.',
      ],
      p2: [
        'Nossa operação de limpeza inclui rotina de conservação definida, produtos adequados a cada tipo de superfície e supervisão periódica para garantir que os padrões sejam mantidos todos os dias.',
        'Cada posto de limpeza é implantado com Procedimento Operacional Padrão (POP), treinamento da equipe e acompanhamento constante — evitando falhas na rotina e garantindo previsibilidade para o cliente.',
        'Trabalhamos com equipe de reserva para cobertura de faltas, uniformização, EPIs e produtos de limpeza compatíveis com cada ambiente, sem deixar a operação descoberta em nenhum dia.',
      ],
      p3: [
        'Em {cidade}, atendemos empresas, condomínios e instituições que buscam um parceiro de confiança para a limpeza terceirizada, com atendimento próximo e capacidade de resposta rápida.',
        'A presença da PS Proteção na Região Metropolitana de Campinas permite atender {cidade} com agilidade — da seleção da equipe à implantação do posto de limpeza.',
        'Empresas de {cidade} que buscam reduzir custos com gestão de equipe própria de limpeza encontram na terceirização uma alternativa mais previsível e profissional.',
      ],
      p4: [
        'Diferenciais da PS Proteção: supervisão ativa, backup de profissionais, relatórios de acompanhamento e mais de 28 anos de experiência no setor de Facilities.',
        'Trabalhamos com contrato claro, equipe treinada e SLA definido — para que a limpeza terceirizada em {cidade} seja sinônimo de tranquilidade para sua empresa.',
        'Nosso compromisso é com a continuidade da operação: cobertura de faltas, supervisão constante e melhoria contínua dos processos de limpeza.',
      ],
    },

    implantacaoSubtitle: 'A PS Proteção presta serviços de limpeza terceirizada em {cidade} com SLA, Procedimentos Operacionais e Implantação Profissional — do diagnóstico do ambiente à supervisão contínua da equipe.',

    faq: [
      ['Quais tipos de limpeza a PS Proteção oferece em {cidade}?', 'Atuamos com limpeza e conservação predial, comercial e condominial em {cidade}: rotina diária, limpeza pesada, áreas comuns, vidros e ambientes técnicos, conforme o perfil de cada operação.'],
      ['Qual a diferença entre limpeza terceirizada e equipe própria?', 'Na terceirização, a PS Proteção assume a seleção, treinamento, supervisão, backup de faltas e toda a gestão trabalhista da equipe — reduzindo a carga administrativa do cliente e garantindo continuidade do serviço.'],
      ['Os produtos e materiais de limpeza são fornecidos pela empresa?', 'Sim. Os produtos, equipamentos e EPIs necessários para a operação são definidos conforme o escopo do contrato e o tipo de ambiente atendido em {cidade}.'],
      ['Como funciona a substituição em caso de falta do profissional?', 'Contamos com equipe de reserva treinada para cobrir faltas, férias e afastamentos, evitando que o posto de limpeza fique descoberto em {cidade}.'],
      ['É possível contratar limpeza apenas para alguns dias da semana?', 'Sim, o dimensionamento da equipe e a frequência são definidos conforme a necessidade de cada cliente em {cidade}, podendo ser diária, alguns dias por semana ou pontual.'],
      ['A equipe de limpeza recebe treinamento e uniforme?', 'Sim. Todos os profissionais alocados em {cidade} passam por treinamento e seguem padrão de uniformização e procedimentos operacionais da PS Proteção.'],
      ['Quanto tempo leva para implantar uma equipe de limpeza em {cidade}?', 'O prazo varia conforme o porte da operação, mas o processo de diagnóstico, seleção e implantação da equipe é estruturado para ser ágil, sem comprometer a qualidade da seleção.'],
      ['A PS Proteção atende empresas de pequeno, médio e grande porte em {cidade}?', 'Sim. Estruturamos operações de limpeza terceirizada proporcionais ao tamanho de cada cliente em {cidade}, de salas comerciais a grandes plantas industriais.'],
      ['Existe supervisão da equipe de limpeza após a implantação?', 'Sim. Realizamos supervisão periódica em campo, com acompanhamento de rotinas, cumprimento de procedimentos e relatórios de melhoria contínua.'],
      ['Como solicito um orçamento de limpeza terceirizada em {cidade}?', 'Basta entrar em contato pelo telefone (19) 3478-7799 ou pelo WhatsApp — nossa equipe faz o levantamento das necessidades e retorna com uma proposta personalizada para {cidade}.'],
    ],
  },

  portaria: {
    slug: 'portaria',
    key: 'portaria',
    nome: 'Portaria Terceirizada',
    nomeCurto: 'Portaria',
    icon: 'shield-check',
    image: 'porteiro.webp',
    imageAlt: 'Porteiro profissional em posto de controle de acesso — PS Proteção',
    serviceOffset: 4,
    schemaDescription: 'Serviço de portaria e controle de acesso terceirizado para empresas, condomínios e instituições, com profissionais treinados, supervisão contínua e procedimentos operacionais padronizados.',
    outroServico: 'limpeza',

    paragraphs: {
      p1: [
        'A PS Proteção oferece portaria terceirizada em {cidade}, com porteiros treinados, controle de acesso organizado e mais de 28 anos de experiência em Facilities.',
        'A segurança do seu prédio, empresa ou condomínio começa na portaria. A PS Proteção estrutura operações de portaria terceirizada em {cidade} com processo, treinamento e supervisão.',
        'Empresas e condomínios em {cidade} contam com a PS Proteção para terceirizar a portaria e o controle de acesso, com profissionais selecionados e capacitados.',
      ],
      p2: [
        'Nossa operação de portaria inclui controle de entrada e saída de visitantes, registro de ocorrências e procedimentos padronizados para situações do dia a dia e de emergência.',
        'Cada posto de portaria é implantado com Procedimento Operacional Padrão (POP), treinamento do porteiro e supervisão constante — reduzindo riscos e padronizando o atendimento.',
        'Trabalhamos com equipe de reserva para cobertura de faltas e afastamentos, garantindo que o posto de portaria nunca fique descoberto em {cidade}.',
      ],
      p3: [
        'Em {cidade}, atendemos empresas, condomínios e instituições que buscam um parceiro de confiança para a portaria terceirizada, com atendimento próximo e resposta rápida.',
        'A presença da PS Proteção na Região Metropolitana de Campinas permite atender {cidade} com agilidade — da seleção do porteiro à implantação do posto.',
        'Empresas de {cidade} que buscam profissionalizar o controle de acesso encontram na portaria terceirizada uma alternativa mais segura e organizada.',
      ],
      p4: [
        'Diferenciais da PS Proteção: supervisão ativa, backup de profissionais, relatórios de acompanhamento e mais de 28 anos de experiência no setor de Facilities.',
        'Trabalhamos com contrato claro, porteiros treinados e SLA definido — para que a portaria terceirizada em {cidade} seja sinônimo de segurança para sua empresa.',
        'Nosso compromisso é com a continuidade da operação: cobertura de faltas, supervisão constante e melhoria contínua dos processos de portaria.',
      ],
    },

    implantacaoSubtitle: 'A PS Proteção presta serviços de portaria terceirizada em {cidade} com SLA, Procedimentos Operacionais e Implantação Profissional — do diagnóstico do posto à supervisão contínua da equipe.',

    faq: [
      ['Quais serviços de portaria a PS Proteção oferece em {cidade}?', 'Atuamos com portaria e controle de acesso para empresas, condomínios e instituições em {cidade}, incluindo controle de visitantes, recebimento de encomendas e rondas conforme o escopo do contrato.'],
      ['Os porteiros recebem treinamento antes de assumir o posto?', 'Sim. Todo profissional alocado em {cidade} passa por treinamento sobre procedimentos operacionais, atendimento e protocolos de segurança antes de assumir o posto.'],
      ['Como funciona o controle de acesso de visitantes?', 'O porteiro segue Procedimento Operacional Padrão (POP) para identificação, registro e liberação de visitantes, prestadores de serviço e entregas, conforme as regras definidas pelo cliente.'],
      ['Há cobertura em caso de falta ou afastamento do porteiro?', 'Sim. Contamos com equipe de reserva treinada para garantir que o posto de portaria em {cidade} nunca fique descoberto.'],
      ['A portaria terceirizada em {cidade} inclui equipamentos de controle?', 'Conforme o escopo do contrato, a operação pode incluir sistemas de controle de acesso e registro digital, integrados aos procedimentos definidos para o posto.'],
      ['Quanto tempo leva para implantar um posto de portaria em {cidade}?', 'O prazo varia conforme o porte da operação, mas o processo de diagnóstico, seleção e implantação da equipe é estruturado para ser ágil, sem comprometer a qualidade da seleção.'],
      ['É possível contratar portaria 24 horas em {cidade}?', 'Sim. Dimensionamos escalas conforme a necessidade do cliente em {cidade}, incluindo cobertura em turnos, finais de semana e feriados.'],
      ['A PS Proteção atende condomínios e empresas em {cidade}?', 'Sim. Atendemos tanto condomínios residenciais quanto empresas e instituições em {cidade}, com operações dimensionadas para cada perfil de acesso.'],
      ['Como é feita a supervisão dos postos de portaria?', 'Realizamos supervisão periódica em campo, verificação de postura e cumprimento de procedimentos, com relatórios e alinhamentos constantes com o cliente.'],
      ['Como solicito um orçamento de portaria terceirizada em {cidade}?', 'Basta entrar em contato pelo telefone (19) 3478-7799 ou pelo WhatsApp — nossa equipe faz o levantamento das necessidades e retorna com uma proposta personalizada para {cidade}.'],
    ],
  },
};

module.exports = { SERVICES };
