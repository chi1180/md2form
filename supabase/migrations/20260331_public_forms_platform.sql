create extension if not exists pgcrypto;

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  markdown_source text not null,
  schema_json jsonb not null,
  is_public boolean not null default false,
  accepting_responses boolean not null default false,
  public_slug text unique,
  response_limit integer,
  response_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint forms_response_limit_non_negative check (
    response_limit is null or response_limit >= 0
  ),
  constraint forms_response_count_non_negative check (response_count >= 0)
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  submitted_at timestamptz not null default timezone('utc', now()),
  respondent_fingerprint text,
  answers_json jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.response_items (
  id bigserial primary key,
  response_id uuid not null references public.responses (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  question_key text not null,
  question_type text not null,
  value_text text,
  value_number numeric,
  value_json jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists forms_owner_updated_idx on public.forms (owner_user_id, updated_at desc);
create index if not exists forms_public_slug_idx on public.forms (public_slug);
create index if not exists responses_form_submitted_idx on public.responses (form_id, submitted_at desc);
create index if not exists response_items_form_question_idx on public.response_items (form_id, question_key);
create index if not exists response_items_form_type_idx on public.response_items (form_id, question_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_forms_updated_at on public.forms;
create trigger set_forms_updated_at
before update on public.forms
for each row
execute function public.set_updated_at();

create or replace function public.validate_response_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_form public.forms;
begin
  select *
    into target_form
    from public.forms
   where id = new.form_id
   for update;

  if target_form.id is null then
    raise exception 'form not found';
  end if;

  if target_form.is_public is not true then
    raise exception 'form is not public';
  end if;

  if target_form.accepting_responses is not true then
    raise exception 'form is not accepting responses';
  end if;

  if target_form.response_limit is not null and target_form.response_count >= target_form.response_limit then
    raise exception 'response limit reached';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_response_insert_trigger on public.responses;
create trigger validate_response_insert_trigger
before insert on public.responses
for each row
execute function public.validate_response_insert();

create or replace function public.increment_form_response_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forms
     set response_count = response_count + 1
   where id = new.form_id;

  return new;
end;
$$;

drop trigger if exists increment_form_response_count_trigger on public.responses;
create trigger increment_form_response_count_trigger
after insert on public.responses
for each row
execute function public.increment_form_response_count();

alter table public.forms enable row level security;
alter table public.responses enable row level security;
alter table public.response_items enable row level security;

drop policy if exists forms_owner_select on public.forms;
create policy forms_owner_select
on public.forms
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists forms_owner_insert on public.forms;
create policy forms_owner_insert
on public.forms
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists forms_owner_update on public.forms;
create policy forms_owner_update
on public.forms
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists forms_owner_delete on public.forms;
create policy forms_owner_delete
on public.forms
for delete
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists forms_public_select on public.forms;
create policy forms_public_select
on public.forms
for select
to anon, authenticated
using (is_public = true);

drop policy if exists responses_owner_select on public.responses;
create policy responses_owner_select
on public.responses
for select
to authenticated
using (
  exists (
    select 1
      from public.forms f
     where f.id = responses.form_id
       and f.owner_user_id = auth.uid()
  )
);

drop policy if exists responses_public_insert on public.responses;
create policy responses_public_insert
on public.responses
for insert
to anon, authenticated
with check (
  exists (
    select 1
      from public.forms f
     where f.id = responses.form_id
       and f.is_public = true
       and f.accepting_responses = true
       and (f.response_limit is null or f.response_count < f.response_limit)
  )
);

drop policy if exists response_items_owner_select on public.response_items;
create policy response_items_owner_select
on public.response_items
for select
to authenticated
using (
  exists (
    select 1
      from public.forms f
     where f.id = response_items.form_id
       and f.owner_user_id = auth.uid()
  )
);

drop policy if exists response_items_public_insert on public.response_items;
create policy response_items_public_insert
on public.response_items
for insert
to anon, authenticated
with check (
  exists (
    select 1
      from public.forms f
     where f.id = response_items.form_id
       and f.is_public = true
       and f.accepting_responses = true
  )
);

grant select, insert, update, delete on table public.forms to authenticated;
grant select on table public.forms to anon;
grant select on table public.responses to authenticated;
grant insert on table public.responses to anon, authenticated;
grant select on table public.response_items to authenticated;
grant insert on table public.response_items to anon, authenticated;
grant usage, select on sequence public.response_items_id_seq to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

drop policy if exists signatures_object_insert on storage.objects;
create policy signatures_object_insert
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'signatures'
  and exists (
    select 1
      from public.forms f
     where f.id::text = split_part(name, '/', 1)
       and f.is_public = true
       and f.accepting_responses = true
  )
);

drop policy if exists signatures_object_owner_select on storage.objects;
create policy signatures_object_owner_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'signatures'
  and exists (
    select 1
      from public.forms f
     where f.id::text = split_part(name, '/', 1)
       and f.owner_user_id = auth.uid()
  )
);

drop policy if exists signatures_object_owner_delete on storage.objects;
create policy signatures_object_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'signatures'
  and exists (
    select 1
      from public.forms f
     where f.id::text = split_part(name, '/', 1)
       and f.owner_user_id = auth.uid()
  )
);
