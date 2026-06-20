-- Coolcool Number schema
-- Run this in Supabase SQL editor.

create table if not exists lotto_draws (
  id          bigserial primary key,
  round       integer not null unique,
  draw_date   date not null,
  n1 smallint not null,
  n2 smallint not null,
  n3 smallint not null,
  n4 smallint not null,
  n5 smallint not null,
  n6 smallint not null,
  bonus smallint not null,
  created_at  timestamptz not null default now()
);
create index if not exists lotto_draws_round_desc on lotto_draws(round desc);

create table if not exists number_stats (
  number          smallint primary key check (number between 1 and 45),
  total_count     integer not null default 0,
  recent20_count  integer not null default 0,
  recent50_count  integer not null default 0,
  last_seen_round integer,
  missing_rounds  integer not null default 0,
  score           numeric(6,2) not null default 0,
  updated_at      timestamptz not null default now()
);

create table if not exists pair_stats (
  id          bigserial primary key,
  num_a       smallint not null,
  num_b       smallint not null,
  pair_count  integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique(num_a, num_b),
  check (num_a < num_b)
);
create index if not exists pair_stats_count_desc on pair_stats(pair_count desc);

-- Public read policies (anon read-only; writes happen via service role)
alter table lotto_draws  enable row level security;
alter table number_stats enable row level security;
alter table pair_stats   enable row level security;

drop policy if exists "public read draws"   on lotto_draws;
drop policy if exists "public read numbers" on number_stats;
drop policy if exists "public read pairs"   on pair_stats;

create policy "public read draws"   on lotto_draws  for select using (true);
create policy "public read numbers" on number_stats for select using (true);
create policy "public read pairs"   on pair_stats   for select using (true);
