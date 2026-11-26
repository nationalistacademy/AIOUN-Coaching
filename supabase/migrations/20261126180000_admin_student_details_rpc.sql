-- Admin-only editable student details RPC.
-- Keeps protected student fields (roll_no, auth_user_id, mode, card status) out of this update path.
create or replace function public.admin_update_student_details(
  p_student_id uuid,
  p_updates jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_key text;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_updates is null or jsonb_typeof(p_updates) <> 'object' then
    raise exception 'Updates must be a JSON object' using errcode = '22023';
  end if;

  if p_updates = '{}'::jsonb then
    raise exception 'No student details supplied' using errcode = '22023';
  end if;

  for v_key in select jsonb_object_keys(p_updates)
  loop
    if v_key not in ('full_name', 'father_name', 'phone', 'course', 'batch', 'photo_url') then
      raise exception 'Field is not editable through this function: %', v_key using errcode = '22023';
    end if;
  end loop;

  update public.students
  set
    full_name = case when p_updates ? 'full_name' then p_updates->>'full_name' else full_name end,
    father_name = case when p_updates ? 'father_name' then p_updates->>'father_name' else father_name end,
    phone = case when p_updates ? 'phone' then p_updates->>'phone' else phone end,
    course = case when p_updates ? 'course' then p_updates->>'course' else course end,
    batch = case when p_updates ? 'batch' then p_updates->>'batch' else batch end,
    photo_url = case when p_updates ? 'photo_url' then p_updates->>'photo_url' else photo_url end,
    updated_at = now()
  where id = p_student_id;

  if not found then
    raise exception 'Student record not found' using errcode = 'P0002';
  end if;
end;
$function$;

revoke all on function public.admin_update_student_details(uuid, jsonb) from public, anon;
grant execute on function public.admin_update_student_details(uuid, jsonb) to authenticated;
