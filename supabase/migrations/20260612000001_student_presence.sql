-- Student presence data from Mashov external attendance system.
-- Also adds gender to user_profiles for gender-aware lateness labels.

-- 1. student_presence table
CREATE TABLE public.student_presence (
    student_id     uuid    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    semester       text    NOT NULL,
    presence_days  smallint NOT NULL DEFAULT 0,
    absence_days   smallint NOT NULL DEFAULT 0,
    lateness_count smallint,        -- raw count from Mashov; shown to staff as reference
    lateness       text,            -- 'none' | 'sometimes' | 'often' (staff qualitative input)
    imported_at    timestamptz,     -- null = manually entered, set on XLSX import
    imported_by    uuid REFERENCES public.users(id),
    PRIMARY KEY (student_id, semester)
);

ALTER TABLE public.student_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff have full access"
    ON public.student_presence
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));

CREATE POLICY "admins have full access"
    ON public.student_presence
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true);

CREATE POLICY "students read their own"
    ON public.student_presence
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

-- 2. Rebuild report_cards_public to include pronouns (from profile jsonb) and presence data
DROP VIEW IF EXISTS public.report_cards_public;
CREATE VIEW public.report_cards_public AS
SELECT
    rcp.id,
    rcp.report_semester,
    u.first_name,
    u.last_name,
    up.id_number,
    (up.profile ->> 'pronouns') AS pronouns,
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
    -- research columns
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
    up.portfolio_url,
    -- presence data (joined from student_presence for the matching semester)
    pres.presence_days,
    pres.absence_days,
    pres.lateness_count,
    pres.lateness
FROM public.report_cards_private rcp
LEFT JOIN public.users u ON u.id = rcp.id
LEFT JOIN public.user_profiles up ON up.id = rcp.id
LEFT JOIN public.student_presence pres ON pres.student_id = rcp.id AND pres.semester = rcp.report_semester;
