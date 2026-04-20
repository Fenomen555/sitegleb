# Deployment

GitHub Actions builds the Vite site on every push to `main`.

Deployment to the server is disabled until `DEPLOY_ENABLED=true` is added in repository variables.

## Required GitHub secrets

- `SERVER_HOST` - server IP or host name
- `SERVER_USER` - SSH user, for example `root`
- `SERVER_SSH_KEY` - private SSH key that can connect to the server
- `SERVER_PORT` - optional SSH port, defaults to `22`

## Recommended GitHub variables

- `DEPLOY_ENABLED` - set to `true` when SSH access is ready
- `SERVER_DEPLOY_PATH` - defaults to `/root/site/vision-site`
- `SERVER_WEB_PROJECT` - defaults to `/var/www/visionoftrad_usr/projects/vision-site`

## Server layout

The workflow extracts every build to:

```text
/root/site/vision-site/releases/<commit-sha>
```

Then it updates:

```text
/root/site/vision-site/current
```

If `/var/www/visionoftrad_usr/projects/vision-site` exists, the workflow also refreshes:

```text
/var/www/visionoftrad_usr/projects/vision-site/dist
```
