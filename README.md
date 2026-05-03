# Greenhouse Management System

Greenhouse is a management system for educational institutions, handling students, projects, study paths, and more.

## Architecture & Environments

### 1. Local Development (Docker)
For development, we use a local Supabase instance running in Docker containers. This allows for offline development and local database experimentation without affecting production data.

- **Local Database**: Supabase Docker instance.
- **Environment Variables**: Managed via `.env.local` (local keys).

### 2. Production (Vercel)
The production app is deployed on Vercel and connects to the managed Supabase Cloud instance.

- **Production Database**: Supabase Cloud.
- **Environment Variables**: Configured in the Vercel Dashboard.

---

## Local Development Setup

### 1. Prerequisites
You must have **Docker Desktop** installed and running on your system.
- [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Install Supabase CLI
The Supabase CLI is used to manage the local database.

**On Windows (Powershell):**
```powershell
# Using Scoop (Recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```
Alternatively, you can download the binary from the [Supabase CLI Releases](https://github.com/supabase/cli/releases).

### 3. Starting the Project
To start the local environment:
```bash
# Start Supabase services (Docker must be running)
npx supabase start

# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

---

## Database Procedures

### 1. Resetting the Local Database
If you want to wipe the local database and re-apply all migrations, seed data, and local auth users:
```powershell
npm run db:reset
```
> [!WARNING]
> This command will delete all data in your local database. Ensure you have exported anything important first!

> [!NOTE]
> The Supabase CLI crashes when processing `seed.sql` directly on this setup (SQLSTATE 08P01). The `db:reset` script handles the workaround automatically — do not run `npx supabase db reset` directly.
>
> After reset, all users are available with PIN **1111**.

### 2. Exporting Seed Data
Use this command to export your current local public data to `seed.sql`. Writing inside the container first avoids Windows encoding issues:

```powershell
docker exec supabase_db_greenhouse pg_dump --data-only --username postgres --schema public -f /tmp/seed_new.sql
docker cp supabase_db_greenhouse:/tmp/seed_new.sql supabase/seed.sql
```

> [!WARNING]
> Never use PowerShell's `>` redirect operator or `Set-Content`/`Out-File` to write `seed.sql` — they corrupt the Hebrew text with wrong encoding. Always write via Docker as shown above.

---

## Schema Change Workflow

When you need to add a table, rename a column, or change a data type, follow this workflow to keep Local and Production in sync.

### 1. Make the change Locally
Use the local Supabase Studio (`http://localhost:54323`) to make your changes via the UI or SQL editor.

### 2. Capture the change in a Migration
Once your local DB is correct, generate a migration file that captures the difference:
```bash
# This creates a new .sql file in supabase/migrations/
npx supabase db diff -f rename_this_to_your_feature_name
```

### 3. Deploy the changes
1.  **Push Code**: Commit the new migration file and push to GitHub. This updates your **Code** on Vercel.
2.  **Push Database**: Run the following to update your **Production Database**:
    ```bash
    npx supabase db push
    ```
> [!IMPORTANT]
> Always push your database migrations *before* or *simultaneously* with your code push to avoid "column not found" errors in the live app!
