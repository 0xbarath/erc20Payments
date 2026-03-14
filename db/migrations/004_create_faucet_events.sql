create table if not exists faucet_events (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  chain_id integer not null,
  token_address text not null,
  requested_amount text not null,
  status text not null default 'pending',
  tx_hash text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table faucet_events enable row level security;

create policy "Allow anonymous read access" on faucet_events
  for select using (true);
