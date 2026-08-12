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

Then: **green `build` check** → **merge**. You can merge your own PR.

## The rules

- **Never commit or push to `main`.** Branch, always. If you already committed to local
  `main` by accident, see [Oops](#oops-i-committed-to-main-locally) below.
- **Branch names**: `feature/...`, `fix/...`, `chore/...`. Short and descriptive —
  `fix/task-ordering`, not `fix/bug`.
- **Branch from current `main`.** Pull first. Branching from a stale `main` is the most
  common cause of a painful merge later.
- **The `build` check must be green.** A red X means the app doesn't compile. This is the
  one hard gate — fix it, don't work around it.
- **Review is not required, but ask for one when it matters.** Approvals are set to zero
  so nobody is ever blocked waiting on a teammate, and so a typo fix takes ninety seconds
  instead of a day. That's a deliberate trade for speed, and it puts the judgement on
  you. Request a review — `gh pr create --reviewer <user>`, or the Reviewers box — when
  the change touches money, grades, auth, permissions, or the database; when you're not
  sure it's right; or when it's big enough that a second pair of eyes is cheaper than the
  bug. Merge it yourself when it's cosmetic, obvious, or yours alone.

  > Note: GitHub does not allow approving your own pull request — that's a platform
  > restriction with no setting behind it. Requiring an approval would therefore mean
  > nobody could ever merge alone, which is why the requirement is zero rather than one.
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

When you *are* asked to review — you don't need to understand every line. Check:

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

## Emergency: you need to bypass the PR flow

You should almost never need this — approvals aren't required, so a fix only has to pass
`build` to merge. It exists for the case where CI itself is broken or unavailable and
production is down. `enforce_admins` is on, so being the owner doesn't help.

Unlock deliberately, and put it back immediately:

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
- **Do not commit or push until you are asked to.** Finish the work, leave it in the
  working tree, and report what changed. The human reads the diff first. Committing as
  you go takes away the cheapest moment to redirect you, and turns "change that bit" into
  a revert.
- **"Done" means the work is finished and reported** — not that a commit exists, and not
  that a PR is open. Say what you changed and what you did not verify, then stop.
- **When you are asked to commit**: branch, never `main`. One branch per coherent piece of
  work, not one per file. Don't push or open a PR unless that was asked for too.
- **Never hand over a red PR.** If CI fails, fix it or explain precisely why you can't.
- **Never merge your own PR.** GitHub now permits it — approvals are set to zero — which
  is exactly why this rule has to be explicit. Zero required approvals is a convenience
  for the humans on this team, not a licence for an agent to land its own work unseen.
  Open the PR, report it, and let a person merge.
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
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
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
| `required_approving_review_count: 0` | no approval required — you can merge your own PR |
| `enforce_admins: true` | admins are not exempt — this is what makes the rule real |
| `allow_force_pushes` / `allow_deletions: false` | `main` cannot be rewritten or deleted |
| `delete_branch_on_merge` | merged branches clean themselves up |

The `required_pull_request_reviews` block is still present with a count of zero — that is
what keeps "changes must be made through a pull request" in force. Removing the block
entirely would drop the PR requirement too, and direct pushes to `main` would start
succeeding.

Verify at any time with:

```bash
gh api repos/orrkislev/greenhouse/branches/main/protection
```
