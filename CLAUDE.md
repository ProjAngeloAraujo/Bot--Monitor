# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Early-stage project: `src/` is empty and there are no commits yet. Update this file as architecture emerges.

## Stack

- TypeScript, run directly with `tsx` (no build step configured yet; no `tsconfig.json` exists).
- `cheerio` for HTML parsing/scraping. Node's built-in `fetch` (undici) is available for HTTP.
- `package.json` sets `"type": "commonjs"` and `"main": "index.js"` — adjust if moving to ESM or a different entry point.

## Commands

- Install: `npm install`
- Run a file: `npx tsx src/<file>.ts` (watch mode: `npx tsx watch src/<file>.ts`)
- Type-check: `npx tsc --noEmit` (requires adding a `tsconfig.json` first)
- Tests: none configured (`npm test` is the npm placeholder and exits with error).
