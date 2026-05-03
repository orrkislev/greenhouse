$ErrorActionPreference = "Stop"
$container = "supabase_db_greenhouse"

Write-Host "-> Hiding seed.sql from CLI..."
Rename-Item supabase/seed.sql seed.sql.bak

try {
    Write-Host "-> Resetting database (migrations only)..."
    npx supabase db reset
} finally {
    Write-Host "-> Restoring seed.sql..."
    Rename-Item supabase/seed.sql.bak seed.sql
}

Write-Host "-> Applying seed..."
docker cp supabase/seed.sql "${container}:/tmp/seed.sql"
docker exec $container psql -U postgres -d postgres -c "SET session_replication_role = 'replica';" -f /tmp/seed.sql

Write-Host "-> Creating auth users (PIN 1111 for all)..."
docker cp supabase/auth_seed.sql "${container}:/tmp/auth_seed.sql"
docker exec $container psql -U postgres -d postgres -f /tmp/auth_seed.sql

Write-Host ""
Write-Host "Done. Log in with any username, PIN 1111."
