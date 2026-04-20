# Deployment

GitHub Actions builds the Vite site on every push to `main`.

Deployment to the server is disabled until `DEPLOY_ENABLED=true` is added in repository variables.

## Required GitHub secrets

- `SERVER_HOST` - server IP or host name
- `SERVER_USER` - SSH user, for example `root`
- `SERVER_SSH_KEY` - private SSH key that can connect to the server
- `SERVER_PORT` - optional SSH port, defaults to `22`

The matching public deploy key must be present on the server in:

```text
/root/.ssh/authorized_keys
```

## Backend environment

The backend runs from:

```text
/root/site/vision-site/backend/current
```

Runtime secrets are stored only on the server:

```text
/root/site/vision-site/backend/.env
```

This file should contain MySQL credentials, admin bootstrap credentials, and `SESSION_SECRET`.

## Recommended GitHub variables

- `DEPLOY_ENABLED` - set to `true` when SSH access is ready
- `SERVER_DEPLOY_PATH` - defaults to `/root/site/vision-site`
- `SERVER_WEB_ROOT` - defaults to `/var/www/visionoftrad_usr/data/www/visionoftrading.com`
- `SERVER_WEB_OWNER` - defaults to `visionoftrad_usr:visionoftrad_usr`

## Server layout

The workflow extracts every build to:

```text
/root/site/vision-site/releases/<commit-sha>
```

Then it updates:

```text
/root/site/vision-site/current
```

Before publishing, the workflow creates a backup of the current live web root:

```text
/root/site/vision-site/backups/web-root-before-<commit-sha>.tar.gz
```

Then it refreshes the Nginx web root:

```text
/var/www/visionoftrad_usr/data/www/visionoftrading.com
```

The workflow also deploys the FastAPI backend, installs Python requirements into:

```text
/root/site/vision-site/backend/venv
```

Then it restarts:

```text
vision-site-api.service
```
