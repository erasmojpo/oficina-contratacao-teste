// Simula participantes respondendo, para teste de carga do ambiente de TESTE.
// Uso: node scripts/simular.mjs 150     (deixe a tela de apresentação aberta e avance as atividades normalmente)
import fs from 'node:fs';
const w = {};
for (const f of ['config', 'conteudo']) new Function('window', fs.readFileSync(new URL(`../js/${f}.js`, import.meta.url), 'utf8'))(w);
const C = w.OFC_CONFIG, ATV = w.OFC_ATIVIDADES, N = +process.argv[2] || 50;
if (C.amb !== 'teste') { console.error('Só rode a simulação no ambiente de teste.'); process.exit(1); }
const rpc = async (fn, a) => {
  const r = await fetch(`${C.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: C.key, Authorization: `Bearer ${C.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_amb: C.amb, ...a }) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};
const sorteio = l => l[Math.floor(Math.random() * l.length)];
const campi = w.OFC_CAMPI.slice(0, -1);
const ids = [];
for (let i = 0; i < N; i++) ids.push(await rpc('ofc_entrar', { p_nome: 'Teste' + (i + 1), p_campus: sorteio(campi) }));
console.log(N + ' participantes simulados entraram. Avance a apresentação; Ctrl+C para parar.');
const feito = new Set(); let erros = 0;
async function participante(pid) {
  for (;;) {
    await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));
    try {
      const e = await rpc('ofc_estado_get', {});
      const k = pid + e.atividade + e.item;
      if (e.fase !== 'aberta' || !ATV[e.atividade] || feito.has(k)) continue;
      const it = ATV[e.atividade].itens[e.item]; let resp;
      if (it.tipo === 'escolha') resp = sorteio(it.opcoes).id;
      else if (it.tipo === 'multi') resp = it.opcoes.filter(() => Math.random() < 0.4).map(o => o.id);
      else if (it.tipo === 'ordem') resp = it.opcoes.map(o => o.id).sort(() => Math.random() - 0.5);
      else if (it.tipo === 'campos') resp = Object.fromEntries(it.campos.map(c => [c.k, sorteio(c.opcoes).id]));
      else resp = 'Sugestão simulada ' + Math.floor(Math.random() * 1000);
      await new Promise(r => setTimeout(r, Math.random() * 8000));
      await rpc('ofc_responder', { p_pid: pid, p_atividade: e.atividade, p_item: e.item, p_resposta: resp });
      feito.add(k);
    } catch (x) { erros++; }
  }
}
ids.forEach(participante);
setInterval(() => console.log(new Date().toLocaleTimeString('pt-BR'), 'respostas enviadas:', feito.size, 'erros:', erros), 10000);
