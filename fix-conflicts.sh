#!/bin/bash

# Script to fix merge conflicts by keeping HEAD version
# Run this on your LOCAL machine, then commit and push

echo "Fixing merge conflicts by keeping HEAD version..."

# Files with conflicts
FILES=(
  "components/SEO.tsx"
  "pages/KYCPage.tsx"
  "components/admin/UserDetailDrawer.tsx"
  "components/StructuredData.tsx"
  "components/LazyImage.tsx"
  "translations/en.json"
  "translations/ar.json"
  "translations/tr.json"
  "utils/locale.ts"
  "backend/app.js"
  "backend/controllers/usersController.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Use git checkout to get HEAD version (our fixes)
    git checkout --ours "$file"
  fi
done

echo "Done! Now commit and push."

