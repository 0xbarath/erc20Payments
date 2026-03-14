create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id),
  vendor_slug text not null,
  invoice_id text not null,
  merchant_name text not null,
  display_currency text not null default 'USD',
  display_amount text not null,
  chain_id integer not null,
  token_address text not null,
  token_symbol text not null default 'USDC',
  token_decimals integer not null default 6,
  recipient_address text not null,
  atomic_amount text not null,
  nonce uuid not null default gen_random_uuid(),
  expires_at timestamptz not null,
  porto_extension jsonb,
  status text not null default 'awaiting_payment',
  tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payment_intents_invoice_id on payment_intents(invoice_id);
create index idx_payment_intents_vendor_slug on payment_intents(vendor_slug);
create index idx_payment_intents_status on payment_intents(status);
create index idx_payment_intents_created_at on payment_intents(created_at desc);

alter table payment_intents enable row level security;

create policy "Allow anonymous read access" on payment_intents
  for select using (true);
