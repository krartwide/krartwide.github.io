create table if not exists record_vault (
  user_id text primary key,
  payload text not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
