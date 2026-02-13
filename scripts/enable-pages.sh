#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# enable-pages.sh — One-command GitHub Pages setup for Persona-x
# Run this from your local machine with gh CLI authenticated.
#
# Usage:
#   chmod +x scripts/enable-pages.sh
#   ./scripts/enable-pages.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

REPO="Brightpath-Technologies/Persona-x"

echo "=== Persona-x GitHub Pages Setup ==="
echo ""

# Check gh is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh CLI is not authenticated. Run 'gh auth login' first."
  exit 1
fi

echo "1. Enabling GitHub Pages with Actions source..."
# Try to create Pages config (201 if new, 409 if already exists)
HTTP_CODE=$(gh api "repos/${REPO}/pages" \
  -X POST \
  -f build_type=workflow \
  --jq '.html_url' 2>/dev/null) || true

if [ -z "$HTTP_CODE" ]; then
  # Pages may already exist, try updating
  gh api "repos/${REPO}/pages" \
    -X PUT \
    -f build_type=workflow \
    --silent 2>/dev/null || true
  echo "   Pages configuration updated."
else
  echo "   Pages enabled at: ${HTTP_CODE}"
fi

echo ""
echo "2. Checking repository visibility..."
VISIBILITY=$(gh api "repos/${REPO}" --jq '.visibility' 2>/dev/null)
echo "   Repository is: ${VISIBILITY}"

if [ "$VISIBILITY" = "private" ]; then
  echo ""
  echo "   Private repo detected. Pages access is automatically"
  echo "   restricted to organisation members (requires GitHub"
  echo "   Enterprise or Teams plan)."
else
  echo ""
  echo "   Note: Public repos serve Pages publicly. To restrict"
  echo "   access, make the repository private (requires GitHub"
  echo "   Enterprise or Teams plan for private Pages)."
fi

echo ""
echo "3. Triggering initial deployment..."
# Trigger the workflow manually so you don't need to push to main
gh workflow run "Deploy Website to GitHub Pages" \
  --repo "${REPO}" \
  --ref main 2>/dev/null && echo "   Workflow triggered." || echo "   Workflow trigger skipped (merge to main will deploy automatically)."

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Merge the feature branch into main"
echo "  2. The workflow will deploy automatically on merge"
echo "  3. Site will be live at: https://brightpath-technologies.github.io/Persona-x/"
echo ""
