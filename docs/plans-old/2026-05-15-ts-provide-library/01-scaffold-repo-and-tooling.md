# Phase 1: Scaffold Repo And Tooling

## Scope of Phase

Create the base repository structure, package metadata, workspace configuration, build/test/typecheck tooling, CI skeleton, MIT license, and git initialization.

Out of scope:

- Core provider implementation details.
- Example app implementation.
- README content beyond lightweight placeholders needed for package validity.
- GitHub repo creation or push.

## Code Organization Reminders

- Prefer granular files with one main concept per file.
- Keep package/tooling configuration minimal and readable.
- Do not add tooling that creates churn without helping build/test/typecheck.
- Mark any temporary code with a clear `TODO`, and remove it before the final cleanup phase.

## Sub-Agent Reminders

- Do not commit.
- Do not expand scope.
- Do not suppress warnings or weaken tests to get green builds.
- If blocked, stop and report instead of improvising.
- Report what changed, what was validated, and any deviations.

## Implementation Details

Create or update:

- `.gitignore`
- `.github/workflows/ci.yml`
- `LICENSE` using MIT.
- `package.json` for package `@photomancerart/ts-provide`.
- `pnpm-workspace.yaml` including root and `examples/*`.
- `tsconfig.json`
- `tsconfig.build.json`
- Node test runner via `tsx`.
- Empty source/test/example directories as needed through real files in later phases.

Suggested root scripts:

- `build`
- `test`
- `typecheck`
- `check`
- `example:hextime`

Initialize git locally if it is not already initialized.

## Validate

Run:

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
git status --short
```
