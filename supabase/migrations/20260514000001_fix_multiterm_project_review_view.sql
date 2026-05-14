-- Fix report_cards_public view for multi-term projects.
--
-- Multi-term projects store per-term review data under review_<name_en>
-- (e.g. review_spring) rather than the generic review key used by single-term
-- projects. The view previously only checked for review, so multi-term projects
-- never surfaced any review content.
--
-- Also sets name_en = 'autumn' for the autumn term which was omitted from
-- 20260513000003_terms_name_en.sql, which would have caused ProjectReview.js
-- to write review data under the key 'review_null' for autumn in a multi-term
-- project.

UPDATE public.terms SET name_en = 'autumn'
WHERE id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid;

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
    -- autumn_project: check review_autumn (multi-term) then review (single-term)
    ( SELECT
            CASE
                WHEN p.metadata ? 'review_autumn' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review_autumn')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
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
    -- winter_project: check review_winter (multi-term) then review (single-term)
    ( SELECT
            CASE
                WHEN p.metadata ? 'review_winter' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review_winter')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
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
    -- spring_project: check review_spring (multi-term) then review (single-term)
    ( SELECT
            CASE
                WHEN p.metadata ? 'review_spring' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review_spring')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                WHEN p.metadata ? 'review' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                ELSE
                    jsonb_build_object('id', p.id, 'title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
            END
        FROM public.projects p
        LEFT JOIN public.staff_public sp ON sp.user_id = p.master
        WHERE p.student_id = rcp.id AND p.term @> ARRAY['5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid]
        LIMIT 1
    ) AS spring_project,
    -- summer_project: check review_summer (multi-term) then review (single-term)
    ( SELECT
            CASE
                WHEN p.metadata ? 'review_summer' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review_summer')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'a08e6acb-1d2d-43f0-89be-b8ebefb54d67'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                WHEN p.metadata ? 'review' THEN
                    (jsonb_build_object('id', p.id) || (p.metadata -> 'review')) ||
                    jsonb_build_object('title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'a08e6acb-1d2d-43f0-89be-b8ebefb54d67'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                ELSE
                    jsonb_build_object('id', p.id, 'title', p.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = 'a08e6acb-1d2d-43f0-89be-b8ebefb54d67'::uuid),
                        'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
            END
        FROM public.projects p
        LEFT JOIN public.staff_public sp ON sp.user_id = p.master
        WHERE p.student_id = rcp.id AND p.term @> ARRAY['a08e6acb-1d2d-43f0-89be-b8ebefb54d67'::uuid]
        LIMIT 1
    ) AS summer_project,
    -- research columns: research has no multi-term review splitting, always uses review key
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
    ( SELECT
            CASE
                WHEN r.metadata ? 'review' THEN
                    (jsonb_build_object('id', r.id) || (r.metadata -> 'review')) ||
                    jsonb_build_object('title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid))
                ELSE
                    jsonb_build_object('id', r.id, 'title', r.title,
                        'term', (SELECT terms.name FROM public.terms WHERE terms.id = '5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid))
            END
        FROM public.research r
        WHERE r.student_id = rcp.id AND r.term @> ARRAY['5238fd66-a6f8-407f-b1d1-4f3c201523ae'::uuid]
        LIMIT 1
    ) AS spring_research,
    up.portfolio_url
FROM public.report_cards_private rcp
LEFT JOIN public.users u ON u.id = rcp.id
LEFT JOIN public.user_profiles up ON up.id = rcp.id;
