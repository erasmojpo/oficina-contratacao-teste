// Tela de apresentação: conduz o roteiro, publica o estado para os celulares e mostra os resultados ao vivo.
(function () {
  const { rpc, esc, qr, cfg } = window.OFC;
  const R = window.OFC_ROTEIRO, ATV = window.OFC_ATIVIDADES, GAB = window.OFC_GABARITO, BLOCOS = window.OFC_BLOCOS;
  const $ = id => document.getElementById(id);
  const corpo = $('corpo'), sobre = $('sobre');
  const BASE = new URL('./', location.href).href;

  // ---------- plano de tempo ----------
  // Cada passo recebe um peso; os minutos do bloco se repartem entre os passos dele.
  function peso(p) {
    if (p.tipo === 'capa' || p.tipo === 'fim') return 0.5;
    if (p.tipo === 'cadastro' || p.tipo === 'mural') return 2.5;
    if (p.tipo === 'ranking') return 1.5;
    if (p.tipo === 'slide') return 1;
    const t = ATV[p.atividade].itens[p.item].tipo;
    return { escolha: 1, multi: 1.3, ordem: 2, campos: 5, texto: 2 }[t] || 1;
  }
  const PLANO = (() => {
    const soma = {};
    R.forEach(p => { soma[p.bloco] = (soma[p.bloco] || 0) + peso(p); });
    const inicio = []; let acc = 0;
    R.forEach(p => { inicio.push(acc); acc += (window.OFC_MINUTOS[p.bloco] || 0) * peso(p) / soma[p.bloco]; });
    return { inicio, total: acc };
  })();
  function decorrido() {
    if (!estado || !estado.iniciado_em) return null;
    return (Date.now() - desvio - Date.parse(estado.iniciado_em)) / 60000;
  }
  // Término projetado: agora + o que falta do plano, já embutindo o atraso ou o adiantamento.
  function projetado() {
    if (decorrido() === null) return null;
    return new Date(Date.now() + (PLANO.total - PLANO.inicio[passo]) * 60000);
  }
  function mostrarRitmo() {
    const el = $('t-ritmo'), fim = $('t-fim'); if (!el) return;
    const d = decorrido();
    if (d === null) { el.textContent = ''; el.className = 'ritmo'; if (fim) fim.textContent = ''; return; }
    const dif = Math.round(d - PLANO.inicio[passo]);
    el.className = 'ritmo' + (dif > 6 ? ' atraso' : dif > 1 ? ' atencao' : '');
    el.textContent = dif > 1 ? '+' + dif + ' min' : dif < -1 ? '\u2212' + (-dif) + ' min' : 'no tempo';
    if (fim) fim.textContent = 'fim ~' + projetado().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  const CH = 'ofc_pin_' + cfg.amb;
  let pin = null;
  try { pin = sessionStorage.getItem(CH); } catch (e) { pin = null; }
  let passo = 0, fase = 'espera', estado = null, desvio = 0, ocupado = false, participantes = 0;

  // ---------- escala do palco ----------
  function escalar() {
    const s = Math.min(innerWidth / 1600, innerHeight / 900);
    $('palco').style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  addEventListener('resize', escalar); escalar();
  if (cfg.rotulo) $('t-teste').innerHTML = '<span class="teste">' + esc(cfg.rotulo) + '</span>';
  setInterval(() => {
    $('t-hora').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    mostrarRitmo();
  }, 1000);

  const caixaQr = (url, leg) => '<div class="qr-caixa">' + qr(url) + '<div class="leg">' + esc(leg) + '</div><div class="url">' + esc(url.replace(/^https?:\/\//, '')) + '</div></div>';
  const pct = (n, t) => t ? Math.round(100 * n / t) : 0;

  // ---------- navegação ----------
  async function ir(n, novaFase) {
    if (ocupado) return;
    n = Math.max(0, Math.min(R.length - 1, n));
    const p = R[n], f = p.tipo === 'atividade' ? (novaFase || 'aberta') : 'espera';
    ocupado = true;
    try {
      estado = await rpc('ofc_controle', { p_pin: pin, p_passo: n, p_atividade: p.tipo === 'atividade' ? p.atividade : null, p_item: p.tipo === 'atividade' ? p.item : null, p_fase: f });
      desvio = Date.now() - Date.parse(estado.agora);
      passo = n; fase = f;
      desenhar();
    } catch (e) { aviso('Sem conexão com o servidor. Tente de novo. (' + e.message + ')'); }
    ocupado = false;
  }
  function avancar() {
    const p = R[passo];
    if (p.tipo === 'atividade' && fase === 'aberta') return ir(passo, 'revelada');
    if (passo < R.length - 1) return ir(passo + 1);
  }
  function voltar() { if (passo > 0) ir(passo - 1, 'revelada'); }

  // ---------- desenho ----------
  function moldura() {
    const p = R[passo];
    $('t-bloco').innerHTML = '<b>Bloco ' + p.bloco + '</b>' + esc(BLOCOS[p.bloco]);
    $('t-pos').textContent = (passo + 1) + ' / ' + R.length;
    $('t-barra').style.width = pct(passo + 1, R.length) + '%';
    $('t-part').textContent = participantes + ' participante' + (participantes === 1 ? '' : 's');
    mostrarRitmo();
  }
  // Slides curtos recebem tipografia maior, desde que continuem cabendo na tela.
  function ajustarDensidade() {
    const caixa = corpo.querySelector('.s-corpo'), fit = corpo.querySelector('.s-fit');
    if (!caixa || !fit) return;
    caixa.classList.remove('folgado');
    if (fit.offsetHeight > caixa.clientHeight * 0.74) return;
    caixa.classList.add('folgado');
    if (fit.offsetHeight > caixa.clientHeight) caixa.classList.remove('folgado');
  }

  function desenhar() {
    const p = R[passo];
    moldura();
    if (p.tipo === 'capa') {
      corpo.innerHTML = '<div class="capa"><div class="sup">Encontro de Gestão de Pessoas · IFRN</div>' +
        '<h1>Contratação de professores substitutos e visitantes</h1>' +
        '<p class="promo">Oficina promovida pela <b>Diretoria de Desenvolvimento de Pessoal — DIDEPE/DIGPE/RE</b></p>' +
        '<p class="cond">Condução: <b>Erasmo José Pereira de Oliveira</b><br>Diretor de Desenvolvimento de Pessoal</p>' +
        '<p class="data">17 de novembro de 2026</p></div>';
    } else if (p.tipo === 'fim') {
      corpo.innerHTML = '<div class="capa"><div class="sup">Obrigado pela participação</div>' +
        '<h1>Na dúvida, consulte a DIDEPE antes de contratar.</h1>' +
        '<p class="promo">Diretoria de Desenvolvimento de Pessoal — DIDEPE/DIGPE/RE</p>' +
        '<p class="data">didepe@ifrn.edu.br</p></div>';
    } else if (p.tipo === 'slide') {
      const h = '<div class="s-titulo">' + esc(p.titulo) + '</div>';
      const miolo = p.qr ? '<div class="com-qr"><div>' + p.html + '</div>' + caixaQr(BASE + p.qr, p.qrRotulo) + '</div>' : p.html;
      corpo.innerHTML = h + '<div class="s-corpo"><div class="s-fit">' + miolo + '</div></div>';
      ajustarDensidade();
    } else if (p.tipo === 'cadastro') {
      corpo.innerHTML = '<div class="cad">' + caixaQr(BASE, 'Aponte a câmera para entrar') +
        '<div><h2>Entre com seu primeiro nome e campus</h2><div class="total" id="c-total">0</div><div style="font-size:24px;color:var(--cinza)">participantes conectados</div><div class="chips" id="c-chips"></div></div></div>';
    } else if (p.tipo === 'mural') {
      corpo.innerHTML = '<div class="atv"><div class="esq mural-bloco"><div class="rot">Mural de dúvidas</div><div class="perg">As mais votadas</div><div class="mural-t" id="m-lista"></div></div>' +
        '<div class="dir">' + caixaQr(BASE + '?t=mural', 'Envie e vote') + '</div></div>';
    } else if (p.tipo === 'ranking') {
      corpo.innerHTML = '<div class="rank"><div class="col"><h3>Participantes</h3><div id="r-ind"></div></div><div class="col"><h3>Campi, pela média de pontos</h3><div id="r-cam"></div></div></div>';
    } else if (p.tipo === 'atividade') {
      desenharAtividade(p);
    }
    atualizar();
  }

  function desenharAtividade(p) {
    const a = ATV[p.atividade], it = a.itens[p.item], g = GAB[p.atividade][p.item];
    const rot = esc(a.titulo) + (a.itens.length > 1 ? ' · ' + (p.item + 1) + ' de ' + a.itens.length : '') + (g.pontua ? ' · vale pontos' : '');
    let meio = '';
    if (it.tipo === 'campos') meio = '<div class="caso-t">' + esc(it.pergunta) + '</div><div class="ops muitas" id="a-ops"></div>';
    else if (it.tipo === 'texto') meio = '<div class="perg">' + esc(it.pergunta) + '</div><div class="parede" id="a-ops"></div>';
    else meio = '<div class="perg' + (it.pergunta.length > 170 ? ' longa' : '') + '">' + esc(it.pergunta) + '</div><div class="ops' + ((it.opcoes || []).length > 5 ? ' muitas' : '') + '" id="a-ops"></div>';
    corpo.innerHTML = '<div class="atv"><div class="esq"><div class="rot">' + rot + '</div>' + meio + '<div id="a-com"></div></div>' +
      '<div class="dir">' + caixaQr(BASE + '?t=' + p.atividade, 'Responda no celular') +
      '<div class="cont"><b id="a-n">0</b><span id="a-de">respostas</span></div>' +
      '<div class="cont relogio" id="a-rel"><b id="a-t">–</b><span>segundos</span></div></div></div>';
    pintarOpcoes(p, null);
  }

  function pintarOpcoes(p, res) {
    const a = ATV[p.atividade], it = a.itens[p.item], g = GAB[p.atividade][p.item], el = $('a-ops');
    if (!el) return;
    const rev = fase === 'revelada', total = res ? res.total : 0, dados = res ? res.dados : [];
    const mostrar = rev || !g.pontua && it.tipo !== 'escolha' || (!g.pontua && g.correta === null);
    if (it.tipo === 'escolha' || it.tipo === 'multi') {
      let ops = it.opcoes.map(o => ({ o, n: ((dados.find && dados.find(d => d.v === o.id)) || { n: 0 }).n }));
      if (it.tipo === 'multi' && mostrar) ops = ops.slice().sort((x, y) => y.n - x.n);
      el.innerHTML = ops.map(x => '<div class="op' + (rev && g.correta === x.o.id ? ' certa' : '') + '"><i style="width:' + (mostrar ? pct(x.n, total) : 0) + '%"></i><span>' + esc(x.o.t) + '</span>' +
        (mostrar ? '<b>' + x.n + (it.tipo === 'escolha' ? ' · ' + pct(x.n, total) + '%' : '') + '</b>' : '') + '</div>').join('');
    } else if (it.tipo === 'ordem') {
      const ordem = rev ? g.correta : it.opcoes.map(o => o.id).sort((x, y) => (x.charCodeAt(1) * 7 % 5) - (y.charCodeAt(1) * 7 % 5));
      el.className = 'ops muitas';
      el.innerHTML = ordem.map((id, i) => '<div class="op' + (rev ? ' certa' : '') + '"><span>' + (rev ? '<b style="color:var(--verde-esc)">' + (i + 1) + '.</b> ' : '') + esc(it.opcoes.find(o => o.id === id).t) + '</span></div>').join('') +
        (rev && res ? '<div class="op"><span>Acertaram a ordem completa</span><b>' + (dados.certas || 0) + ' · ' + pct(dados.certas || 0, total) + '%</b></div>' : '');
    } else if (it.tipo === 'campos') {
      el.innerHTML = it.campos.map(c => {
        const certo = c.opcoes.find(o => o.id === g.correta[c.k]);
        const n = ((dados.find && dados.find(d => d.k === c.k && d.v === g.correta[c.k])) || { n: 0 }).n;
        return '<div class="op' + (rev ? ' certa' : '') + '"><i style="width:' + (rev ? pct(n, total) : 0) + '%"></i><span><b style="color:var(--tinta)">' + esc(c.rotulo) + (rev ? ':</b> ' + esc(certo.t) : '</b>') + '</span>' +
          (rev ? '<b>' + pct(n, total) + '% de acerto</b>' : '') + '</div>';
      }).join('');
    } else if (it.tipo === 'texto') {
      el.innerHTML = (dados || []).slice(0, 12).map(t => '<div>' + esc(t) + '</div>').join('');
    }
    $('a-com').innerHTML = rev && g.comentario ? '<div class="coment">' + esc(g.comentario) + '</div>' : '';
  }

  // ---------- atualização periódica ----------
  async function atualizar() {
    const p = R[passo], n = passo, f = fase;
    try {
      if (p.tipo === 'atividade') {
        const res = await rpc('ofc_resultados', { p_atividade: p.atividade, p_item: p.item });
        if (n !== passo || f !== fase || !res) return;
        participantes = res.participantes;
        $('a-n').textContent = res.total;
        $('a-de').textContent = 'respostas de ' + res.participantes;
        pintarOpcoes(p, res);
      } else if (p.tipo === 'mural') {
        const l = await rpc('ofc_mural_listar', { p_pid: null }) || [];
        if (n !== passo) return;
        $('m-lista').innerHTML = l.length ? l.slice(0, 6).map(m => '<div class="m"><b>▲ ' + m.votos + '</b><div>' + esc(m.texto) + '</div></div>').join('')
          : '<div class="m"><b>–</b><div>Nenhuma dúvida enviada ainda.</div></div>';
      } else if (p.tipo === 'cadastro' || p.tipo === 'ranking' || p.tipo === 'capa') {
        const r = await rpc('ofc_ranking');
        if (n !== passo || !r) return;
        participantes = r.participantes;
        if (p.tipo === 'cadastro') {
          $('c-total').textContent = r.participantes;
          $('c-chips').innerHTML = r.por_campus.slice(0, 24).map(c => '<div class="chip"><span>' + esc(c.campus) + '</span><b>' + c.n + '</b></div>').join('');
        } else if (p.tipo === 'ranking') {
          $('r-ind').innerHTML = r.individual.map((x, i) => '<div class="l"><span class="p">' + (i + 1) + 'º</span><span>' + esc(x.nome) + '<small>' + esc(x.campus) + '</small></span><b>' + x.pontos + '</b></div>').join('');
          $('r-cam').innerHTML = r.campi.slice(0, 10).map((x, i) => '<div class="l"><span class="p">' + (i + 1) + 'º</span><span>' + esc(x.campus) + '<small>' + x.n + ' part.</small></span><b>' + x.media + '</b></div>').join('');
        }
      }
      moldura();
    } catch (e) { /* tenta de novo no próximo ciclo */ }
  }
  setInterval(() => { if (pin && !sobre.innerHTML) atualizar(); }, 2000);
  setInterval(() => {
    const el = $('a-t'); if (!el || !estado || !estado.aberto_em) return;
    if (fase !== 'aberta') { el.textContent = '–'; return; }
    const resta = Math.ceil((estado.tempo || 0) - (Date.now() - desvio - Date.parse(estado.aberto_em)) / 1000);
    el.textContent = Math.max(0, resta);
    $('a-rel').classList.toggle('fim', resta <= 0);
  }, 250);

  // ---------- sobreposições ----------
  function aviso(msg) {
    sobre.innerHTML = '<div class="vel"><div class="caixa"><h2>Atenção</h2><p>' + esc(msg) + '</p><button class="btn" id="ok">OK</button></div></div>';
    $('ok').onclick = () => { sobre.innerHTML = ''; };
  }
  function pedirPin(msg) {
    sobre.innerHTML = '<div class="vel"><form class="caixa" id="fpin"><h2>Apresentação — ' + esc(cfg.amb === 'teste' ? 'ambiente de teste' : 'oficina') + '</h2>' +
      '<div class="campo"><label for="pin">PIN do apresentador</label><input id="pin" inputmode="numeric" autocomplete="off" autofocus></div>' +
      '<div class="erro">' + esc(msg || '') + '</div><button class="btn">Entrar</button></form></div>';
    $('fpin').onsubmit = ev => { ev.preventDefault(); pin = $('pin').value.trim(); iniciar(); };
  }
  function menu() {
    if (sobre.innerHTML) { sobre.innerHTML = ''; return; }
    const nome = (p, i) => (i + 1) + '. ' + (p.tipo === 'slide' ? p.titulo : p.tipo === 'atividade' ? '▶ ' + ATV[p.atividade].titulo + (ATV[p.atividade].itens.length > 1 ? ' (' + (p.item + 1) + ')' : '') :
      { capa: 'Capa', cadastro: '▶ Cadastro', mural: '▶ Mural de dúvidas', ranking: 'Ranking final', fim: 'Encerramento' }[p.tipo]);
    const d = decorrido(), hhmm = t => t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const detalhe = d === null ? '<div class="ritmo-detalhe">A contagem de tempo começa quando você sair da capa.</div>'
      : '<div class="ritmo-detalhe">Início às <b>' + hhmm(new Date(Date.parse(estado.iniciado_em) + desvio)) + '</b> · '
        + 'decorridos <b>' + Math.round(d) + ' min</b>, previstos <b>' + Math.round(PLANO.inicio[passo]) + ' min</b><br>'
        + 'Plano total: <b>' + Math.round(PLANO.total) + ' min</b> · término projetado às '
        + '<b>' + hhmm(projetado()) + '</b><br>'
        + 'O ritmo é acumulado: tempo ganho num bloco continua valendo nos seguintes.</div>';
    sobre.innerHTML = '<div class="vel"><div class="caixa larga"><h2>Menu do apresentador</h2>' + detalhe + '<div class="acoes">' +
      '<button class="btn sec" id="m-exp">Exportar resultados</button><button class="btn sec" id="m-cheia">Tela cheia</button><button class="btn perigo" id="m-zera">Zerar dados</button></div>' +
      '<div class="passos">' + R.map((p, i) => '<button data-i="' + i + '" class="' + (i === passo ? 'atual' : '') + '">' + esc(nome(p, i)) + '</button>').join('') + '</div>' +
      '<button class="btn" id="m-fecha">Fechar</button></div></div>';
    $('m-fecha').onclick = () => { sobre.innerHTML = ''; };
    $('m-cheia').onclick = () => { telaCheia(); sobre.innerHTML = ''; };
    sobre.querySelectorAll('.passos button').forEach(b => b.onclick = () => { sobre.innerHTML = ''; ir(+b.dataset.i, 'revelada'); });
    $('m-exp').onclick = async () => {
      try {
        const d = await rpc('ofc_exportar', { p_pin: pin });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
        a.download = 'oficina-' + cfg.amb + '-resultados.json'; a.click();
      } catch (e) { aviso(e.message); }
    };
    $('m-zera').onclick = async () => {
      if (!confirm('Apagar TODOS os participantes, respostas e dúvidas do ambiente "' + cfg.amb + '"? Não pode ser desfeito.')) return;
      if (prompt('Digite ZERAR para confirmar') !== 'ZERAR') return;
      try { await rpc('ofc_reset', { p_pin: pin }); sobre.innerHTML = ''; participantes = 0; passo = 0; fase = 'espera'; desenhar(); } catch (e) { aviso(e.message); }
    };
  }
  function telaCheia() { const d = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen(); }

  addEventListener('keydown', ev => {
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
    if (ev.key === 'm' || ev.key === 'M') return menu();
    if (sobre.innerHTML) { if (ev.key === 'Escape') sobre.innerHTML = ''; return; }
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown' || ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); avancar(); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); voltar(); }
    else if (ev.key === 'f' || ev.key === 'F') telaCheia();
  });
  $('b-avanca').onclick = avancar; $('b-volta').onclick = voltar; $('b-menu').onclick = menu;

  // ---------- início ----------
  async function iniciar() {
    if (!pin) return pedirPin();
    try {
      const e = await rpc('ofc_estado_get');
      // regrava o mesmo estado: valida o PIN sem mudar nada para os participantes
      estado = await rpc('ofc_controle', { p_pin: pin, p_passo: e.passo, p_atividade: e.atividade, p_item: e.item, p_fase: e.fase });
      try { sessionStorage.setItem(CH, pin); } catch (x) { /* sem armazenamento */ }
      desvio = Date.now() - Date.parse(estado.agora);
      passo = Math.min(estado.passo || 0, R.length - 1); fase = estado.fase;
      sobre.innerHTML = '';
      desenhar();
    } catch (e) {
      const m = /PIN/.test(e.message) ? 'PIN incorreto.' : 'Sem conexão com o servidor: ' + e.message;
      pin = null; try { sessionStorage.removeItem(CH); } catch (x) { /* nada */ }
      pedirPin(m);
    }
  }
  iniciar();
})();
