-- Add visibility column to chat table (default: private)
alter table public.chat
  add column visibility text not null default 'private'
  check (visibility in ('private', 'public'));
