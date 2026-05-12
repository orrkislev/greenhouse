-- Rename pol → end_eval: generic "end-of-semester evaluation" column.
-- Stores { type: 'pol', ... } for years 2-4 POL, or { type: 'summer_eval_1b', ... } for year 1 summer eval.
ALTER TABLE public.report_cards_private RENAME COLUMN pol TO end_eval;

-- Fix audit trigger to reference end_eval instead of the old pol column
CREATE OR REPLACE FUNCTION public.log_report_card_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_changed_fields TEXT[] := '{}';
  v_new_data JSONB;
  v_old_data JSONB;
BEGIN
  v_new_data := to_jsonb(NEW);
  v_old_data := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.ikigai IS DISTINCT FROM NEW.ikigai THEN
      v_changed_fields := array_append(v_changed_fields, 'ikigai');
    END IF;
    IF OLD.mentors IS DISTINCT FROM NEW.mentors THEN
      v_changed_fields := array_append(v_changed_fields, 'mentors');
    END IF;
    IF OLD.liba IS DISTINCT FROM NEW.liba THEN
      v_changed_fields := array_append(v_changed_fields, 'liba');
    END IF;
    IF OLD.learning IS DISTINCT FROM NEW.learning THEN
      v_changed_fields := array_append(v_changed_fields, 'learning');
    END IF;
    IF OLD.vocation IS DISTINCT FROM NEW.vocation THEN
      v_changed_fields := array_append(v_changed_fields, 'vocation');
    END IF;
    IF OLD.special IS DISTINCT FROM NEW.special THEN
      v_changed_fields := array_append(v_changed_fields, 'special');
    END IF;
    IF OLD.end_eval IS DISTINCT FROM NEW.end_eval THEN
      v_changed_fields := array_append(v_changed_fields, 'end_eval');
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR array_length(v_changed_fields, 1) > 0 THEN
    INSERT INTO public.audit_log (
      updating_user,
      entity_type,
      student_id,
      new_data,
      old_data,
      changed_fields
    ) VALUES (
      COALESCE(auth.uid(), NEW.id),
      'report_card',
      NEW.id,
      v_new_data,
      v_old_data,
      CASE
        WHEN TG_OP = 'UPDATE' THEN v_changed_fields
        ELSE ARRAY['created']
      END
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Rebuild view to expose end_eval (replacing the previous rcp.pol reference)
DROP VIEW IF EXISTS "public"."report_cards_public";
CREATE VIEW "public"."report_cards_public" AS
SELECT
    rcp.id,
    rcp.report_semester,
    u.first_name,
    u.last_name,
    up.id_number,
    rcp.ikigai,
    rcp.liba,
    rcp.learning,
    rcp.vocation,
    rcp.special,
    rcp.end_eval,
    ( SELECT g.name
        FROM public.users_groups ug
        JOIN public.groups g ON g.id = ug.group_id
        WHERE ug.user_id = rcp.id AND g.type = 'major'::public.group_type
        LIMIT 1
    ) AS major,
    ( SELECT g.name
        FROM public.users_groups ug
        JOIN public.groups g ON g.id = ug.group_id
        WHERE ug.user_id = rcp.id AND g.type = 'class'::public.group_type
        LIMIT 1
    ) AS class,
    ( SELECT g.description
        FROM public.users_groups ug
        JOIN public.groups g ON g.id = ug.group_id
        WHERE ug.user_id = rcp.id AND g.type = 'class'::public.group_type
        LIMIT 1
    ) AS year,
    ( SELECT
            CASE
                WHEN p.metadata ? 'review' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                ELSE
                    jsonb_build_object('id', p.id, 'title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
            END
        FROM public.projects p
        LEFT JOIN public.staff_public sp ON sp.user_id = p.master
        WHERE p.student_id = rcp.id AND p.term @> ARRAY['ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid]
        LIMIT 1
    ) AS autumn_project,
    ( SELECT
            CASE
                WHEN p.metadata ? 'review' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                ELSE
                    jsonb_build_object('id', p.id, 'title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
            END
        FROM public.projects p
        LEFT JOIN public.staff_public sp ON sp.user_id = p.master
        WHERE p.student_id = rcp.id AND p.term @> ARRAY['2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid]
        LIMIT 1
    ) AS winter_project,
    ( SELECT
            CASE
                WHEN r.metadata ? 'review' THEN
                    (jsonb_build_object('id', r.id) || (r.metadata -> 'review')) ||
                    jsonb_build_object('title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid))
                ELSE
                    jsonb_build_object('id', r.id, 'title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid))
            END
        FROM public.research r
        WHERE r.student_id = rcp.id AND r.term @> ARRAY['ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid]
        LIMIT 1
    ) AS autumn_research,
    ( SELECT
            CASE
                WHEN r.metadata ? 'review' THEN
                    (jsonb_build_object('id', r.id) || (r.metadata -> 'review')) ||
                    jsonb_build_object('title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid))
                ELSE
                    jsonb_build_object('id', r.id, 'title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid))
            END
        FROM public.research r
        WHERE r.student_id = rcp.id AND r.term @> ARRAY['2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid]
        LIMIT 1
    ) AS winter_research,
    up.portfolio_url
FROM public.report_cards_private rcp
LEFT JOIN public.users u ON u.id = rcp.id
LEFT JOIN public.user_profiles up ON up.id = rcp.id;
