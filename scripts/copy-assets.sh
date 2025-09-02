#!/bin/bash

# Copy Bootstrap CSS and Bravo JS to documentation site

set -e

echo "📦 Copying assets to documentation site..."

# Create directories if they don't exist
mkdir -p site/public/docs/5.3/dist/css
mkdir -p site/public/docs/5.3/dist/js

# Copy Bootstrap CSS files
echo "  → Copying Bootstrap CSS..."
cp node_modules/bootstrap/dist/css/bootstrap.min.css site/public/docs/5.3/dist/css/
cp node_modules/bootstrap/dist/css/bootstrap.min.css.map site/public/docs/5.3/dist/css/ 2>/dev/null || true
cp node_modules/bootstrap/dist/css/bootstrap.rtl.min.css site/public/docs/5.3/dist/css/ 2>/dev/null || true

# Build Bravo if needed
if [ ! -f "dist/js/bravo.bundle.umd.js" ]; then
  echo "  → Building Bravo bundle..."
  npm run build
fi

# Copy Bravo JS bundle
echo "  → Copying Bravo JS bundle..."
cp dist/js/bravo.bundle.umd.js site/public/docs/5.3/dist/js/
cp dist/js/bravo.bundle.umd.js.map site/public/docs/5.3/dist/js/ 2>/dev/null || true

echo "✅ Assets copied successfully!"