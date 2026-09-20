#!/usr/bin/env bash
# Scan a git repository for credentials before publishing it.
# Checks tracked files, full history, and what the ignore file covers.
# Usage: scan-secrets.sh [repo-path]
set -uo pipefail
cd "${1:-.}" || exit 1

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository: $(pwd)"
  exit 1
fi

FINDINGS=0
note() { echo "  $*"; }
flag() { echo "  !! $*"; FINDINGS=$((FINDINGS + 1)); }

echo "== Tracked files that look like credentials"
MATCHES=$(git ls-files | grep -iE '(^|/)\.env($|\.)|\.pem$|\.p12$|\.pfx$|\.jks$|\.keystore$|\.p8$|id_rsa|\.key$|credentials\.json|google-services\.json|GoogleService-Info\.plist|\.mobileprovision$' || true)
[ -n "$MATCHES" ] && flag "$(echo "$MATCHES" | tr '\n' ' ')" || note "none"

echo "== Secret-shaped strings in tracked files"
HITS=$(git grep -nIE "(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY|(api[_-]?key|secret|passwd|password|access[_-]?token)[\"' ]*[:=][\"' ]*[A-Za-z0-9/+_-]{12,})" -- . ':!*.lock' ':!*lock.json' ':!*.md' 2>/dev/null || true)
[ -n "$HITS" ] && flag "$(echo "$HITS" | head -20)" || note "none"

echo "== Credential filenames anywhere in history"
HIST=$(git log --all --name-only --pretty=format: 2>/dev/null | sort -u | grep -iE '(^|/)\.env($|\.)|\.pem$|\.p12$|\.jks$|\.p8$|id_rsa|credentials\.json|google-services\.json|\.sqlite$|\.db$' || true)
[ -n "$HIST" ] && flag "in history: $(echo "$HIST" | tr '\n' ' ')" || note "none"

echo "== Ignore file coverage"
# Probe with a concrete path for each: a directory pattern written as "node_modules/"
# only matches a directory, so probing the bare name would report a false gap.
check_ignored() { # name  probe-path
  if git check-ignore -q "$2" 2>/dev/null; then note "covers $1"; else flag "not ignored: $1"; fi
}
check_ignored ".env" ".env"
check_ignored "node_modules" "node_modules/pkg/index.js"
check_ignored "local databases" "data.sqlite"
check_ignored "backups and exports" "backup.db"
check_ignored "service credentials" "credentials.json"

echo "== Large tracked files (over 2MB, often data dumps)"
BIG=$(git ls-files -z | xargs -0 -I{} sh -c 'f="{}"; [ -f "$f" ] && s=$(wc -c <"$f") && [ "$s" -gt 2097152 ] && echo "$f ($((s/1024/1024))MB)"' 2>/dev/null || true)
[ -n "$BIG" ] && note "$BIG" || note "none"

echo
if [ "$FINDINGS" -eq 0 ]; then
  echo "Clean: nothing credential-shaped found."
else
  echo "$FINDINGS thing(s) to look at before publishing."
  echo "A secret already in history stays there after deletion. Rotate it, then rewrite history if it must be removed."
fi
exit 0
