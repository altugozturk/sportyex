-- Sportyex MVP schema
-- Run this in your Supabase SQL editor

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  token_id text not null,
  direction text not null check (direction in ('bull', 'bear')),
  fingerprint text not null,
  created_at timestamptz default now()
);

create index if not exists votes_token_id_idx on votes (token_id);
create index if not exists votes_created_at_idx on votes (created_at);

-- Optional: prevent duplicate votes from same fingerprint per token
-- create unique index votes_fp_token_idx on votes (token_id, fingerprint);
