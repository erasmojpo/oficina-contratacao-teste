// Conteúdo das atividades exibido no celular e na tela. NÃO contém respostas (ficam no banco e em gabarito.js).
// Todos os casos, nomes e atos são fictícios.
(function () {
  const VF = [{ id: 'v', t: 'Verdadeiro' }, { id: 'f', t: 'Falso' }];
  const PODE = [{ id: 's', t: 'Pode' }, { id: 'n', t: 'Não pode' }];
  const ESCALA = [{ id: '1', t: '1 · Nada' }, { id: '2', t: '2 · Pouco' }, { id: '3', t: '3 · Em parte' }, { id: '4', t: '4 · Bastante' }, { id: '5', t: '5 · Totalmente' }];
  const FALTA_DIST = [{ id: 'm', t: 'Autorização do Ministério da Educação' }, { id: 'p', t: 'Parecer da Procuradoria Federal' }, { id: 'z', t: 'Nada falta' }];

  window.OFC_CAMPI = ['Reitoria', 'Apodi', 'Caicó', 'Canguaretama', 'Ceará-Mirim', 'Currais Novos', 'Ipanguaçu', 'João Câmara', 'Jucurutu',
    'Lajes', 'Macau', 'Mossoró', 'Natal - Central', 'Natal - Centro Histórico', 'Natal - Zona Leste', 'Natal - Zona Norte', 'Nova Cruz',
    'Parelhas', 'Parnamirim', 'Pau dos Ferros', 'Santa Cruz', 'São Gonçalo do Amarante', 'São Paulo do Potengi', 'Outro'];

  window.OFC_ATIVIDADES = {
    aquec: { titulo: 'Aquecimento', itens: [
      { tipo: 'escolha', pergunta: 'Quantos contratos de professor substituto o IFRN tinha registrados quando a auditoria extraiu os dados do SUAP?',
        opcoes: [{ id: 'a', t: '96' }, { id: 'b', t: '148' }, { id: 'c', t: '226' }, { id: 'd', t: '310' }] }
    ] },

    enquete: { titulo: 'Enquete anônima', itens: [
      { tipo: 'multi', pergunta: 'Quais destas situações já ocorreram em processos do seu campus? Marque todas as que se aplicam.',
        opcoes: [
          { id: 'e1', t: 'Solicitação inicial sem disciplina, motivo da vaga ou prazo' },
          { id: 'e2', t: 'Análise da COGPE feita, mas não registrada nos autos' },
          { id: 'e3', t: 'Falta do relatório de contratos vigentes e motivos de vaga' },
          { id: 'e4', t: 'Declaração de sigilo ou de impedimento da banca não juntada' },
          { id: 'e5', t: 'Comprovante de publicação no DOU fora dos autos' },
          { id: 'e6', t: 'E-mail de convocação não juntado' },
          { id: 'e7', t: 'Declaração de acumulação sem assinatura ou sem análise de compatibilidade' },
          { id: 'e8', t: 'Documentos do PSS espalhados em vários processos' }] }
    ] },

    quiz: { titulo: 'Pode ou não pode?', itens: [
      { tipo: 'escolha', pergunta: 'Um docente efetivo está em licença para tratamento da própria saúde por 45 dias. A DIAC pede um professor substituto.',
        opcoes: [{ id: 'a', t: 'Pode: licença para tratamento de saúde é motivo de vaga' }, { id: 'b', t: 'Não pode: só licença superior a 60 dias' },
          { id: 'c', t: 'Pode, se a Direção-Geral autorizar' }, { id: 'd', t: 'Só com parecer da PROEN' }] },
      { tipo: 'escolha', pergunta: 'A candidata foi substituta no Campus A do IFRN por 10 meses. O contrato acabou há 7 meses. Agora foi aprovada no PSS do Campus B.',
        opcoes: [{ id: 'a', t: 'Pode: é outro campus' }, { id: 'b', t: 'Pode: já se passaram mais de 6 meses' },
          { id: 'c', t: 'Não pode ainda: faltam 3 meses' }, { id: 'd', t: 'Não pode: precisa esperar 24 meses' }] },
      { tipo: 'escolha', pergunta: 'O candidato teve contrato de 4 meses no IFRN, encerrado há 5 meses. Foi aprovado em novo PSS do IFRN.',
        opcoes: [{ id: 'a', t: 'Não pode ainda: o intervalo mínimo é de 6 meses' }, { id: 'b', t: 'Pode: já passou prazo igual ao do contrato anterior' },
          { id: 'c', t: 'Não pode: precisa esperar 24 meses' }, { id: 'd', t: 'Pode, com autorização da PROEN' }] },
      { tipo: 'escolha', pergunta: 'O candidato teve contrato de 24 meses no IFPB, encerrado há 4 meses. Foi aprovado em PSS de provas e títulos do IFRN.',
        opcoes: [{ id: 'a', t: 'Não pode: precisa esperar 24 meses' }, { id: 'b', t: 'Não pode ainda: faltam 2 meses para o mínimo de 6' },
          { id: 'c', t: 'Só com parecer da Procuradoria Federal' }, { id: 'd', t: 'Pode: outra entidade federal e PSS afastam o interstício' }] },
      { tipo: 'escolha', pergunta: 'A candidata tem contrato VIGENTE de professora substituta 20h na UFRN e foi aprovada para substituta 20h no IFRN.',
        opcoes: [{ id: 'a', t: 'Não pode: precisa encerrar o contrato e cumprir interstício' }, { id: 'b', t: 'Pode, com compatibilidade de horários comprovada antes do contrato' },
          { id: 'c', t: 'Pode, sem condição: são instituições diferentes' }, { id: 'd', t: 'Não pode: é vedado acumular dois contratos temporários' }] },
      { tipo: 'escolha', pergunta: 'O aprovado no PSS de substituto é professor EFETIVO de outra instituição federal de ensino.',
        opcoes: [{ id: 'a', t: 'Pode, com compatibilidade de horários' }, { id: 'b', t: 'Pode, se o regime for de 20h' },
          { id: 'c', t: 'Não pode: a exceção da lei não alcança cargo efetivo de magistério federal' }, { id: 'd', t: 'Pode, com autorização do órgão de origem' }] },
      { tipo: 'escolha', pergunta: 'O contrato do substituto completa 2 anos e o afastamento do efetivo continua. A DIAC pede mais 6 meses de prorrogação.',
        opcoes: [{ id: 'a', t: 'Não pode: o prazo total máximo é de 2 anos' }, { id: 'b', t: 'Pode, enquanto durar o afastamento' },
          { id: 'c', t: 'Pode, uma única vez, por até 6 meses' }, { id: 'd', t: 'Pode, com autorização da PROEN' }] },
      { tipo: 'escolha', pergunta: 'PSS de professor visitante sem doutores aprovados. O primeiro colocado é mestre há 3 anos, com duas publicações Qualis B nos últimos 5 anos.',
        opcoes: [{ id: 'a', t: 'Não pode: visitante precisa ser doutor' }, { id: 'b', t: 'Só com deliberação do CONSUP' },
          { id: 'c', t: 'Pode, mas apenas como professor substituto' }, { id: 'd', t: 'Pode, excepcionalmente, pela Res. 35/2022' }] }
    ] },

    ordem: { titulo: 'Ordene o fluxo', itens: [
      { tipo: 'ordem', pergunta: 'Coloque as etapas da contratação de substituto na ordem correta (use as setas).',
        opcoes: [
          { id: 'c1', t: 'Solicitação da DIAC no formulário padrão' },
          { id: 'c2', t: 'Análise da COGPE com relatório de contratos vigentes' },
          { id: 'c3', t: 'Autorização da Direção-Geral dentro da cota do campus' },
          { id: 'c4', t: 'Pedido de aproveitamento ao campus que realizou o certame' },
          { id: 'c5', t: 'Convocação formal com termo de compromisso' },
          { id: 'c6', t: 'Assinatura do contrato' },
          { id: 'c7', t: 'Extrato no DOU e cadastro no SIAPE' }] }
    ] },

    falta: { titulo: 'Ache o que falta', itens: [
      { tipo: 'escolha', pergunta: 'Aproveitamento de lista de outro campus. Nos autos há: solicitação da DIAC, análise da COGPE, autorização da contratação, pedido do Diretor-Geral requisitante, e-mail de convocação e termo de compromisso. O que falta?',
        opcoes: [{ id: 'a', t: 'Autorização do Diretor-Geral do campus cedente' }].concat(FALTA_DIST) },
      { tipo: 'escolha', pergunta: 'Processo seletivo próprio. Nos autos há: portaria da comissão central com declarações de sigilo, CDO, edital, extrato no DOU, portaria da banca e homologação publicada no DOU. O que falta?',
        opcoes: [FALTA_DIST[0], { id: 'a', t: 'Declaração de sigilo, impedimento e suspeição dos membros da banca' }, FALTA_DIST[1], FALTA_DIST[2]] },
      { tipo: 'escolha', pergunta: 'A candidata declarou cargo de professora na rede municipal. Nos autos há: declaração de acumulação assinada, declaração de horários do outro vínculo e minuta do contrato. O que falta?',
        opcoes: [FALTA_DIST[0], FALTA_DIST[1], { id: 'a', t: 'Parecer da DIAC sobre a compatibilidade de horários e manifestação da Direção-Geral' }, FALTA_DIST[2]] }
    ] },

    relampago: { titulo: 'Situações relâmpago', itens: [
      { tipo: 'escolha', pergunta: 'O diretor acadêmico soube que há candidato em lista de espera de outro campus e quer telefonar para saber se ele teria interesse, antes de abrir o processo.', opcoes: PODE },
      { tipo: 'escolha', pergunta: 'O campus ainda não tem a autorização da contratação, mas quer adiantar o ofício ao campus vizinho pedindo o aproveitamento da lista de espera.', opcoes: PODE }
    ] },

    vf: { titulo: 'Verdadeiro ou falso', itens: [
      { tipo: 'escolha', pergunta: 'A reserva para pessoas negras em PSS é de 20% das vagas.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Edital de PSS com uma única vaga precisa reservar vaga para cota étnico-racial.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Cotista aprovado dentro das vagas da ampla concorrência não é contado nas vagas reservadas.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Desde novembro de 2025, voltou a ser permitido pagar GECC por atividades de processo seletivo simplificado da Lei 8.745.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Coautor de artigo com um candidato pode permanecer na banca, desde que informe o fato.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'A declaração de impedimento da banca é assinada depois da homologação das inscrições.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Se o extrato do edital saiu no DOU, o comprovante não precisa estar nos autos, porque a publicação é pública.', opcoes: VF },
      { tipo: 'escolha', pergunta: 'Sem resposta do convocado em 5 dias úteis, pode-se convocar o próximo, desde que a convocação esteja juntada aos autos.', opcoes: VF }
    ] },

    caso: { titulo: 'Preencha o caso', itens: [
      { tipo: 'campos',
        pergunta: 'A professora Marina, de Química, do Campus Aurora, regime de 40h, foi autorizada a se afastar para doutorado de 01/03/2027 a 28/02/2029 (Portaria 100/2027). As aulas começam em 08/03/2027. O campus tem PSS de Química homologado em agosto de 2026, válido, com dois candidatos em lista de espera. Preencha a solicitação.',
        campos: [
          { k: 'modalidade', rotulo: 'Modalidade', opcoes: [{ id: 'sub', t: 'Professor substituto' }, { id: 'vis', t: 'Professor visitante' }, { id: 'pve', t: 'Professor visitante estrangeiro' }] },
          { k: 'hipotese', rotulo: 'Motivo da vaga', opcoes: [{ id: 'vac', t: 'Vacância do cargo' }, { id: 'ext', t: 'Afastamento para estudo ou missão no exterior' }, { id: 'pos', t: 'Afastamento para pós-graduação stricto sensu' }, { id: 'lic', t: 'Licença para tratar de assuntos particulares' }] },
          { k: 'ato', rotulo: 'Ato que gerou o motivo', opcoes: [{ id: 'nao', t: 'Não é preciso informar' }, { id: 'port', t: 'Portaria 100/2027 — 01/03/2027 a 28/02/2029' }, { id: 'edital', t: 'Edital de homologação do PSS de Química' }] },
          { k: 'regime', rotulo: 'Regime de trabalho', opcoes: [{ id: '20', t: '20 horas' }, { id: '40', t: '40 horas' }] },
          { k: 'periodo', rotulo: 'Período pretendido', opcoes: [{ id: 'p2', t: '01/03/2027 a 28/02/2029 (2 anos)' }, { id: 'p1', t: '01/03/2027 a 28/02/2028 (1 ano, prorrogável)' }, { id: 'p3', t: '08/03/2027 a 07/03/2029' }] },
          { k: 'provimento', rotulo: 'Forma de contratação sugerida', opcoes: [{ id: 'novo', t: 'Processo seletivo próprio' }, { id: 'outro', t: 'Aproveitamento de lista de outro campus' }, { id: 'proprio', t: 'Aproveitamento de lista do próprio campus' }] }
        ] }
    ] },

    sugestao: { titulo: 'Sua contribuição', itens: [
      { tipo: 'texto', pergunta: 'Os formulários ainda estão em elaboração. Que campo falta ou sobra? Sua sugestão fica registrada para análise da DIDEPE.' }
    ] },

    aval: { titulo: 'Avaliação da oficina', itens: [
      { tipo: 'escolha', pergunta: 'A oficina esclareceu dúvidas que você tinha?', opcoes: ESCALA },
      { tipo: 'escolha', pergunta: 'Você se sente mais seguro(a) para instruir um processo de contratação?', opcoes: ESCALA },
      { tipo: 'texto', pergunta: 'Que tema deve entrar na próxima capacitação?' }
    ] }
  };
})();
