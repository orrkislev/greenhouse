-- Local dev auth users — PIN 1111 for all users (password '001111')
-- Safe to re-run: all statements are ON CONFLICT DO NOTHING

SET search_path TO extensions, public, auth;

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES
  ('98773a61-7921-4bb5-a623-8a7ce8281ca0', '00000000-0000-0000-0000-000000000000', 'tal@chamama.org',   crypt('001111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('44cd7c4b-5872-46ac-a5c2-4017a7a8e135', '00000000-0000-0000-0000-000000000000', 'demo3@chamama.org', crypt('001111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('1a3ca980-68ff-4b0b-bf90-5e2c60ac525c', '00000000-0000-0000-0000-000000000000', 'demo1@chamama.org', crypt('001111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('1a141c9f-7b7b-4f77-8b89-7489e4b5917a', '00000000-0000-0000-0000-000000000000', 'demo4@chamama.org', crypt('001111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('f512190e-e467-4dc4-b6f4-7d0794713c94', '00000000-0000-0000-0000-000000000000', 'demo5@chamama.org', crypt('001111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id)
VALUES
  (gen_random_uuid(), '98773a61-7921-4bb5-a623-8a7ce8281ca0', '{"sub":"98773a61-7921-4bb5-a623-8a7ce8281ca0","email":"tal@chamama.org"}',   'email', now(), now(), now(), 'tal@chamama.org'),
  (gen_random_uuid(), '44cd7c4b-5872-46ac-a5c2-4017a7a8e135', '{"sub":"44cd7c4b-5872-46ac-a5c2-4017a7a8e135","email":"demo3@chamama.org"}', 'email', now(), now(), now(), 'demo3@chamama.org'),
  (gen_random_uuid(), '1a3ca980-68ff-4b0b-bf90-5e2c60ac525c', '{"sub":"1a3ca980-68ff-4b0b-bf90-5e2c60ac525c","email":"demo1@chamama.org"}', 'email', now(), now(), now(), 'demo1@chamama.org'),
  (gen_random_uuid(), '1a141c9f-7b7b-4f77-8b89-7489e4b5917a', '{"sub":"1a141c9f-7b7b-4f77-8b89-7489e4b5917a","email":"demo4@chamama.org"}', 'email', now(), now(), now(), 'demo4@chamama.org'),
  (gen_random_uuid(), 'f512190e-e467-4dc4-b6f4-7d0794713c94', '{"sub":"f512190e-e467-4dc4-b6f4-7d0794713c94","email":"demo5@chamama.org"}', 'email', now(), now(), now(), 'demo5@chamama.org')
ON CONFLICT (provider, provider_id) DO NOTHING;

-- GoTrue expects empty strings, not NULL, in token columns
UPDATE auth.users SET
  confirmation_token      = COALESCE(confirmation_token, ''),
  recovery_token          = COALESCE(recovery_token, ''),
  email_change_token_new  = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change            = COALESCE(email_change, ''),
  phone_change            = COALESCE(phone_change, ''),
  phone_change_token      = COALESCE(phone_change_token, ''),
  reauthentication_token  = COALESCE(reauthentication_token, '');
