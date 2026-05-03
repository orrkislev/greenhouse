-- Add pol (Presentation of Learning) evaluation column
ALTER TABLE public.report_cards_private
    ADD COLUMN IF NOT EXISTS pol jsonb;

-- Rebuild view to expose the new pol column
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
    rcp.pol,
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
