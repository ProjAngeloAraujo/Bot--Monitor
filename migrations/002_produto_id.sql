
alter table produto drop constraint produto_pkey;
alter table produto add column id integer generated always as identity primary key;