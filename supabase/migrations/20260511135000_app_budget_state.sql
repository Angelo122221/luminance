create table if not exists public.app_budget_state (
  id text primary key,
  month_label text not null,
  currency_code text not null default 'PHP',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_app_budget_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_budget_state_set_updated_at on public.app_budget_state;
create trigger app_budget_state_set_updated_at
before update on public.app_budget_state
for each row execute procedure public.set_app_budget_state_updated_at();

alter table public.app_budget_state enable row level security;

drop policy if exists "app_budget_state_read_all" on public.app_budget_state;
create policy "app_budget_state_read_all"
on public.app_budget_state
for select
to anon, authenticated
using (true);

drop policy if exists "app_budget_state_write_all" on public.app_budget_state;
create policy "app_budget_state_write_all"
on public.app_budget_state
for all
to anon, authenticated
using (true)
with check (true);
