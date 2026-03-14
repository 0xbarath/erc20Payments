create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  recipient_address text not null,
  default_chain_id integer not null,
  default_token_address text not null,
  created_at timestamptz not null default now()
);

alter table vendors enable row level security;

create policy "Allow anonymous read access" on vendors
  for select using (true);
