-- Add 'id' (user UUID) to the student objects returned by group_full_state.
-- Previously omitted, causing client-side role filtering to silently fail.
CREATE OR REPLACE FUNCTION public.group_full_state(p_group_id uuid, p_term_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
WITH grp AS (
  SELECT
    g.name,
    g.type,
    g.description
  FROM public.groups g
  WHERE g.id = p_group_id
),
group_students AS (
  SELECT
    ug.user_id AS id,
    u.first_name,
    u.last_name,
    u.role
  FROM public.users_groups ug
  JOIN public.users u ON u.id = ug.user_id
  WHERE ug.group_id = p_group_id
),
target_term AS (
  SELECT COALESCE(p_term_id, (SELECT id FROM public.current_term LIMIT 1)) AS id
),
group_events AS (
  SELECT COALESCE(
    json_agg(
      e.*
      ORDER BY e.start ASC, e.created_at ASC
    ),
    '[]'::json
  ) AS events_json
  FROM public.events e
  WHERE e.group_id = p_group_id
    AND p_term_id IS NULL
    AND (
      (e.day_of_the_week IS NULL AND e.date = current_date)
      OR
      (e.day_of_the_week IS NOT NULL AND e.day_of_the_week = EXTRACT(DOW FROM current_date)::int + 1)
    )
),
students_payload AS (
  SELECT
    json_build_object(
      'id',         gs.id,
      'first_name', gs.first_name,
      'last_name',  gs.last_name,
      'role', gs.role,
      'project', (
                    SELECT row_to_json(p.*)
                    FROM public.projects p
                    WHERE p.student_id = gs.id
                      AND p.term @> ARRAY[(SELECT id FROM target_term)]::uuid[]
                    ORDER BY p.created_at DESC
                    LIMIT 1
                  ),
      'research',   (
                    SELECT row_to_json(r.*)
                    FROM public.research r
                    WHERE r.student_id = gs.id
                      AND r.term @> ARRAY[(SELECT id FROM target_term)]::uuid[]
                    ORDER BY r.created_at DESC
                    LIMIT 1
                  ),
      'events',     CASE
                      WHEN p_term_id IS NULL THEN (
                        COALESCE(public.get_user_events(gs.id, current_date, current_date)::jsonb, '[]'::jsonb)
                        ||
                        COALESCE(public.get_user_recurring_events(gs.id, EXTRACT(DOW FROM current_date)::int + 1)::jsonb, '[]'::jsonb)
                      )::json
                      ELSE NULL
                    END
    ) AS student_obj
  FROM group_students gs
),
students_agg AS (
  SELECT COALESCE(
           json_agg(
             student_obj
             ORDER BY
               (student_obj->>'last_name') ASC NULLS LAST,
               (student_obj->>'first_name') ASC NULLS LAST
           ),
           '[]'::json
         ) AS students_json
  FROM students_payload
)
SELECT json_build_object(
         'name',        (SELECT name        FROM grp),
         'type',        (SELECT type        FROM grp),
         'description', (SELECT description FROM grp),
         'students',    (SELECT students_json FROM students_agg),
         'events',      CASE WHEN p_term_id IS NULL THEN (SELECT events_json FROM group_events) ELSE NULL END
       );
$function$;
