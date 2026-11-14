// Roteiro da apresentação: sequência de passos exibidos na tela. Carregado apenas por tela.html.
// tipos: capa, cadastro, slide, atividade, mural, ranking, fim
(function () {
  const B = ['', 'Abertura', 'O que a auditoria encontrou', 'Pode ou não pode contratar?', 'Instrução processual', 'PSS sem falhas', 'Formulário padrão', 'Dúvidas e compromissos'];
  const S = (b, titulo, html) => ({ tipo: 'slide', bloco: b, titulo, html });
  const A = (b, atividade, n) => Array.from({ length: n }, (_, i) => ({ tipo: 'atividade', bloco: b, atividade, item: i }));
  const ul = itens => '<ul class="pontos">' + itens.map(i => '<li>' + i + '</li>').join('') + '</ul>';
  const ol = itens => '<ol class="pontos num">' + itens.map(i => '<li>' + i + '</li>').join('') + '</ol>';
  const tb = (cab, linhas) => '<table class="tb"><thead><tr>' + cab.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
    linhas.map(l => '<tr>' + l.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  const nums = itens => '<div class="numeros">' + itens.map(i => '<div class="numero"><b>' + i[0] + '</b><span>' + i[1] + '</span></div>').join('') + '</div>';
  const nota = t => '<p class="nota">' + t + '</p>';

  window.OFC_BLOCOS = B;
  // Orçamento de minutos por bloco. Soma 125, para terminar 15 minutos antes das 10h20.
  window.OFC_MINUTOS = [0, 10, 12, 24, 26, 20, 20, 13];
  window.OFC_ROTEIRO = [].concat(
    [{ tipo: 'capa', bloco: 1 }, { tipo: 'cadastro', bloco: 1 },
      S(1, 'Por que estamos aqui', ul([
        'A oficina nasce do <b>Relatório de Auditoria 8/2026</b> e do compromisso de capacitação periódica firmado com a Auditoria Interna.',
        'A auditoria <b>não encontrou contratação fora das hipóteses legais</b>. O problema está na instrução dos processos.',
        'Ao longo da manhã vocês vão responder pelo celular: cada atividade abre com um QR code na tela.',
        'Ao final, todos terão testado os <b>formulários padrão</b> que vão passar a iniciar os processos.'])),
      S(1, 'O roteiro da manhã', tb(['', 'Bloco', 'No celular'], [
        ['<b>1</b>', 'Abertura e cadastro', 'Entrar e aquecer'],
        ['<b>2</b>', 'O que a auditoria encontrou', 'Enquete anônima'],
        ['<b>3</b>', 'Pode ou não pode contratar?', 'Quiz de 8 casos'],
        ['<b>4</b>', 'Instrução processual', 'Ordenar o fluxo e achar o que falta'],
        ['<b>5</b>', 'Processo seletivo sem falhas', 'Verdadeiro ou falso'],
        ['<b>6</b>', 'Formulário padrão', 'Preencher um caso e sugerir'],
        ['<b>7</b>', 'Dúvidas e compromissos', 'Mural de dúvidas e avaliação']]) +
        nota('Duas horas e vinte. Cada atividade abre com um QR code na tela, e os blocos 3 a 6 valem pontos: há ranking individual e por campus.')),
      { tipo: 'slide', bloco: 1, titulo: 'Dúvidas: envie e vote quando quiser', qr: '?t=mural', qrRotulo: 'Abrir o mural', html: ol([
        'No celular, toque na aba <b>Dúvidas</b>, no rodapé da tela.',
        'Escreva sua pergunta e toque em <b>Enviar dúvida</b>. Ela aparece para todos, <b>sem o seu nome</b>.',
        'Nas dúvidas dos colegas, toque no <b>▲</b> ao lado para votar. Toque de novo para retirar o voto.',
        'No fim da oficina respondemos as <b>mais votadas</b>.']) +
        nota('Não espere o final: assim que surgir uma pergunta, envie. Quanto mais cedo ela estiver no mural, mais gente vota nela.') },
      S(1, 'Antes de começar, uma estimativa', ul([
        'A auditoria examinou os contratos de professor substituto de 2025, em todos os campi.',
        'A primeira pergunta é só para aquecer: <b>não vale pontos</b>.',
        'Leia o QR code da próxima tela e responda no celular.']))],

    A(1, 'aquec', 1),

    // ----- bloco 2
    [S(2, 'A auditoria em números', nums([['226', 'contratos no universo'], ['113', 'processos examinados'], ['22', 'campi na amostra'], ['0', 'contratações fora da lei']]) +
        nota('Exercício de 2025. As contratações são legais; os autos nem sempre provam isso.')),
      S(2, 'As três constatações', tb(['Constatação', 'O que é', 'Recomendação à DIGPE'], [
        ['<b>1.</b> Falhas na instrução processual', 'Documentos e registros ausentes em várias etapas, em vários campi', 'Capacitação periódica; modelo padronizado de solicitação no SUAP'],
        ['<b>2.</b> Reserva de vagas não observada', 'Um PSS sem cota étnico-racial, por desconhecimento de alteração normativa', 'Acompanhamento da atualização dos normativos internos'],
        ['<b>3.</b> Norma interna desatualizada', 'A IN 1/2021 ainda liga a consulta orçamentária e o CDO ao pagamento de GECC, então vedado em PSS', 'Atualizar a IN 1/2021; rotina de acompanhamento da legislação federal']]) +
        nota('A Constatação 3 partiu da vedação de GECC em processo seletivo. Essa vedação foi revertida em 19/11/2025, depois do período auditado. Voltamos a isso no bloco 5.')),
      S(2, 'Prazos pactuados com a Auditoria', nums([['180 dias', 'capacitação periódica'], ['90 dias', 'demais recomendações']]) +
        nota('Ata 59/2026-AUDGE. Esta oficina é a primeira edição da capacitação.'))],
    A(2, 'enquete', 1),

    // ----- bloco 3
    [S(3, 'Quando cabe professor substituto', ul([
      '<b>Vacância</b> do cargo efetivo.',
      '<b>Afastamento ou licença</b> do efetivo. Tratamento da própria saúde: só quando superior a 60 dias.',
      '<b>Nomeação</b> para reitor, vice-reitor, pró-reitor ou diretor de campus.',
      'Não cabe substituto de substituto.']) + nota('Lei 8.745/1993, art. 2º, § 1º · IN 1/2021, arts. 2º e 6º')),
      S(3, 'Limites', tb(['', 'Substituto', 'Visitante'], [
        ['Quantitativo', 'Somados, até 20% dos docentes efetivos em exercício', 'O mesmo teto'],
        ['Regime', '20h ou 40h', '20h ou 40h'],
        ['Prazo', '1 ano, até o total de 2 anos; nunca além do afastamento', 'PV: 1 ano, até 2. PVE: 2 anos, até 4'],
        ['Requisito próprio', 'Motivo de vaga válido', 'Doutor há 2 anos (exceção do art. 6º da Res. 35/2022); plano de trabalho; autorização da PROEN']])),
      S(3, 'Recontratação depois de contrato encerrado', tb(['Contrato anterior', 'Nova contratação no IFRN'], [
        ['No IFRN (qualquer campus), com menos de 24 meses', 'Só após prazo <b>igual à duração do contrato anterior</b>, nunca inferior a <b>6 meses</b>'],
        ['No IFRN, com 24 meses', 'Só após <b>24 meses</b>'],
        ['Em outra entidade federal, com PSS de provas ou de provas e títulos no IFRN', '<b>Sem interstício</b>']]) +
        nota('Lei 8.745, art. 9º, III, com a Lei 15.367/2026 · Parecer 229/2026/PF-IFRN. Campi do IFRN são a mesma pessoa jurídica: CNPJ próprio não abre a exceção.')),
      S(3, 'Contrato ainda vigente não é interstício: é acumulação', ul([
        'No máximo <b>dois vínculos de magistério</b>.',
        '<b>Compatibilidade de horários</b> comprovada antes do contrato.',
        'O candidato <b>não ocupa cargo efetivo de magistério federal</b>.',
        'Respeito ao <b>teto remuneratório</b>.']) +
        nota('Parecer 233/2026/PF-IFRN. Contratos simultâneos dentro do IFRN e situações não previstas: consulte sempre a DIDEPE antes de contratar.')),
      S(3, 'Alerta do SIAPE', ul([
        'O alerta de contrato anterior ou de acúmulo <b>não é impedimento automático</b>.',
        'Identifique a situação: contrato encerrado (interstício) ou contrato vigente (acumulação).',
        '<b>Registre a análise nos autos.</b>']))],
    A(3, 'quiz', 8),
    [S(3, 'Como isso chega ao processo', ul([
      'Na convocação, a COGPE colhe do candidato a <b>declaração de contratos temporários anteriores</b> (Anexo VII da IN 1/2021). É o documento que permite verificar tudo o que acabamos de ver.',
      'Hoje ela faz uma única pergunta: <i>houve contrato com fundamento na Lei 8.745 nos últimos 24 meses?</i>',
      'Depois da Lei 15.367/2026, um <b>sim</b> ou um <b>não</b> não resolve: é preciso saber a <b>duração</b> do contrato anterior, <b>qual entidade</b> contratou e se o vínculo <b>ainda está vigente</b>.',
      'Sem esses três dados, a COGPE não consegue dizer se o caso é interstício ou acumulação.']) +
      nota('A DIDEPE substituirá o Anexo VII por um modelo que pergunte as três coisas. Enquanto isso, peça esses dados ao candidato e registre a análise nos autos.'))],

    // ----- bloco 4
    [S(4, 'Quatro fases, nesta ordem', tb(['Fase', 'O que se decide', 'Só começa quando'], [
      ['<b>1. Solicitar</b>', 'A DIAC demonstra a necessidade e o motivo da vaga', 'Existe o ato que gera o motivo'],
      ['<b>2. Autorizar</b>', 'COGPE analisa; Direção-Geral autoriza. PROEN só se a vaga for extra', 'A solicitação está completa'],
      ['<b>3. Definir a forma de contratação</b>', 'Aproveitar lista de espera ou realizar processo seletivo próprio', 'A contratação está autorizada'],
      ['<b>4. Convocar e contratar</b>', 'Convocação formal, documentos, contrato', 'Há candidato habilitado']]) +
      nota('Erro frequente: pedir a outro campus o aproveitamento de lista sem saber se a contratação será autorizada.')),
      S(4, 'O fluxo do substituto, passo a passo', ol([
        'A <b>DIAC</b> abre o processo com o formulário padrão.',
        'A <b>COGPE</b> analisa e junta o relatório de contratos vigentes.',
        'A <b>Direção-Geral</b> autoriza dentro da cota do campus. Vaga extra sobe à PROEN.',
        'Define-se a forma de contratação: aproveitamento de lista ou processo seletivo próprio.',
        'A <b>COGPE</b> convoca por e-mail e junta a convocação.',
        'Documentos, declarações e análise de acumulação.',
        'Contrato assinado <b>antes</b> do exercício.',
        'DOU, SIAPE, e-Pessoal e módulo do SUAP.'])),
      S(4, 'Nenhum contato extraoficial com candidato', ul([
        'Ninguém da DIAC, da Direção-Geral ou da COGPE telefona, manda mensagem ou sonda candidato.',
        'O contato informal cria <b>expectativa</b> que pode não se confirmar.',
        'Depois, o candidato leva essa expectativa ao <b>Judiciário</b>.',
        'O único canal é a <b>convocação formal da COGPE</b>, por e-mail, juntada aos autos.',
        'Depois da convocação, é outra coisa: ligar para <b>confirmar o recebimento</b> é diligência, e deve ser registrada nos autos.'])),
      S(4, 'O que muda no professor visitante', ul([
        'A solicitação da DIAC já vem com o <b>plano de trabalho</b>.',
        'O processo passa pela Direção-Geral e pela <b>PROEN</b>, que autoriza.',
        'A <b>DIDEPE</b> registra a vaga no SUAP antes de a COGPE iniciar a contratação.',
        'Prorrogação: pedido com 60 dias de antecedência, relatório aprovado e novo plano.']) + nota('Res. 35/2022-CONSUP, arts. 9º, 32, 38 e 39')),
      S(4, 'Três regras de ouro', ol([
        'Análise feita e não registrada é análise que <b>não existe</b> para o controle.',
        'O que foi publicado ou enviado precisa do <b>comprovante nos autos</b>.',
        'O PSS tem <b>um processo único</b>, relacionado ao da contratação.']))],
    A(4, 'ordem', 1), A(4, 'falta', 3), A(4, 'relampago', 2),

    // ----- bloco 5
    [S(5, 'Quando o campus realiza um processo seletivo', ul([
      'Sem lista de espera para aproveitar, o campus realiza <b>processo seletivo próprio</b>: prova de desempenho didático e análise de títulos.',
      'É na condução do PSS que a auditoria mais encontrou falhas.',
      'Quatro pontos concentram o risco: <b>reserva de vagas</b>, <b>banca examinadora</b>, <b>publicidade e convocação</b> e <b>pagamento de banca</b>.',
      'Vamos a cada um deles.'])),
      S(5, 'Reserva de vagas hoje', nums([['25%', 'pessoas negras'], ['3%', 'indígenas'], ['2%', 'quilombolas'], ['5%+', 'pessoas com deficiência']]) +
        nota('Editais com duas ou mais vagas · Lei 15.142/2025 e Decreto 12.536/2025. O art. 22 da IN 1/2021 ainda fala em 20% e está superado. A DIDEPE enviará ofício circular a todos os campi.')),
      S(5, 'Cotas na prática', ul([
        'O cotista concorre <b>também</b> na ampla concorrência.',
        'Aprovado na ampla <b>não consome</b> vaga reservada: a lista de cotas avança.',
        'Quem falta à heteroidentificação segue na ampla, se tiver pontuação.',
        'É vedado fracionar vagas em vários editais para fugir da reserva.'])),
      S(5, 'Banca examinadora', ul([
        'Três titulares e até três suplentes, com titulação igual ou superior à exigida.',
        'Registre nos autos a <b>análise do perfil técnico</b>.',
        'Depois da homologação das inscrições, cada membro assina a <b>declaração de sigilo, impedimento e suspeição</b>.',
        'Impedido sai; entra o suplente.']) + nota('IN 1/2021, arts. 25 e 26 · Res. 35/2022, art. 23')),
      S(5, 'Publicidade e convocação', ul([
        'Extrato do edital e homologação no <b>DOU</b>, com os comprovantes juntados.',
        'Convocação por <b>e-mail</b>, juntada aos autos, com o comprovante de envio.',
        'O próximo candidato só é chamado após a recusa documentada ou o silêncio por <b>5 dias úteis</b>.',
        'Antes de passar ao próximo, <b>certifique-se de que a convocação chegou</b>: tente contato telefônico e registre a tentativa nos autos.']) +
        nota('O prazo protege a Administração, mas não impede o questionamento de quem não viu o e-mail ou errou o endereço na inscrição. O telefonema é diligência <b>depois</b> da convocação formal, não sondagem antes dela.')),
      S(5, 'GECC: a regra mudou', ul([
        'A auditoria apontou que a IN 1/2021 ainda exigia consulta orçamentária e CDO para GECC, à época <b>vedada</b> em processo seletivo pelo art. 4º da IN SGP/MGI 33/2023.',
        'A <b>IN CGDEP/MGI 487, de 17/11/2025</b> (DOU de 19/11/2025) alterou esse artigo: voltou a ser <b>permitido</b> pagar GECC por atividades de processo seletivo simplificado da Lei 8.745.',
        'Condições: atividade <b>eventual</b>, fora das atribuições permanentes, e apenas para <b>servidor efetivo ou em comissão</b> — contratado temporário não recebe GECC.',
        'A escolha dos servidores para essas atividades passa a exigir <b>edital</b>, com no mínimo 15 dias entre a divulgação e o início das inscrições (art. 18-A).']) +
        nota('Havendo GECC, a consulta orçamentária e o CDO voltam a fazer sentido. E o CDO permanece obrigatório para qualquer despesa do certame, como requisito do empenho. A DIADPE disciplinará o procedimento.'))],
    A(5, 'vf', 8),

    // ----- bloco 6
    [S(6, 'De onde vem o formulário padrão', ul([
      'A <b>Constatação 1</b> encontrou solicitações sem disciplina, sem motivo da vaga, sem prazo e sem referência ao calendário acadêmico.',
      'A auditoria recomendou que o IFRN criasse um <b>modelo padronizado de solicitação</b> no SUAP, para corrigir a falha <b>na origem</b> do processo.',
      'A DIDEPE está elaborando esse modelo. Ele <b>ainda não está instituído</b>.',
      'Hoje vocês veem os dois modelos e enviam sugestões, que ficam <b>registradas para análise da DIDEPE</b>.'])),
      S(6, 'Dois formulários, um para cada modalidade', ul([
        'Cada formulário só oferece as situações que a <b>lei autoriza</b>. Não há campo "outros".',
        'A <b>DIAC</b> preenche; o formulário abre todo processo de contratação ou prorrogação.',
        'Campos obrigatórios impedem que a omissão chegue à COGPE.'])),
      S(6, 'Formulário A — professor substituto', tb(['Parte', 'O que a DIAC informa'], [
        ['Motivo da vaga', 'Hipótese (lista fechada), docente efetivo ou código de vaga, ato e período do afastamento'],
        ['Necessidade', 'Disciplinas, carga horária, regime, início e término, calendário acadêmico'],
        ['Forma de contratação', 'Aproveitamento de lista do próprio campus, de outro campus ou de outra instituição; ou processo seletivo próprio'],
        ['Se for processo próprio', 'Programa, temas da prova didática, indicação de banca com suplentes e perfil técnico']]) +
        nota('O motivo é sempre a falta de um docente efetivo identificado. O contrato pode começar <b>junto com o afastamento do titular</b>: não é preciso esperar o início das aulas, porque antes delas há planejamento.')),
      { tipo: 'slide', bloco: 6, titulo: 'Formulário B — professor visitante', qr: 'formulario.html', qrRotulo: 'Veja os dois modelos', html: tb(['Parte', 'O que a DIAC informa'], [
        ['Finalidade', 'Lista fechada da Lei 8.745, art. 2º, § 5º. Falta de docente efetivo nunca aparece'],
        ['Atuação', 'Qualquer oferta educativa do campus (Res. 35/2022, art. 2º)'],
        ['Plano de trabalho', 'Vínculo a programa ou projeto, eixo, aprimoramento pretendido, atividades, metas e cronograma'],
        ['Perfil e prazo', 'Titulação exigida, regime e período']]) +
        nota('O plano de trabalho faz parte do formulário. Na justificativa, escreva o <b>aprimoramento pretendido</b> na área, nunca que falta docente nela: carência de docente é motivo de substituto, não de visitante.') }],
    A(6, 'caso', 1), A(6, 'sugestao', 1),

    // ----- bloco 7
    [{ tipo: 'slide', bloco: 7, titulo: 'Agora, vote nas dúvidas', qr: '?t=mural', qrRotulo: 'Abra e vote agora', html: ol([
      'Abra a aba <b>Dúvidas</b> no celular, ou leia o QR code ao lado.',
      'Toque no <b>▲</b> das perguntas que você também quer ver respondidas. Pode votar em quantas quiser.',
      'Quem ainda não enviou a sua pergunta, ainda dá tempo.']) +
      nota('Dois minutos para votar. Em seguida vamos à tela com as mais votadas; as demais serão respondidas por escrito pela DIDEPE.') },
      { tipo: 'mural', bloco: 7 },
      S(7, 'O que a DIGPE e a DIDEPE entregam', ul([
        '<b>Formulários padrão</b> como modelo de documento no SUAP, com as sugestões de hoje.',
        '<b>Checklist</b> de instrução processual por etapa.',
        '<b>Nova IN</b>: fluxo de autorização mais claro, cotas, interstício e nova declaração de vínculos.',
        '<b>Autodeclaração de ausência de impedimento</b> para comissões e bancas: será solicitada à DTI dentro do sistema de processos seletivos. Até lá, permanece a declaração em uso hoje.',
        '<b>Calendário</b> das próximas capacitações.'])),
      S(7, 'O que cada campus leva', ol([
        'Usar o formulário padrão a partir de já.',
        'Seguir a ordem das fases: solicitar, autorizar, definir a forma de contratação, convocar.',
        'Registrar toda análise e juntar todo comprovante.',
        'Nenhum contato extraoficial com candidato.',
        'Na dúvida, consultar a DIDEPE <b>antes</b> de contratar.'])),
      { tipo: 'ranking', bloco: 7 }],
    A(7, 'aval', 3),
    [{ tipo: 'fim', bloco: 7 }]
  );
})();
