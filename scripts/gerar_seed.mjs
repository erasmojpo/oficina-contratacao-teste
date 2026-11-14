// Gera sql/seed.sql a partir de js/conteudo.js e js/gabarito.js, para que banco e tela usem a mesma chave.
import fs from 'node:fs';
const g = { window: {} };
new Function('window', fs.readFileSync(new URL('../js/conteudo.js', import.meta.url), 'utf8'))(g.window);
new Function('window', fs.readFileSync(new URL('../js/gabarito.js', import.meta.url), 'utf8'))(g.window);
const A = g.window.OFC_ATIVIDADES, G = g.window.OFC_GABARITO;
const linhas = [];
for (const [id, a] of Object.entries(A)) {
  if (!G[id] || G[id].length !== a.itens.length) throw new Error('gabarito incompleto: ' + id);
  a.itens.forEach((it, i) => {
    const gb = G[id][i];
    if (it.tipo === 'escolha' && gb.correta !== null && !it.opcoes.some(o => o.id === gb.correta)) throw new Error(`resposta inexistente em ${id}[${i}]`);
    if (it.tipo === 'ordem' && gb.correta.slice().sort().join() !== it.opcoes.map(o => o.id).sort().join()) throw new Error('ordem inválida');
    if (it.tipo === 'campos') for (const c of it.campos) if (!c.opcoes.some(o => o.id === gb.correta[c.k])) throw new Error('campo inválido ' + c.k);
    const cor = gb.correta === null ? 'null' : `'${JSON.stringify(gb.correta).replace(/'/g, "''")}'::jsonb`;
    linhas.push(`('${id}', ${i}, '${it.tipo}', ${cor}, ${gb.tempo}, ${gb.pontua})`);
  });
}
const sql = `insert into public.ofc_gabarito (atividade, item, tipo, correta, tempo, pontua) values\n${linhas.join(',\n')}\non conflict (atividade, item) do update set tipo = excluded.tipo, correta = excluded.correta, tempo = excluded.tempo, pontua = excluded.pontua;\n`;
fs.writeFileSync(new URL('../sql/seed.sql', import.meta.url), sql);
console.log(sql);
