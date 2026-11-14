-- Oficina de contratação de professores substitutos e visitantes (IFRN)
-- Tabelas com prefixo ofc_. Todo acesso do navegador passa por funções (RPC); as tabelas ficam fechadas por RLS.

create table if not exists public.ofc_config (
  amb text primary key,
  pin text not null
);

create table if not exists public.ofc_participantes (
  id uuid primary key default gen_random_uuid(),
  amb text not null references public.ofc_config(amb),
  nome text not null,
  campus text not null,
  criado_em timestamptz not null default now()
);
create index if not exists ofc_participantes_amb_idx on public.ofc_participantes(amb);

create table if not exists public.ofc_estado (
  amb text primary key references public.ofc_config(amb),
  passo int not null default 0,
  atividade text,
  item int,
  fase text not null default 'espera',
  aberto_em timestamptz,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.ofc_gabarito (
  atividade text not null,
  item int not null,
  tipo text not null,
  correta jsonb,
  tempo int not null default 45,
  pontua boolean not null default false,
  primary key (atividade, item)
);

create table if not exists public.ofc_respostas (
  id bigint generated always as identity primary key,
  amb text not null,
  participante uuid not null references public.ofc_participantes(id) on delete cascade,
  atividade text not null,
  item int not null,
  resposta jsonb not null,
  correta boolean,
  pontos int not null default 0,
  criado_em timestamptz not null default now(),
  unique (participante, atividade, item)
);
create index if not exists ofc_respostas_idx on public.ofc_respostas(amb, atividade, item);

create table if not exists public.ofc_mural (
  id bigint generated always as identity primary key,
  amb text not null,
  participante uuid not null references public.ofc_participantes(id) on delete cascade,
  texto text not null,
  criado_em timestamptz not null default now()
);
create index if not exists ofc_mural_amb_idx on public.ofc_mural(amb);

create table if not exists public.ofc_votos (
  mural_id bigint not null references public.ofc_mural(id) on delete cascade,
  participante uuid not null references public.ofc_participantes(id) on delete cascade,
  primary key (mural_id, participante)
);
create index if not exists ofc_votos_part_idx on public.ofc_votos(participante);
create index if not exists ofc_mural_part_idx on public.ofc_mural(participante);

alter table public.ofc_config enable row level security;
alter table public.ofc_participantes enable row level security;
alter table public.ofc_estado enable row level security;
alter table public.ofc_gabarito enable row level security;
alter table public.ofc_respostas enable row level security;
alter table public.ofc_mural enable row level security;
alter table public.ofc_votos enable row level security;

revoke all on public.ofc_config, public.ofc_participantes, public.ofc_estado, public.ofc_gabarito,
  public.ofc_respostas, public.ofc_mural, public.ofc_votos from anon, authenticated;

-- ---------- funções ----------

create or replace function public.ofc_pin_ok(p_amb text, p_pin text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from ofc_config where amb = p_amb and pin = p_pin);
$$;

create or replace function public.ofc_entrar(p_amb text, p_nome text, p_campus text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_nome text := btrim(coalesce(p_nome,'')); v_campus text := btrim(coalesce(p_campus,''));
begin
  if not exists (select 1 from ofc_config where amb = p_amb) then raise exception 'ambiente inválido'; end if;
  if length(v_nome) < 1 or length(v_nome) > 30 then raise exception 'nome inválido'; end if;
  if length(v_campus) < 1 or length(v_campus) > 40 then raise exception 'campus inválido'; end if;
  if (select count(*) from ofc_participantes where amb = p_amb) >= 1500 then raise exception 'limite de participantes'; end if;
  insert into ofc_participantes(amb, nome, campus) values (p_amb, v_nome, v_campus) returning id into v_id;
  return v_id;
end $$;

create or replace function public.ofc_estado_get(p_amb text) returns json
language sql stable security definer set search_path = public, pg_temp as $$
  select json_build_object('passo', e.passo, 'atividade', e.atividade, 'item', e.item, 'fase', e.fase,
    'aberto_em', e.aberto_em, 'agora', now(),
    'tempo', (select g.tempo from ofc_gabarito g where g.atividade = e.atividade and g.item = e.item))
  from ofc_estado e where e.amb = p_amb;
$$;

create or replace function public.ofc_controle(p_amb text, p_pin text, p_passo int, p_atividade text, p_item int, p_fase text) returns json
language plpgsql security definer set search_path = public, pg_temp as $$
declare e ofc_estado;
begin
  if not ofc_pin_ok(p_amb, p_pin) then raise exception 'PIN incorreto'; end if;
  if p_fase not in ('espera','aberta','revelada') then raise exception 'fase inválida'; end if;
  select * into e from ofc_estado where amb = p_amb;
  update ofc_estado set passo = p_passo, atividade = p_atividade, item = p_item, fase = p_fase,
    aberto_em = case when p_fase = 'aberta' and (e.fase <> 'aberta' or e.atividade is distinct from p_atividade or e.item is distinct from p_item)
                     then now() else e.aberto_em end,
    atualizado_em = now()
  where amb = p_amb;
  return ofc_estado_get(p_amb);
end $$;

create or replace function public.ofc_responder(p_amb text, p_pid uuid, p_atividade text, p_item int, p_resposta jsonb) returns json
language plpgsql security definer set search_path = public, pg_temp as $$
declare e ofc_estado; g ofc_gabarito; v_correta boolean; v_pontos int := 0; v_bonus int := 0; v_n int; v_ok int; v_ins int;
begin
  if not exists (select 1 from ofc_participantes where id = p_pid and amb = p_amb) then raise exception 'participante não encontrado'; end if;
  if p_resposta is null or pg_column_size(p_resposta) > 2000 then raise exception 'resposta inválida'; end if;
  select * into e from ofc_estado where amb = p_amb;
  if e.atividade is distinct from p_atividade or e.item is distinct from p_item or e.fase <> 'aberta' then
    return json_build_object('ok', false, 'motivo', 'fechada');
  end if;
  select * into g from ofc_gabarito where atividade = p_atividade and item = p_item;
  if not found then raise exception 'atividade inexistente'; end if;
  v_bonus := greatest(0, round(50 * (1 - extract(epoch from (now() - e.aberto_em)) / greatest(g.tempo,1)))::int);
  if g.tipo = 'escolha' and g.correta is not null then
    v_correta := (p_resposta = g.correta);
    if v_correta then v_pontos := 100 + v_bonus; end if;
  elsif g.tipo = 'ordem' then
    v_n := jsonb_array_length(g.correta);
    select count(*) into v_ok from jsonb_array_elements(p_resposta) with ordinality a(v,i)
      join jsonb_array_elements(g.correta) with ordinality b(v,i) using (i) where a.v = b.v;
    v_correta := (v_ok = v_n);
    v_pontos := case when v_correta then 100 + v_bonus else round(100.0 * v_ok / v_n)::int end;
  elsif g.tipo = 'campos' then
    select count(*) into v_n from jsonb_each(g.correta);
    select count(*) into v_ok from jsonb_each(g.correta) c where p_resposta -> c.key = c.value;
    v_correta := (v_ok = v_n);
    v_pontos := 25 * v_ok + case when v_correta then v_bonus else 0 end;
  end if;
  if not g.pontua then v_pontos := 0; end if;
  insert into ofc_respostas(amb, participante, atividade, item, resposta, correta, pontos)
    values (p_amb, p_pid, p_atividade, p_item, p_resposta, v_correta, v_pontos)
    on conflict (participante, atividade, item) do nothing;
  get diagnostics v_ins = row_count;
  return json_build_object('ok', true, 'repetida', v_ins = 0);
end $$;

create or replace function public.ofc_meu(p_amb text, p_pid uuid) returns json
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare p ofc_participantes; e ofc_estado; r ofc_respostas; v_pontos int; v_pos int; v_gab jsonb;
begin
  select * into p from ofc_participantes where id = p_pid and amb = p_amb;
  if not found then return null; end if;
  select * into e from ofc_estado where amb = p_amb;
  select coalesce(sum(pontos),0) into v_pontos from ofc_respostas where participante = p_pid;
  select 1 + count(*) into v_pos from (
    select participante from ofc_respostas where amb = p_amb group by participante having sum(pontos) > v_pontos) t;
  select * into r from ofc_respostas where participante = p_pid and atividade = e.atividade and item = e.item;
  if e.fase = 'revelada' then select correta into v_gab from ofc_gabarito where atividade = e.atividade and item = e.item; end if;
  return json_build_object('nome', p.nome, 'campus', p.campus, 'pontos', v_pontos, 'posicao', v_pos,
    'respondeu', r.id is not null, 'resposta', r.resposta,
    'correta', case when e.fase = 'revelada' then r.correta end,
    'pontos_item', case when e.fase = 'revelada' then r.pontos end,
    'gabarito', v_gab);
end $$;

create or replace function public.ofc_resultados(p_amb text, p_atividade text, p_item int) returns json
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare g ofc_gabarito; v_total int; v_dados json;
begin
  select * into g from ofc_gabarito where atividade = p_atividade and item = p_item;
  if not found then return null; end if;
  select count(*) into v_total from ofc_respostas where amb = p_amb and atividade = p_atividade and item = p_item;
  if g.tipo = 'escolha' then
    select json_agg(json_build_object('v', v, 'n', n)) into v_dados from (
      select resposta #>> '{}' v, count(*) n from ofc_respostas
      where amb = p_amb and atividade = p_atividade and item = p_item group by 1) t;
  elsif g.tipo = 'multi' then
    select json_agg(json_build_object('v', v, 'n', n)) into v_dados from (
      select x.v, count(*) n from ofc_respostas r, jsonb_array_elements_text(r.resposta) x(v)
      where r.amb = p_amb and r.atividade = p_atividade and r.item = p_item and jsonb_typeof(r.resposta) = 'array' group by 1) t;
  elsif g.tipo = 'campos' then
    select json_agg(json_build_object('k', k, 'v', v, 'n', n)) into v_dados from (
      select x.key k, x.value v, count(*) n from ofc_respostas r, jsonb_each_text(r.resposta) x
      where r.amb = p_amb and r.atividade = p_atividade and r.item = p_item and jsonb_typeof(r.resposta) = 'object' group by 1, 2) t;
  elsif g.tipo = 'ordem' then
    select json_build_object('certas', count(*) filter (where correta), 'media', coalesce(round(avg(pontos)),0)) into v_dados
      from ofc_respostas where amb = p_amb and atividade = p_atividade and item = p_item;
  elsif g.tipo = 'texto' then
    select json_agg(t.v) into v_dados from (
      select resposta #>> '{}' v from ofc_respostas
      where amb = p_amb and atividade = p_atividade and item = p_item order by criado_em desc limit 80) t;
  end if;
  return json_build_object('total', v_total, 'tipo', g.tipo, 'dados', coalesce(v_dados, '[]'::json),
    'participantes', (select count(*) from ofc_participantes where amb = p_amb));
end $$;

create or replace function public.ofc_ranking(p_amb text) returns json
language sql stable security definer set search_path = public, pg_temp as $$
  with tot as (
    select p.id, p.nome, p.campus, coalesce(sum(r.pontos),0)::int pontos
    from ofc_participantes p left join ofc_respostas r on r.participante = p.id
    where p.amb = p_amb group by p.id)
  select json_build_object(
    'participantes', (select count(*) from tot),
    'por_campus', (select coalesce(json_agg(json_build_object('campus', campus, 'n', n) order by n desc, campus), '[]'::json)
                   from (select campus, count(*) n from tot group by campus) c),
    'individual', (select coalesce(json_agg(json_build_object('nome', nome, 'campus', campus, 'pontos', pontos) order by pontos desc, nome), '[]'::json)
                   from (select * from tot order by pontos desc, nome limit 10) i),
    'campi', (select coalesce(json_agg(json_build_object('campus', campus, 'media', media, 'n', n) order by media desc, campus), '[]'::json)
              from (select campus, round(avg(pontos))::int media, count(*) n from tot group by campus) m));
$$;

create or replace function public.ofc_mural_enviar(p_amb text, p_pid uuid, p_texto text) returns json
language plpgsql security definer set search_path = public, pg_temp as $$
declare v text := btrim(coalesce(p_texto,''));
begin
  if not exists (select 1 from ofc_participantes where id = p_pid and amb = p_amb) then raise exception 'participante não encontrado'; end if;
  if length(v) < 5 or length(v) > 280 then raise exception 'A pergunta deve ter entre 5 e 280 caracteres'; end if;
  if (select count(*) from ofc_mural where participante = p_pid) >= 5 then raise exception 'Limite de 5 perguntas por participante'; end if;
  insert into ofc_mural(amb, participante, texto) values (p_amb, p_pid, v);
  return json_build_object('ok', true);
end $$;

create or replace function public.ofc_mural_votar(p_amb text, p_pid uuid, p_id bigint) returns json
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from ofc_participantes where id = p_pid and amb = p_amb) then raise exception 'participante não encontrado'; end if;
  if not exists (select 1 from ofc_mural where id = p_id and amb = p_amb) then raise exception 'pergunta não encontrada'; end if;
  if exists (select 1 from ofc_votos where mural_id = p_id and participante = p_pid) then
    delete from ofc_votos where mural_id = p_id and participante = p_pid;
  else
    insert into ofc_votos(mural_id, participante) values (p_id, p_pid);
  end if;
  return json_build_object('ok', true);
end $$;

create or replace function public.ofc_mural_listar(p_amb text, p_pid uuid default null) returns json
language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(json_agg(json_build_object('id', id, 'texto', texto, 'votos', votos, 'meu', meu) order by votos desc, id), '[]'::json)
  from (select m.id, m.texto, (select count(*) from ofc_votos v where v.mural_id = m.id) votos,
               exists (select 1 from ofc_votos v where v.mural_id = m.id and v.participante = p_pid) meu
        from ofc_mural m where m.amb = p_amb order by 3 desc, m.id limit 40) t;
$$;

create or replace function public.ofc_reset(p_amb text, p_pin text) returns json
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not ofc_pin_ok(p_amb, p_pin) then raise exception 'PIN incorreto'; end if;
  delete from ofc_participantes where amb = p_amb;
  update ofc_estado set passo = 0, atividade = null, item = null, fase = 'espera', aberto_em = null, atualizado_em = now() where amb = p_amb;
  return json_build_object('ok', true);
end $$;

create or replace function public.ofc_exportar(p_amb text, p_pin text) returns json
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not ofc_pin_ok(p_amb, p_pin) then raise exception 'PIN incorreto'; end if;
  return json_build_object(
    'ambiente', p_amb, 'gerado_em', now(),
    'ranking', ofc_ranking(p_amb),
    'questoes', (select coalesce(json_agg(json_build_object('atividade', atividade, 'item', item, 'respostas', n, 'acertos', ok) order by atividade, item), '[]'::json)
                 from (select atividade, item, count(*) n, count(*) filter (where correta) ok from ofc_respostas where amb = p_amb group by 1, 2) q),
    'respostas', (select coalesce(json_agg(json_build_object('campus', p.campus, 'atividade', r.atividade, 'item', r.item, 'resposta', r.resposta, 'correta', r.correta, 'pontos', r.pontos)), '[]'::json)
                  from ofc_respostas r join ofc_participantes p on p.id = r.participante where r.amb = p_amb),
    'mural', ofc_mural_listar(p_amb, null));
end $$;

revoke execute on function public.ofc_pin_ok(text,text), public.ofc_entrar(text,text,text), public.ofc_estado_get(text),
  public.ofc_controle(text,text,int,text,int,text), public.ofc_responder(text,uuid,text,int,jsonb), public.ofc_meu(text,uuid),
  public.ofc_resultados(text,text,int), public.ofc_ranking(text), public.ofc_mural_enviar(text,uuid,text),
  public.ofc_mural_votar(text,uuid,bigint), public.ofc_mural_listar(text,uuid), public.ofc_reset(text,text), public.ofc_exportar(text,text)
  from public, anon, authenticated;
grant execute on function public.ofc_entrar(text,text,text), public.ofc_estado_get(text),
  public.ofc_controle(text,text,int,text,int,text), public.ofc_responder(text,uuid,text,int,jsonb), public.ofc_meu(text,uuid),
  public.ofc_resultados(text,text,int), public.ofc_ranking(text), public.ofc_mural_enviar(text,uuid,text),
  public.ofc_mural_votar(text,uuid,bigint), public.ofc_mural_listar(text,uuid), public.ofc_reset(text,text), public.ofc_exportar(text,text)
  to anon;
