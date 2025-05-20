#!/bin/sh

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-push hook
cp .github/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push

echo "Git hooks installed."