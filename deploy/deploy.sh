#!/usr/bin/env bash
# Server-side deploy for mlrit.ac.in, run as ubuntu by .github/workflows/deploy.yml
# after the checkout at /home/ubuntu/mlrit-final has been reset to origin/main.
# Builds in a separate folder, so a failed build never touches the live site.
set -euo pipefail
A=/home/ubuntu/mlrit-final
B=/home/ubuntu/mlrit-build

cd "$A"
echo "deploying $(git log -1 --format='%h %s')"

npm ci --no-audit --no-fund
timeout 180 npx payload migrate < /dev/null

# Upload new public/ files to S3 (never overwrites; see the script).
node deploy/sync-public-to-s3.mjs

rm -rf "$B" && mkdir -p "$B"
tar --exclude=./node_modules --exclude=./.next --exclude=./.next.prev --exclude=./.git -cf - . | tar -xf - -C "$B"
ln -s "$A/node_modules" "$B/node_modules"
(cd "$B" && NODE_OPTIONS=--max-old-space-size=3072 npm run build)

pm2 stop mlrit
rm -rf "$A/.next.prev" && mv "$A/.next" "$A/.next.prev" && mv "$B/.next" "$A/.next"
pm2 restart mlrit --update-env && pm2 save
rm -rf "$B"

# Health check; roll back to the previous build if the new one does not answer.
code=000
for i in $(seq 1 10); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ || true)
  [ "$code" = 200 ] && { echo "live: HTTP 200"; exit 0; }
  sleep 3
done
echo "health check failed ($code), rolling back"
pm2 stop mlrit
rm -rf "$A/.next.failed" && mv "$A/.next" "$A/.next.failed" && mv "$A/.next.prev" "$A/.next"
pm2 restart mlrit
exit 1
