# Residential locations
[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-locations-inside-prison)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-locations-inside-prison "Link to report")
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-locations-inside-prison/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-locations-inside-prison)

This application is a front-end application used by staff in HMPPS prisons to view and maintain incident reports.

It is backed by [hmpps-locations-inside-prison-api](https://github.com/ministryofjustice/hmpps-locations-inside-prison-api).

## Running locally

The application needs a suite of services to work.

### Requirements

This application is built for Node.js and docker will be needed to run it locally.
[`nvm`](https://github.com/nvm-sh/nvm) or [`fnm`](https://github.com/Schniz/fnm)
can be used to install appropriate node versions, e.g.:

```shell
nvm use
# or
fnm use
```

Additional tools are required to manage deployment: `kubectl` and `helm`.

### Using services in `dev` environment

This is the easiest way to run and develop on your machine: by hooking into services that already exist
in the `dev` environment.

Run the application in development mode:

* in separate shell sessions, for local development
  * This will automatically restart it if server code or front-end assets are modified.

```shell
cp .env.sample .env
docker compose -f docker-compose.yml up
npm run start:dev
```

* all in one, for preview:

```shell
docker compose -f docker-compose.yml --profile include-frontend up --build
```

#### Dev logins
| username          | password       | roles                                                                                   |
|-------------------|----------------|-----------------------------------------------------------------------------------------|
| LOCATION_RO       | password123456 | VIEW_INTERNAL_LOCATION                                                                  |
| LOCATION_CAP      | password123456 | VIEW_INTERNAL_LOCATION<br/>MANAGE_RES_LOCATIONS_OP_CAP                                  |
| LOCATION_MAINTAIN | password123456 | VIEW_INTERNAL_LOCATION<br/>MANAGE_RES_LOCATIONS_OP_CAP<br/>MANAGE_RESIDENTIAL_LOCATIONS |


### Updating dependencies

It’s prudent to periodically update npm dependencies; continuous integration will occasionally warn when it’s needed.
Renovate (similar to dependabot) is set up to try to upgrade
npm packages, base docker images, helm charts and CircleCI orbs
by raising pull requests.

## Testing

Continuous integration on CircleCI will always perform the full suite of tests on pull requests and branches pushed to github,
but they can be run locally too.

### Unit tests

Run unit tests using:

```shell
npm test
```

…optionally passing a file path pattern to only run a subset:

```shell
npm test -- authorisationMiddleware
```
## Testing coverage report

Run:

```shell
npm run test-coverage
```

Then view output file for coverage report.
### Integration tests

Run the full set of headless integration tests, in separate shell sessions:

```shell
docker compose -f docker-compose-test.yml up
npm run start-feature
npm run int-test
```

Integration tests can also be run in development mode with a UI
so that assets are rebuilt when modified and tests will re-run:

```shell
docker compose -f docker-compose-test.yml up
npm run start-feature
npm run int-test-ui
```

### Code style tests

Type-checking is performed with:

```shell
npm run typecheck
```

Prettier should automatically correct many stylistic errors when changes are committed,
but the linter can also be run manually:

```shell
npm run lint
```

### Security tests

Continuous integration will regularly perform security checks using nm security audit, trivy and veracode.

The npm audit can be run manually:

```shell
npx audit-ci --config audit-ci.json
```

## Hosting

This application is hosted on [Cloud Platform](https://user-guide.cloud-platform.service.justice.gov.uk/)
in three environments:
`dev` (continuously deployed and experimental; for general testing),
`preprod` (largely matches the live service; for pre-release testing)
and `prod` (the live service).

The environments are distinct namespaces defined using a combination of kubernetes resources and terraform templates:

* [`dev`](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/hmpps-incident-reporting-dev)
* [`preprod`](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/hmpps-incident-reporting-preprod)
* [`prod`](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/hmpps-incident-reporting-prod)

A shared HMPPS helm chart forms the basis of releases,
setting up a deployment, service, ingress and associated policies and monitoring rules.

See `/helm_deploy/`.

### Deployment

When the main branch is updated (e.g. when a pull request is merged),
a new version of the application is released to `dev` automatically by CircleCI.
This release can be promoted to `preprod` and `prod` using the CircleCI interface.

See `/helm_deploy/README.md` for manual deployment steps.

### Monitoring

There is a suite of tools used for monitoring deployed applications:

* [Kibana](https://kibana.cloud-platform.service.justice.gov.uk/_plugin/kibana/app/kibana) – logging
* [Azure Application Insights](https://portal.azure.com/) – application profiling and introspection
* [Prometheus](https://prometheus.cloud-platform.service.justice.gov.uk/) – application and request metrics
* [Alertmanager](https://alertmanager.live.cloud-platform.service.justice.gov.uk/) – alerts based on metrics

## References

The code in this repository uses the MIT licence.

* [MoJ security guidance](https://security-guidance.service.justice.gov.uk/)
* [MoJ technical guidance](https://technical-guidance.service.justice.gov.uk/)

