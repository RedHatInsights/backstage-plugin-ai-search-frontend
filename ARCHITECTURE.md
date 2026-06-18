# Architecture

## Overview

A Backstage monorepo containing the Convo AI Search Assistant frontend plugin. Built with the
Backstage CLI and designed for deployment as a dynamic plugin on Red Hat Developer Hub.

## Module Structure

```text
plugins/
  convo/                  # The main plugin package
packages/
  app/                    # Backstage app shell for local development
  backend/                # Backstage backend for local development
examples/                 # Example catalog entities for testing
e2e-test-report/          # Playwright E2E test reports
playwright.config.ts      # E2E test configuration
```

## Key Design Decisions

- **Backstage monorepo layout.** Uses Yarn workspaces with `packages/*` and `plugins/*` for
  standard Backstage development. The `packages/` directory provides the local dev environment;
  only `plugins/convo/` is published.
- **Dynamic plugin packaging.** The plugin is exported as a dynamic plugin tarball via
  `build.sh`, allowing deployment to RHDH without rebuilding the entire Backstage instance.
- **Proxy-based API access.** The plugin communicates with Tangerine through Backstage's proxy
  configuration, avoiding CORS issues and keeping credentials server-side.
- **Node.js 22+.** Engine requirement set in `package.json`.

## Dependencies

- **Backstage CLI** (`@backstage/cli` ^0.35.4) — build tooling and local dev server
- **Playwright** — end-to-end testing
- **ESLint** — code linting (configured via `.eslintrc`)
