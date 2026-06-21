# Taiwan Supply Chain Intelligence Free

Free, automated, rule-based Taiwan supply-chain investment intelligence dashboard. It is designed for public sources, local JSON data, GitHub Actions schedules, and optional Windows local AI.

All analysis is for research and education only. It is not personalized investment advice.

## Why This Version Has No OpenAI API Cost

The app does not call the OpenAI API, does not read `OPENAI_API_KEY`, and has no server-side AI endpoint. The optional ChatGPT workflow only generates a prompt that the user may copy manually into ChatGPT, then paste JSON back into the website for localStorage display.

## Why This Version Does Not Need Supabase

Generated intelligence is stored in versioned JSON files:

- `data/intelligence/latest.json`
- `data/intelligence/history/YYYY-MM-DD-HHmm.json`
- `data/system/status.json`

User watchlists, notes, and manual enhanced analysis are stored in browser `localStorage`.

## Why This Version Does Not Need Apple

There is no Apple Shortcuts, Apple Intelligence, iCloud, or Apple-only workflow. Windows users can run everything with GitHub, Vercel, pnpm, and a browser.

## Deploy To GitHub And Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js build settings.
4. Do not add OpenAI, Supabase, or paid API secrets.
5. After GitHub Actions commits new JSON data, Vercel should redeploy from the GitHub commit.

## GitHub Actions Daily Update

`.github/workflows/update-intelligence.yml` runs twice per day:

- Taiwan time 07:30: `30 23 * * *` UTC
- Taiwan time 21:00: `0 13 * * *` UTC

The workflow runs:

```powershell
pnpm install
pnpm update:intelligence
pnpm validate:intelligence
```

It commits:

- `data/intelligence/latest.json`
- `data/intelligence/history/*.json`
- `data/system/status.json`

The workflow is schedule-only plus `workflow_dispatch`, so generated commits do not create an infinite update loop.

## Manual GitHub Actions Run

1. Open the GitHub repository.
2. Go to Actions.
3. Select "Update Taiwan Supply Chain Intelligence".
4. Click "Run workflow".
5. After completion, confirm the workflow committed updated JSON files.

## Check Whether Actions Succeeded

Open `/doctor` in the deployed site. It shows source count, article count, event count, company impact count, schema status, local AI status, and data freshness. If the Vercel site has not updated, check whether GitHub Actions created a commit and whether Vercel redeployed that commit.

## Optional Ollama Enhancement

The rule-based engine is the default. To try Windows local AI:

```powershell
$env:LOCAL_AI_ENABLED="true"
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:LOCAL_AI_MODEL="qwen2.5:7b"
pnpm update:intelligence
```

If Ollama is not installed or not running, the update still succeeds and falls back to rule-based analysis. See `docs/windows-local-ai.md`.

## ChatGPT Manual Enhancement

Open `/settings`, choose an event, generate the deep research prompt, copy it into ChatGPT, and paste the returned JSON into the import box. The website validates the JSON and stores it in `localStorage`. This never calls the OpenAI API.

## Avoid Misreading This As Investment Advice

The site does not output buy, sell, hold, target price, or guaranteed return language. Every rule-based output includes missing data, disconfirming evidence, indicators to monitor, and risk controls. Treat the dashboard as a research workflow, not a trading signal.

## Local Commands

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm update:intelligence
pnpm validate:intelligence
```
