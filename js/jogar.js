// Aplicativo do participante (celular). Segue o estado definido pela tela de apresentação.
(function () {
  const { rpc, esc, cfg } = window.OFC;
  const ATV = window.OFC_ATIVIDADES;
  const $ = id => document.getElementById(id);
  const app = $('app');
  const CHAVE = 'ofc_pid_' + cfg.amb;
  let pid = null;
  try { pid = localStorage.getItem(CHAVE); } catch (e) { pid = null; }
  let estado = null, meu = null, aba = 'atv', vista = '', rascunho = null, ultimoMeu = 0, falhas = 0;
  if (new URLSearchParams(location.search).get('t') === 'mural') aba = 'mural';

  if (cfg.rotulo) $('faixa').innerHTML = '<div class="faixa-teste">' + esc(cfg.rotulo) + '</div>';

  function salvarPid(v) { pid = v; try { v ? localStorage.setItem(CHAVE, v) : localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ } }
  function itemAtual() {
    if (!estado || !estado.atividade || !ATV[estado.atividade]) return null;
    return ATV[estado.atividade].itens[estado.item] || null;
  }
  function chave() { return estado ? [estado.atividade, estado.item, estado.fase].join('|') : ''; }

  // ---------- cadastro ----------
  function telaCadastro(msg) {
    vista = 'cadastro';
    $('topo').hidden = true; $('nav').hidden = true;
    app.innerHTML =
      '<div class="cartao"><div class="rotulo">DIDEPE · Encontro de Gestão de Pessoas</div>' +
      '<h1 style="font-size:24px;margin-top:6px">Oficina: contratação de professores substitutos e visitantes</h1>' +
      '<p style="color:var(--cinza);margin-top:8px">Diretoria de Desenvolvimento de Pessoal · Condução: Erasmo José Pereira de Oliveira</p>' +
      '<p style="color:var(--cinza);margin-top:10px">Informe seu primeiro nome e seu campus para participar.</p></div>' +
      '<div class="campo"><label for="nome">Primeiro nome</label><input id="nome" maxlength="30" autocomplete="given-name" autocapitalize="words"></div>' +
      '<div class="campo"><label for="campus">Campus</label><select id="campus"><option value="">Selecione</option>' +
      window.OFC_CAMPI.map(c => '<option>' + esc(c) + '</option>').join('') + '</select></div>' +
      '<div class="erro" id="erro">' + esc(msg || '') + '</div>' +
      '<button class="btn" id="entrar">Entrar</button>';
    $('entrar').onclick = async () => {
      const nome = $('nome').value.trim().split(/\s+/)[0] || '', campus = $('campus').value;
      if (!nome || !campus) { $('erro').textContent = 'Preencha o nome e o campus.'; return; }
      $('entrar').disabled = true;
      try {
        salvarPid(await rpc('ofc_entrar', { p_nome: nome, p_campus: campus }));
        vista = ''; await ciclo(true);
      } catch (e) { $('erro').textContent = 'Não foi possível entrar. Tente de novo.'; $('entrar').disabled = false; }
    };
  }

  // ---------- cabeçalho ----------
  function cabecalho() {
    $('topo').hidden = false; $('nav').hidden = false;
    if (!meu) return;
    $('quem').innerHTML = esc(meu.nome) + '<small>' + esc(meu.campus) + '</small>';
    $('placar').innerHTML = '<b>' + meu.pontos + '</b> pts<small>' + meu.posicao + 'º lugar</small>';
    $('aba-atv').className = aba === 'atv' ? 'ativo' : '';
    $('aba-mural').className = aba === 'mural' ? 'ativo' : '';
  }

  // ---------- espera ----------
  function telaEspera() {
    app.innerHTML = '<div class="cartao aviso"><div class="icone">👀</div><h2>Acompanhe a tela</h2>' +
      '<p>A próxima atividade aparece aqui automaticamente. Se tiver uma dúvida, envie pela aba Dúvidas.</p></div>';
  }
  function telaRespondido() {
    app.innerHTML = '<div class="cartao aviso"><div class="icone">✅</div><h2>Resposta registrada</h2><p>Aguarde o resultado na tela.</p></div>';
  }

  // ---------- atividade aberta ----------
  function embaralhar(lista, semente) {
    const a = lista.slice(); let s = 0;
    for (const ch of semente) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function telaItem() {
    const it = itemAtual(), a = ATV[estado.atividade];
    const cab = '<div class="cartao"><div class="rotulo">' + esc(a.titulo) + (a.itens.length > 1 ? ' · ' + (estado.item + 1) + ' de ' + a.itens.length : '') + '</div>';
    let h = '';
    if (it.tipo === 'escolha' || it.tipo === 'multi') {
      if (rascunho === null) rascunho = it.tipo === 'multi' ? [] : '';
      h = cab + '<div class="pergunta">' + esc(it.pergunta) + '</div></div><div class="opcoes">' +
        it.opcoes.map(o => '<button class="opcao ' + (it.tipo === 'multi' ? 'multi' : '') + '" data-id="' + esc(o.id) + '"><span class="marca"></span><span>' + esc(o.t) + '</span></button>').join('') + '</div>';
    } else if (it.tipo === 'ordem') {
      if (rascunho === null) rascunho = embaralhar(it.opcoes.map(o => o.id), pid || 'x');
      h = cab + '<div class="pergunta">' + esc(it.pergunta) + '</div></div><div class="opcoes" id="lista"></div>';
    } else if (it.tipo === 'campos') {
      if (rascunho === null) rascunho = {};
      h = cab + '<div class="pergunta">Leia o caso e preencha a solicitação.</div></div><div class="caso-texto">' + esc(it.pergunta) + '</div>' +
        it.campos.map(c => '<div class="campo"><label>' + esc(c.rotulo) + '</label><select data-k="' + esc(c.k) + '"><option value="">Selecione</option>' +
          c.opcoes.map(o => '<option value="' + esc(o.id) + '">' + esc(o.t) + '</option>').join('') + '</select></div>').join('');
    } else if (it.tipo === 'texto') {
      if (rascunho === null) rascunho = '';
      h = cab + '<div class="pergunta">' + esc(it.pergunta) + '</div></div><div class="campo"><textarea id="txt" maxlength="400" placeholder="Escreva aqui"></textarea></div>';
    }
    app.innerHTML = h + '<div class="erro" id="erro"></div><button class="btn" id="enviar" disabled>Confirmar resposta</button>';
    const btn = $('enviar');
    const pronto = () => {
      if (it.tipo === 'escolha') return !!rascunho;
      if (it.tipo === 'multi') return rascunho.length > 0;
      if (it.tipo === 'ordem') return true;
      if (it.tipo === 'campos') return it.campos.every(c => rascunho[c.k]);
      return String(rascunho).trim().length >= 3;
    };
    const marcar = () => {
      app.querySelectorAll('.opcao[data-id]').forEach(b => {
        const s = it.tipo === 'multi' ? rascunho.includes(b.dataset.id) : rascunho === b.dataset.id;
        b.classList.toggle('sel', s);
      });
      btn.disabled = !pronto();
    };
    app.querySelectorAll('.opcao[data-id]').forEach(b => b.onclick = () => {
      const id = b.dataset.id;
      if (it.tipo === 'multi') rascunho = rascunho.includes(id) ? rascunho.filter(x => x !== id) : rascunho.concat(id);
      else rascunho = id;
      marcar();
    });
    if (it.tipo === 'ordem') {
      const desenhar = () => {
        $('lista').innerHTML = rascunho.map((id, i) => {
          const o = it.opcoes.find(x => x.id === id);
          return '<div class="ordem-item"><div class="n">' + (i + 1) + '</div><div>' + esc(o.t) + '</div><div class="setas">' +
            '<button data-i="' + i + '" data-d="-1" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
            '<button data-i="' + i + '" data-d="1" aria-label="Descer"' + (i === rascunho.length - 1 ? ' disabled' : '') + '>▼</button></div></div>';
        }).join('');
        $('lista').querySelectorAll('button').forEach(b => b.onclick = () => {
          const i = +b.dataset.i, j = i + (+b.dataset.d);
          [rascunho[i], rascunho[j]] = [rascunho[j], rascunho[i]]; desenhar();
        });
      };
      desenhar();
    }
    app.querySelectorAll('select[data-k]').forEach(s => { s.value = rascunho[s.dataset.k] || ''; s.onchange = () => { rascunho[s.dataset.k] = s.value; marcar(); }; });
    if ($('txt')) { $('txt').value = rascunho; $('txt').oninput = () => { rascunho = $('txt').value; marcar(); }; }
    marcar();
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        const r = await rpc('ofc_responder', { p_pid: pid, p_atividade: estado.atividade, p_item: estado.item, p_resposta: it.tipo === 'texto' ? String(rascunho).trim() : rascunho });
        if (r && r.ok === false) { $('erro').textContent = 'Esta atividade já foi encerrada.'; return; }
        rascunho = null; await ciclo(true);
      } catch (e) { $('erro').textContent = 'Falha ao enviar. Toque de novo.'; btn.disabled = false; }
    };
  }

  // ---------- resultado ----------
  function telaRevelado() {
    const it = itemAtual(), a = ATV[estado.atividade];
    let h = '<div class="cartao"><div class="rotulo">' + esc(a.titulo) + '</div><div class="pergunta">' + esc(it.tipo === 'campos' ? 'Resultado do caso' : it.pergunta) + '</div></div>';
    const g = meu.gabarito;
    if (!meu.respondeu) h += '<div class="resultado nao">Você não respondeu<small>Veja o comentário na tela.</small></div>';
    else if (meu.correta === true) h += '<div class="resultado ok">Acertou! +' + (meu.pontos_item || 0) + ' pontos</div>';
    else if (meu.correta === false) h += '<div class="resultado nao">Não foi dessa vez' + (meu.pontos_item ? '<small>+' + meu.pontos_item + ' pontos pelos acertos parciais</small>' : '') + '</div>';
    else h += '<div class="resultado ok">Resposta registrada<small>Obrigado pela participação.</small></div>';
    if (it.tipo === 'escolha' && g != null) {
      h += '<div class="opcoes">' + it.opcoes.map(o => {
        const cls = o.id === g ? 'certa' : (meu.resposta === o.id ? 'errada' : '');
        return '<div class="opcao ' + cls + '"><span>' + (o.id === g ? '✔ ' : (meu.resposta === o.id ? '✘ ' : '')) + esc(o.t) + '</span></div>';
      }).join('') + '</div>';
    } else if (it.tipo === 'campos' && g) {
      h += '<div class="opcoes">' + it.campos.map(c => {
        const certo = c.opcoes.find(o => o.id === g[c.k]), ok = meu.resposta && meu.resposta[c.k] === g[c.k];
        return '<div class="opcao ' + (ok ? 'certa' : 'errada') + '"><span><b>' + esc(c.rotulo) + ':</b> ' + esc(certo ? certo.t : '') + '</span></div>';
      }).join('') + '</div>';
    } else if (it.tipo === 'ordem' && g) {
      h += '<div class="opcoes">' + g.map((id, i) => '<div class="opcao certa"><span><b>' + (i + 1) + '.</b> ' + esc(it.opcoes.find(o => o.id === id).t) + '</span></div>').join('') + '</div>';
    }
    app.innerHTML = h;
  }

  // ---------- mural ----------
  async function telaMural() {
    vista = 'mural';
    app.innerHTML = '<div class="cartao"><div class="rotulo">Mural de dúvidas</div><div class="pergunta">Envie sua dúvida e vote nas dos colegas. As mais votadas serão respondidas ao final.</div></div>' +
      '<div class="campo"><textarea id="duv" maxlength="280" placeholder="Escreva sua dúvida (até 280 caracteres)"></textarea></div>' +
      '<div class="erro" id="erro"></div><button class="btn" id="mandar">Enviar dúvida</button><div class="opcoes" id="lst"></div>';
    $('mandar').onclick = async () => {
      const t = $('duv').value.trim();
      if (t.length < 5) { $('erro').textContent = 'Escreva a dúvida antes de enviar.'; return; }
      $('mandar').disabled = true;
      try { await rpc('ofc_mural_enviar', { p_pid: pid, p_texto: t }); $('duv').value = ''; $('erro').textContent = ''; await listarMural(); }
      catch (e) { $('erro').textContent = e.message; }
      $('mandar').disabled = false;
    };
    await listarMural();
  }
  async function listarMural() {
    if (!$('lst')) return;
    let l = [];
    try { l = await rpc('ofc_mural_listar', { p_pid: pid }) || []; } catch (e) { return; }
    if (!$('lst')) return;
    $('lst').innerHTML = l.length ? l.map(m => '<div class="mural-item"><div>' + esc(m.texto) + '</div><button class="voto ' + (m.meu ? 'meu' : '') + '" data-id="' + m.id + '">▲ ' + m.votos + '</button></div>').join('')
      : '<p style="color:var(--cinza);text-align:center">Nenhuma dúvida enviada ainda.</p>';
    $('lst').querySelectorAll('.voto').forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await rpc('ofc_mural_votar', { p_pid: pid, p_id: +b.dataset.id }); } catch (e) { /* segue */ }
      listarMural();
    });
  }

  // ---------- ciclo ----------
  function desenhar() {
    cabecalho();
    if (aba === 'mural') { if (vista !== 'mural') telaMural(); return; }
    const it = itemAtual();
    const nova = 'atv:' + chave() + ':' + (meu && meu.respondeu ? 1 : 0);
    if (vista === nova) return;
    vista = nova;
    if (!it || estado.fase === 'espera') return telaEspera();
    if (estado.fase === 'aberta') return meu && meu.respondeu ? telaRespondido() : telaItem();
    return telaRevelado();
  }
  async function ciclo(forcar) {
    if (!pid) { if (vista !== 'cadastro') telaCadastro(); return; }
    try {
      const antes = chave();
      estado = await rpc('ofc_estado_get');
      falhas = 0;
      const mudou = antes !== chave();
      if (mudou) rascunho = null;
      if (forcar || mudou || !meu || Date.now() - ultimoMeu > 20000) {
        meu = await rpc('ofc_meu', { p_pid: pid });
        ultimoMeu = Date.now();
        if (!meu) { salvarPid(null); telaCadastro('Sua sessão foi reiniciada. Entre de novo.'); return; }
      }
      desenhar();
      if (aba === 'mural' && vista === 'mural' && !forcar) listarMural();
    } catch (e) { falhas++; }
  }
  $('aba-atv').onclick = () => { aba = 'atv'; vista = ''; desenhar(); };
  $('aba-mural').onclick = () => { aba = 'mural'; vista = ''; desenhar(); };
  function agendar() {
    const espera = document.hidden ? 8000 : 2500 + Math.random() * 1500 + Math.min(falhas, 5) * 2000;
    setTimeout(async () => { await ciclo(false); agendar(); }, espera);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) ciclo(true); });
  ciclo(true).then(agendar);
})();
