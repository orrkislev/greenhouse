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
supabase start

# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

---

## Database Procedures

### 1. Resetting the Local Database
If you want to wipe the local database and re-apply all migrations and seed data:
```bash
supabase db reset
```
> [!WARNING]
> This command will delete all data in your local database. Ensure you have exported anything important first!

### 2. Exporting Test Data (Seeding)
If `supabase db dump` fails (common on some Windows/Docker setups), use this direct Docker command to export your current public data to the seed file:

```bash
# Export local 'public' schema data directly from the container
docker exec -t supabase_db_greenhouse pg_dump --data-only --username postgres --schema public > supabase/seed.sql
```

After running this, the next time you run `supabase db reset`, it will automatically re-populate the database using this data.

---

## Schema Change Workflow

When you need to add a table, rename a column, or change a data type, follow this workflow to keep Local and Production in sync.

### 1. Make the change Locally
Use the local Supabase Studio (`http://localhost:54323`) to make your changes via the UI or SQL editor.

### 2. Capture the change in a Migration
Once your local DB is correct, generate a migration file that captures the difference:
```bash
# This creates a new .sql file in supabase/migrations/
supabase db diff -f rename_this_to_your_feature_name
```

### 3. Deploy the changes
1.  **Push Code**: Commit the new migration file and push to GitHub. This updates your **Code** on Vercel.
2.  **Push Database**: Run the following to update your **Production Database**:
    ```bash
    supabase db push
    ```
> [!IMPORTANT]
> Always push your database migrations *before* or *simultaneously* with your code push to avoid "column not found" errors in the live app!
