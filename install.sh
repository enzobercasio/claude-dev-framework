#!/usr/bin/env bash
# Install these skills so Claude Code can use them.
#
#   ./install.sh                  link into ~/.claude/skills (available in every project)
#   ./install.sh --copy           copy instead of linking (for machines you do not control)
#   ./install.sh --project PATH   install into PATH/.claude/skills (committed with that project)
#   ./install.sh --uninstall      remove links created by this script
set -euo pipefail
SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills"

MODE="link"
TARGET="$HOME/.claude/skills"
while [ $# -gt 0 ]; do
  case "$1" in
    --copy) MODE="copy"; shift ;;
    --uninstall) MODE="uninstall"; shift ;;
    --project) TARGET="${2%/}/.claude/skills"; shift 2 ;;
    *) echo "unknown option: $1"; exit 1 ;;
  esac
done

mkdir -p "$TARGET"
for dir in "$SOURCE"/*/; do
  name=$(basename "$dir")
  dest="$TARGET/$name"
  case "$MODE" in
    uninstall)
      if [ -L "$dest" ]; then rm "$dest"; echo "removed link $name"; fi
      ;;
    copy)
      rm -rf "$dest"; cp -R "$dir" "$dest"; echo "copied  $name"
      ;;
    link)
      if [ -e "$dest" ] && [ ! -L "$dest" ]; then
        echo "skipped $name (a real directory is already there)"
      else
        rm -f "$dest"; ln -s "${dir%/}" "$dest"; echo "linked  $name"
      fi
      ;;
  esac
done

echo
[ "$MODE" = "uninstall" ] && echo "Done. Restart Claude Code to drop them." && exit 0
echo "Installed to $TARGET"
echo "Restart Claude Code, then check with /skills or by asking for one by name."
