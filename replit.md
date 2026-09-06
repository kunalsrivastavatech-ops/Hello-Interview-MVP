# Hello Interview

Hello Interview is a local-first placement interview simulator that helps college students rehearse a timed five-question corporate interview and review a private performance report.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/hello-interview/src/App.tsx` — Phase 1 screens, local interview state, question set, scoring, and route flow.
- `artifacts/hello-interview/src/index.css` — Hello Interview visual system and responsive layout.
- `artifacts/hello-interview/vite.config.ts` — Vite artifact routing and preview configuration.

## Architecture decisions

- Phase 1 is local-first: candidate details and answers are stored in browser localStorage so one complete interview works without accounts, AI, or a database.
- The interview uses a fixed five-question set and a simple transparent score so the MVP remains useful without an external AI provider.
- Monitoring copy is deliberately cautious: timing and tab changes are framed as user-visible signals, not proof of misconduct.

## Product

- Welcome page with the supplied Hello Interview corporate rehearsal visual language.
- Candidate checkpoint for name, roll number, company, and assessment track.
- Five-question interview arena with a 90-second question timer and written answer capture.
- Camera and microphone preview with permission, unavailable-device, denied-access, retry, and cleanup states; media is not recorded or uploaded.
- Private final report with overall score, dimension readout, strengths, improvement areas, and next practice topics.

## User preferences

- Preserve the supplied high-fidelity black/white/green Hello Interview design rather than replacing it with a new UI.
- Build incrementally: Phase 1 first, then camera/microphone, speech, AI evaluation, persistence, authentication, and advanced signals later.

## Gotchas

- The app is intentionally not a proctoring system in Phase 1; do not describe local timing or tab signals as cheating detection.
- The camera/microphone step is intentionally browser-local; speech recognition and AI calls are separate later phases.
- The artifact build requires `PORT` and `BASE_PATH`, which are supplied by the managed workflow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
