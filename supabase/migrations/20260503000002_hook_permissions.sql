-- Grant supabase_auth_admin permission to call the custom access token hook.
-- Without this the hook silently does nothing and app_metadata.role is never set,
-- which breaks all RLS policies that rely on jwt() -> 'app_metadata' ->> 'role'.
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
