-- Spenda schema. Already applied to the linked Supabase project via migration
-- `create_transactions`. Kept here for reference / re-creation.
--
-- One table, scoped to the signed-in user with Row-Level Security so each
-- account only ever sees its own rows. The app writes whole-naira integers.

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense','income')),
  amount integer not null check (amount >= 0),
  category text not null,                       -- expense category OR income source id
  payer text check (payer in ('me','babe')),    -- expenses only; null for income
  note text not null default '',
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                         -- soft delete (last-write-wins sync)
);

alter table public.transactions enable row level security;

create policy "transactions_select_own"
  on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own"
  on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own"
  on public.transactions for delete using (auth.uid() = user_id);

create index transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);
create index transactions_user_updated_idx on public.transactions (user_id, updated_at desc);
