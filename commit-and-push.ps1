# PowerShell script to commit and push changes to both repositories

cd $PSScriptRoot

Write-Host "Initializing git repository..."
git init
git config user.name "Git User"
git config user.email "git@example.com"

Write-Host "Staging changes..."
git add src/pages/MarosaLocator.jsx
git add src/components/layout/location-list/location-list-item/LocationListItem.jsx
git add src/assets/icons/DirectionsIcon.jsx
git add src/features/sharing/components/ShareModal.jsx

Write-Host "Committing changes..."
git commit -m "Update mobile UI: match desktop card roundness, fix share modal centering, close burger menu on search interaction, add logo hard refresh"

Write-Host "Creating/switching to development branch..."
git branch -M development

Write-Host "Setting up remotes..."
git remote remove marosa-main 2>$null
git remote remove test-repo 2>$null
git remote add marosa-main https://github.com/alexognyanov1/Marosa-Map.git
git remote add test-repo https://github.com/NRGoranov/test-marosa-map.git

Write-Host "Pushing to marosa-main..."
git push -u marosa-main development --force

Write-Host "Pushing to test-repo (development branch)..."
git push -u test-repo development --force

Write-Host "Pushing to test-repo (main branch as well)..."
git push test-repo development:main --force

Write-Host "Done! Check GitHub to verify the commits."
Write-Host "If push failed, you may need to authenticate with GitHub."

