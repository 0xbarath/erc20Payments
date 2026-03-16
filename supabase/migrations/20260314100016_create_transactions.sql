create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references payment_intents(id),
  tx_hash text not null,
  block_number bigint not null,
  block_hash text not null,
  from_address text not null,
  to_address text not null,
  gas_used bigint not null,
  effective_gas_price bigint not null,
  status text not null,
  chain_id integer not null,
  log_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_transactions_payment_intent_id on transactions(payment_intent_id);
create unique index idx_transactions_tx_hash on transactions(tx_hash);
