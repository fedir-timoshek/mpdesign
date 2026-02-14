# AGENTS.md

## Goal

Production-grade bilingual showcase website (FR/DE) for MPDESIGN with strong focus on reliability, security, performance, and lead conversion.

## Stack

- Node.js LTS (`.nvmrc` -> `24`)
- Next.js App Router + TypeScript
- Static export build for Hetzner Webhosting S
- npm only (`package-lock.json` required)

## Workflow Rules

- Keep changes small and reviewable.
- Run quality gates after changes:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run build`
- Do not add dependencies without documenting why and risk.
- Never commit secrets. Use environment variables only.
- Keep README and docs up to date when adding functionality.

## Security Rules

- Validate and sanitize all external payloads.
- Use honeypot and server-side checks for lead submissions.
- Avoid inline scripts unless justified and reviewed.
- Keep legal pages and privacy notices present in both languages.

## Definition of Done

A change is done only when:

- build succeeds
- lint is clean
- type checks pass
- automated tests pass
- mobile layout works without regressions
