# Git Workflow

How changes reach production. Read [`AGENTS.md`](../../AGENTS.md) for the project map
and [`development.md`](development.md) for how the code itself should be written.

`main` is branch-protected. Pushing to it directly **will be rejected**, for everyone
including admins. Every change reaches `main` through a pull request.

---

## The loop

```
git switch main && git pull        # always branch from current main
git switch -c fix/task-ordering
# ... work ...
git push -u origin fix/task-ordering
gh pr create --base main           # or open it in the GitHub UI
```

Then: **1 approval** → **green `build` check** → **merge**.

## The rules

- **Never commit or push to `main`.** Branch, always. If you already committed to local
  `main` by accident, see [Oops](#oops-i-committed-to-main-locally) below.
- **Branch names**: `feature/...`, `fix/...`, `chore/...`. Short and descriptive —
  `fix/task-ordering`, not `fix/bug`.
- **Branch from current `main`.** Pull first. Branching from a stale `main` is the most
  common cause of a painful merge later.
- **Every PR needs 1 approval.** Anyone on the team can approve — there is no designated
  reviewer. Ping in WhatsApp if you need one quickly.
- **The `build` check must be green.** A red X means the app doesn't compile. Don't merge
  it, and don't ask for review on it — fix it first.
- **Keep your branch up to date with `main`** before merging. GitHub enforces this
  (`strict` mode) and will show an "Update branch" button when you're behind.
- **Open the Vercel preview URL on the PR and actually click around.** A green build only
  proves the code compiles. It does not prove the feature works.
- **Merged branches are auto-deleted.** Don't reuse an old branch — start a fresh one.

## Database migrations

Migrations do **not** go through the PR flow — `supabase db push` talks to the production
database directly, whenever you run it.

**Push the migration before the PR merges.** The moment the PR lands, Vercel deploys the
new code; if the database hasn't been migrated yet, every user gets "column does not
exist" until you catch up. See [`development.md` §10](development.md#10-database-changes).

Because the DB change goes live before the code does, prefer migrations that are
**backwards compatible** with the currently-deployed code — adding a column is safe, and
dropping one is not. When you must do both, split it: add and backfill in one release,
drop in the next.

## Reviewing a PR

You don't need to understand every line. Check:

1. Does the `build` check pass?
2. Does the Vercel preview actually work for the thing the PR claims to change?
3. Is there a migration? If so, has it been pushed, and is it backwards compatible?
4. Does it touch `utils/supabase/schema.js` if it added a DB column? (Missing this
   silently drops data on write — see [`development.md` §3](development.md#3-writing-to-supabase).)

Approving means "I looked and it seems fine", not "I guarantee this is bug-free". A
second pair of eyes catching one thing is the whole point.

## Oops, I committed to `main` locally

Nothing is lost, and nothing reached the server — the push is what gets rejected.

```bash
git switch -c fix/my-work     # your commits come with you
git switch main
git reset --hard origin/main  # discard them from local main
git switch fix/my-work        # carry on, then push and open a PR
```

## Emergency: production is broken and nobody can approve

GitHub does not let you approve your own PR, and admins are not exempt from protection.
If you are genuinely alone and production is down, unlock deliberately and put it back
immediately:

```bash
gh api -X DELETE repos/orrkislev/greenhouse/branches/main/protection
# ... land the fix ...
# then immediately re-apply it - see "Re-applying protection" below
```

This is a fire escape, not a shortcut. If you use it, say so in WhatsApp, and re-apply
protection the same day.

---

## For AI coding agents

These are hard rules, not suggestions:

- **Never commit or push to `main`.** Branch first, always.
- **Never disable, weaken, or work around branch protection** to land your work. If
  protection blocks you, that is the system functioning correctly. Stop and report.
- **"Done" means an open PR with a green build** — not a commit, not a local branch, not
  "the code is written". If you were asked to implement something, the deliverable is a
  reviewable PR.
- **Never hand over a red PR.** If CI fails, fix it or explain precisely why you can't.
- **Never merge your own PR**, even if you technically can. A human approves.
- **Say plainly what you did and did not verify.** "Build passes" and "I clicked through
  the preview and it works" are very different claims. Don't blur them.
- If a migration is involved, say explicitly whether it has been pushed, and whether it
  is backwards compatible with the code currently on `main`.

---

## Appendix: re-applying protection

The exact settings currently in force. Run this to restore them after an emergency
unlock, or to re-create them from scratch. Requires admin on the repo and `gh` installed
(`brew install gh && gh auth login`).

```bash
gh api -X PUT repos/orrkislev/greenhouse/branches/main/protection \
  -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["build"] },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": true,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

gh api -X PATCH repos/orrkislev/greenhouse -f delete_branch_on_merge=true
```

What each setting does:

| Setting | Effect |
|---|---|
| `contexts: ["build"]` | the `build` job in `.github/workflows/ci.yml` must pass |
| `strict: true` | branch must be up to date with `main` before merging |
| `required_approving_review_count: 1` | one approval, from anyone with write access |
| `dismiss_stale_reviews: true` | new commits invalidate an existing approval |
| `enforce_admins: true` | admins are not exempt — this is what makes the rule real |
| `allow_force_pushes` / `allow_deletions: false` | `main` cannot be rewritten or deleted |
| `delete_branch_on_merge` | merged branches clean themselves up |

Verify at any time with:

```bash
gh api repos/orrkislev/greenhouse/branches/main/protection
```
