# Convo AI Search Assistant Plugin

## Project Overview

A Backstage frontend plugin providing a conversational AI search interface powered by Tangerine.
Built as a dynamic plugin for Red Hat Developer Hub (RHDH). Distributed as a packaged tarball.

## Dependencies

- **Runtime:** Node.js 22+, Backstage CLI ^0.35.4, React, TypeScript
- **Test:** Jest, Playwright (E2E)
- **Lint:** ESLint, Prettier
- **CI:** GitHub Actions (release.yml, test.yml)

## Development Commands

```sh
# Install dependencies
yarn install

# Start dev server
yarn start

# Run tests
yarn test

# Run all tests with coverage
yarn test:all

# E2E tests
yarn test:e2e

# Type checking
yarn tsc

# Lint (changed files)
yarn lint

# Lint all files
yarn lint:all

# Build dynamic plugin
./build.sh
```

See [Development Setup][readme-dev] in the README for environment variable configuration.

## Architecture

Backstage monorepo with the plugin in `plugins/convo/`. Local dev environment in `packages/`.
Plugin is exported as a dynamic tarball for RHDH deployment. See [ARCHITECTURE.md][architecture]
for module structure and design decisions.

## Code Style

- **Linter:** ESLint (Backstage preset)
- **Formatter:** Prettier
- **Language:** TypeScript (strict, via `tsconfig.json`)
- **Node.js:** 22+ required (per `package.json` engines)

## Common Mistakes

1. **Missing environment variables.** The dev server requires `TANGERINE_CLUSTER_URL` and
   `TANGERINE_CLUSTER_API_TOKEN` to be set. Without them, the plugin loads but all API calls fail
   silently.

2. **Running `yarn lint` expecting full coverage.** The default `lint` command only checks files
   changed since `origin/main`. Use `yarn lint:all` to lint the entire codebase.

3. **Forgetting to rebuild the dynamic plugin after changes.** The `./build.sh` script must be
   re-run after any source changes. The dev server (`yarn start`) does not produce the dynamic
   plugin tarball.

## Testing

```sh
yarn test          # Unit tests
yarn test:all      # All tests with coverage
yarn test:e2e      # Playwright E2E tests
```

[readme-dev]: ./README.md#development-setup
[architecture]: ./ARCHITECTURE.md
