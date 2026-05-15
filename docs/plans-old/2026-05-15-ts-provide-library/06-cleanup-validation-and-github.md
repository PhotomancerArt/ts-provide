# Phase 6: Cleanup, Validation, GitHub, And Commit

## Scope of Phase

Perform final cleanup, full validation, plan summary, git commit, GitHub repo creation, and push.

Out of scope:

- npm publishing.
- Adding new features beyond fixes needed for validation.
- Watching or debugging unrelated CI failures after push.

## Code Organization Reminders

- Remove temporary debugging artifacts, stray TODOs, commented-out experiments, and unused files.
- Keep changes aligned with the approved plan.
- Do not weaken tests or type checks to get green validation.

## Sub-Agent Reminders

- Do not commit unless this phase is explicitly assigned to the main agent.
- Do not expand scope.
- Do not suppress warnings or weaken tests to get green builds.
- If blocked, stop and report instead of improvising.
- Report what changed, what was validated, and any deviations.

## Implementation Details

Cleanup:

- Search for `TODO`, `console.log`, commented-out experiments, and scratch files.
- Review `git diff`.
- Fix formatting, warnings, and test failures.

Plan closeout:

- Write `docs/plans/2026-05-15-ts-provide-library/summary.md`.
- Move the completed standalone plan from `docs/plans/` to `docs/plans-old/`.

Git/GitHub:

- Ensure git is initialized.
- Create a single conventional commit.
- Create GitHub repo `photomancerart/ts-provide` if it does not exist.
- Add remote.
- Push the default branch.

## Validate

Run:

```sh
pnpm check
pnpm test
pnpm typecheck
pnpm build
git status --short
gh repo view photomancerart/ts-provide
```
