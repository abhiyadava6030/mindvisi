#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Push to GitHub after every Replit checkpoint merge
if [ -n "$GITHUB_TOKEN" ]; then
  git config user.email "replit-sync@mindvisi.app" 2>/dev/null || true
  git config user.name "Replit Sync" 2>/dev/null || true

  # Use a credential helper so the token is never stored in .git/config
  git config credential.helper '!f() { echo "username=x-access-token"; echo "password='"$GITHUB_TOKEN"'"; }; f'

  if git remote get-url github &>/dev/null; then
    git remote set-url github "https://github.com/abhiyadava6030/mindvisi.git"
  else
    git remote add github "https://github.com/abhiyadava6030/mindvisi.git"
  fi

  # --force-with-lease is safer than --force: it refuses to overwrite
  # if the remote has commits not present locally (protects against accidents).
  # If the token lacks `workflow` scope and .github/workflows changed, the push
  # will fail with a clear error message explaining the required scope upgrade.
  if git push github HEAD:main --force-with-lease 2>&1; then
    echo "Pushed to GitHub successfully."
  else
    EXIT_CODE=$?
    echo "WARNING: GitHub push failed (exit $EXIT_CODE)."
    echo "If the error mentions 'workflow' scope, update your GITHUB_TOKEN secret"
    echo "to a token with the 'workflow' permission enabled."
    exit $EXIT_CODE
  fi
else
  echo "GITHUB_TOKEN not set — skipping GitHub push."
fi
