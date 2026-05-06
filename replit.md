# Mindvisi

A full-stack AI wellness app where users write their emotions/thoughts and receive personalized animated AI-generated visuals plus well-being recommendations (books, yoga, meditation, motivation).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/mindvisi run dev` — run the React frontend (port 24476, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Clerk auth, Framer Motion, Recharts, Lucide icons
- API: Express 5 + Clerk Express middleware
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI GPT-5.1 (analysis + streaming chat) + gpt-image-1 (image generation)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI spec (codegen source)
- `lib/db/src/schema/` — Drizzle ORM table definitions (reflections, recommendations, conversations, messages)
- `lib/api-zod/src/generated/api.ts` — generated Zod validators
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `artifacts/api-server/src/routes/` — Express route handlers (reflections, dashboard, openai, health)
- `artifacts/mindvisi/src/` — React frontend (pages: Home, Dashboard, Reflect, History, Privacy)
- `lib/integrations-openai-ai-server/` — OpenAI server client (chat + image generation)
- `lib/integrations-openai-ai-react/` — OpenAI React hooks

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod validators used on both client and server
- Clerk auth via Clerk Express middleware on all `/api` routes; `getAuth(req)` used in every protected handler
- Image generation returns base64 data URIs stored in the `reflections.image_url` column (avoids object storage complexity)
- AI analysis uses GPT-5.1 to return JSON (mood, greeting, imagePrompt, recommendations) then generates a matching image in the same request
- Conversations table has `user_id` column added beyond the OpenAI template default

## Product

- **Reflect**: Users write emotions/thoughts; AI analyzes and returns a mood label, personal greeting, AI-generated image, and 4 wellness recommendations (book, yoga, meditation, motivation)
- **Dashboard**: Mood breakdown chart (Recharts), reflection streak, total count, recent history
- **History**: Grid of past reflections with full detail modal (image + recommendations)
- **Privacy**: Comprehensive privacy policy page
- **Auth**: Clerk email/password with branded cosmic-themed sign-in/sign-up pages

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any changes to `openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after any schema changes before testing
- Never call service ports directly — always go through `localhost:80/<path>` via the shared proxy
- `conversations` table has extra `userId` text column beyond the OpenAI template default — don't overwrite with template defaults

## Pointers

- See `.local/skills/pnpm-workspace` for workspace structure and TypeScript setup
- See `.local/skills/clerk-auth` for Clerk integration details
- See `.local/skills/ai-integrations-openai` for OpenAI integration details
