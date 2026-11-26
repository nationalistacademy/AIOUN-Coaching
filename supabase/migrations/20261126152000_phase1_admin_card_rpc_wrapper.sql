-- Phase 1 acceptance fix: expose a narrow public RPC without exposing
-- the private schema through PostgREST. The privileged function still enforces
-- auth.uid() and private.is_admin() and changes only card fields.
begin;

create or replace function private.admin_set_student_card_fields(
  p_student_id uuid,
  p_student_mode text,
  p_card_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if p_student_mode is not null and p_student_mode not in ('ODL','F2F') then
    raise exception 'invalid student mode' using errcode = '22023';
  end if;

  if p_card_status not in ('Pending','Generated','Printed','Blocked') then
    raise exception 'invalid card status' using errcode = '22023';
  end if;

  update public.students
     set student_mode = p_student_mode,
         card_status = p_card_status,
         updated_at = now()
   where id = p_student_id;

  if not found then
    raise exception 'student not found' using errcode = 'P0002';
  end if;
end;
$function$;

-- Invoker wrapper is the only function the browser calls. The private
-- implementation is not exposed via the Data API schema list.
create or replace function public.admin_set_student_card_fields(
  p_student_id uuid,
  p_student_mode text,
  p_card_status text
)
returns void
language sql
security invoker
set search_path = ''
as $function$
  select private.admin_set_student_card_fields(
    p_student_id, p_student_mode, p_card_status
  );
$function$;

grant usage on schema private to authenticated;
revoke all on function public.admin_set_student_card_fields(uuid,text,text) from public, anon;
grant execute on function public.admin_set_student_card_fields(uuid,text,text) to authenticated;

commit;
