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

## Versioning
Currently we're not working with GitHun issues, but we do have a NEXT_RELEASE.md file. It is used to plan and track bugfixes and features that need to be addressed for a specific milestone or occasion.

## Local Development Setup

### 1. Prerequisites
You must have **Docker Desktop** installed and running on your system.
- [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

Node.js 20+ and npm are also required.

### 2. Install dependencies
```powershell
npm install
```

### 3. Start Supabase
```powershell
npx supabase start
```

This pulls and starts the local Supabase Docker containers. On first run it downloads ~1 GB of images. Subsequent starts are fast.

> [!NOTE]
> On Windows you may see a warning:
> ```
> WARNING: Analytics on Windows requires Docker daemon exposed on tcp://localhost:2375.
> ```
> This is harmless — analytics is a non-critical background service. You can ignore it.

When startup completes, the CLI prints your local credentials:
```
╭──────────────────────────────────────────────────────────────╮
│ 🔑 Authentication Keys                                       │
├─────────────┬────────────────────────────────────────────────┤
│ Publishable │ sb_publishable_XXXX...                         │
│ Secret      │ sb_secret_XXXX...                              │
╰─────────────┴────────────────────────────────────────────────╝
```
Keep this terminal output handy for the next step. You can always re-display it with `npx supabase status`.

### 4. Create `.env.local`
Copy the example file and fill in the values from the `supabase start` output above:

```powershell
Copy-Item .env.example .env.local
```

Then edit `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** — always `http://127.0.0.1:54321` for local dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable** key from the output |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** key from the output |

The Google and `GETIMG_KEY` variables are only needed for Google Calendar / Drive integration and AI image generation. You can leave them blank for basic local development.

### 5. Populate the database
Run the reset script to apply all migrations and load seed data:
```powershell
npm run db:reset
```

After reset, all users are available with PIN **1111**.

> [!WARNING]
> This wipes all local data. Only run this when you want a clean slate.

> [!NOTE]
> You may see a non-fatal `duplicate key` error in the output — this is a known quirk of the seed data and does not affect the result.

### 6. Start the dev server
```powershell
npm run dev
```

The app is now running at **http://localhost:3000**.

---

## Database Procedures

### Resetting the Local Database
To wipe the local database and re-apply all migrations, seed data, and local auth users:
```powershell
npm run db:reset
```
> [!WARNING]
> This command will delete all data in your local database. Ensure you have exported anything important first!

> [!NOTE]
> The Supabase CLI crashes when processing `seed.sql` directly on this setup (SQLSTATE 08P01). The `db:reset` script handles the workaround automatically — do not run `npx supabase db reset` directly.
>
> After reset, all users are available with PIN **1111**.

### Exporting Seed Data
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
