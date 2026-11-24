create table if not exists sources (
  chat_id text primary key,
  titulo text,
  ultimo_message_id bigint not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists messages (
  chat_id text not null,
  message_id bigint not null,
  texto text,
  data timestamptz,
  primary key (chat_id, message_id)
);

create table if not exists produto (
  nome text not null,
  preco numeric(10,2) not null,
  descricao text,
  status boolean not null default true,
  data timestamptz default now(),
  primary key (nome)
);