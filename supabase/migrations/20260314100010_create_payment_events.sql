create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references payment_intents(id),
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
