create extension if not exists "pgcrypto";

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_label text not null,
  currency_code text not null default 'PHP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_label)
);

create table if not exists public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('income', 'savings', 'expenses')),
  group_name text,
  category text not null,
  projected_amount numeric(12,2) not null default 0,
  actual_amount numeric(12,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budgets_user_month_idx on public.budgets(user_id, month_label);
create index if not exists budget_entries_budget_idx on public.budget_entries(budget_id, section, sort_order);
create index if not exists budget_entries_user_idx on public.budget_entries(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
before update on public.budgets
for each row execute procedure public.set_updated_at();

drop trigger if exists budget_entries_set_updated_at on public.budget_entries;
create trigger budget_entries_set_updated_at
before update on public.budget_entries
for each row execute procedure public.set_updated_at();

alter table public.budgets enable row level security;
alter table public.budget_entries enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
on public.budgets for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
on public.budgets for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
on public.budgets for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
on public.budgets for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "entries_select_own" on public.budget_entries;
create policy "entries_select_own"
on public.budget_entries for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.budget_entries;
create policy "entries_insert_own"
on public.budget_entries for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.budget_entries;
create policy "entries_update_own"
on public.budget_entries for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.budget_entries;
create policy "entries_delete_own"
on public.budget_entries for delete
to authenticated
using (auth.uid() = user_id);
