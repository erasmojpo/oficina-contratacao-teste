# Oficina: contratação de professores substitutos e visitantes (IFRN)

Sistema da oficina do Encontro de Gestão de Pessoas (17/11/2026). Páginas estáticas (GitHub Pages) + banco no Supabase.

## Páginas

| Página | Para quem | O que faz |
| --- | --- | --- |
| `index.html` | Participantes (celular) | Cadastro com primeiro nome e campus, atividades, mural de dúvidas |
| `tela.html` | Apresentador (projetor) | Slides, QR codes, resultados ao vivo, ranking. Pede o PIN |
| `formulario.html` | Todos | Modelo dos formulários padrão de solicitação (substituto e visitante). Não grava nada |

## Dois ambientes

O código é o mesmo nos dois repositórios. Só muda `js/config.js`:

| Repositório | `amb` | `rotulo` |
| --- | --- | --- |
| Protótipo (testes e validação) | `'teste'` | `'AMBIENTE DE TESTE'` |
| Oficina | `'oficina'` | `''` |

Os dados dos dois ambientes ficam separados no banco. O PIN de cada ambiente está na tabela `ofc_config` e não fica no repositório.

## Como conduzir

1. Abra `tela.html` no computador do projetor e digite o PIN.
2. `→` (ou espaço) avança. Em uma atividade, o primeiro `→` encerra e revela o resultado; o segundo segue adiante.
3. `←` volta. `M` abre o menu (pular para qualquer passo, exportar resultados, zerar dados). `F` alterna tela cheia.
4. Toda atividade mostra um QR code. Quem ainda não se cadastrou passa antes pelo cadastro.
5. Ao final, use **Menu > Exportar resultados** para baixar o arquivo com participação, acertos e sugestões.

Antes da oficina: **Menu > Zerar dados** no ambiente da oficina, para apagar os testes.

## Onde editar o conteúdo

| Arquivo | Conteúdo |
| --- | --- |
| `js/roteiro.js` | Slides e ordem dos passos |
| `js/conteudo.js` | Perguntas e opções das atividades |
| `js/gabarito.js` | Respostas, tempo e comentários |

Se mudar `conteudo.js` ou `gabarito.js`, rode `node scripts/gerar_seed.mjs` e aplique `sql/seed.sql` no banco, para que a pontuação use a mesma chave.

## Banco

`sql/schema.sql` cria as tabelas `ofc_*` e as funções. As tabelas ficam fechadas por RLS; o navegador só chama funções. `sql/seed.sql` carrega o gabarito.

## Teste de carga

`node scripts/simular.mjs 150` cria 150 participantes simulados no ambiente de teste, que respondem às atividades conforme você avança a tela.

Todos os casos, nomes e atos usados nas atividades são fictícios.
