# Convo AI Search Assistant Plugin

A Backstage frontend plugin that provides a conversational AI search interface powered by
[Tangerine][tangerine-backend]. Built as a dynamic plugin for Red Hat Developer Hub (RHDH).

## Prerequisites

- Node.js 22+ and Yarn
- Tangerine server URL and OAuth token

## Development Setup

```sh
# Install dependencies
yarn install

# Set required environment variables
export TANGERINE_CLUSTER_URL="tangerine.mycompany.com"
export TANGERINE_CLUSTER_API_TOKEN="<your-token>"

# Start the dev server (localhost:3000)
yarn start
```

## Building the Dynamic Plugin

```sh
# Build and package the dynamic plugin tarball
./build.sh
```

The script produces a tarball with an integrity SHA for deployment.

## Deploying to RHDH

### Proxy Configuration

Add to `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/tangerine':
      target: "tangerine.mycompany.com"
      headers:
        Authorization: "Bearer <your-token>"
```

### Dynamic Plugin Configuration

```yaml
dynamicPlugins:
  frontend:
    redhatinsights.backstage-plugin-convo-frontend:
      dynamicRoutes:
        - path: /convo
          importName: AISearchFrontendPage
          menuItem:
            icon: 'chat'
            text: "Convo: AI Search"
```

## Testing

```sh
# Run unit tests
yarn test

# Run all tests with coverage
yarn test:all

# Run end-to-end tests
yarn test:e2e

# Type checking
yarn tsc

# Lint
yarn lint
```

## CI/CD

GitHub Actions workflows:

- `release.yml` — automated release pipeline
- `test.yml` — test and lint on pull requests

## License

No license file is included in this repository.

[tangerine-backend]: https://github.com/RedHatInsights/tangerine-backend
