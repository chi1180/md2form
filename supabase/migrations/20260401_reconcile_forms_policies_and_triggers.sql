-- Reconcile legacy + new migration overlap for forms/responses platform.

-- Keep a single response counter trigger path.
drop trigger if exists bump_form_response_count on public.responses;
drop function if exists public.bump_form_response_count();

-- Keep one policy set per table/action to avoid duplicated permissive policies.
drop policy if exists forms_select_owner on public.forms;
drop policy if exists forms_insert_owner on public.forms;
drop policy if exists forms_update_owner on public.forms;
drop policy if exists forms_delete_owner on public.forms;
drop policy if exists forms_select_public on public.forms;

drop policy if exists responses_select_owner on public.responses;
drop policy if exists responses_insert_public on public.responses;
drop policy if exists responses_delete_owner on public.responses;

drop policy if exists response_items_select_owner on public.response_items;
drop policy if exists response_items_insert_public on public.response_items;
drop policy if exists response_items_delete_owner on public.response_items;

drop policy if exists signature_upload_public_response on storage.objects;
drop policy if exists signature_read_form_owner on storage.objects;
drop policy if exists signature_delete_form_owner on storage.objects;

-- Remove helper functions that are no longer referenced.
drop function if exists public.form_owner(uuid);
drop function if exists public.form_accepting_public_responses(uuid);
drop function if exists public.path_form_id_matches_first_folder(text, uuid);

-- Harden function search_path to satisfy security linter.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- Ensure constraints match app behavior (0 means no responses allowed).
alter table public.forms
  drop constraint if exists forms_response_limit_check;

alter table public.forms
  add constraint forms_response_limit_non_negative
  check (response_limit is null or response_limit >= 0);

alter table public.forms
  drop constraint if exists forms_response_count_non_negative;

alter table public.forms
  add constraint forms_response_count_non_negative
  check (response_count >= 0);

-- Cover response_id FK lookup path for response_items.
create index if not exists response_items_response_id_idx
  on public.response_items (response_id);
