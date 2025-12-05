# PowerShell script to push development branch to test-marosa-map repository

cd $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Pushing to test-marosa-map repository" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git config user.name "Git User"
    git config user.email "git@example.com"
}

# Ensure we have a commit
Write-Host "Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "Staging all changes..." -ForegroundColor Yellow
    git add -A
    
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Update mobile UI: match desktop card roundness, fix share modal centering, close burger menu on search interaction, add logo hard refresh"
} else {
    Write-Host "No uncommitted changes found." -ForegroundColor Green
}

# Ensure we're on development branch
Write-Host "Ensuring we're on development branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -ne "development") {
    Write-Host "Creating/switching to development branch..." -ForegroundColor Yellow
    git branch -M development
} else {
    Write-Host "Already on development branch." -ForegroundColor Green
}

# Set up remote
Write-Host ""
Write-Host "Setting up remote for test-marosa-map..." -ForegroundColor Yellow
git remote remove test-repo 2>$null
git remote add test-repo https://github.com/NRGoranov/test-marosa-map.git
Write-Host "Remote 'test-repo' configured." -ForegroundColor Green

# Show current commit
Write-Host ""
Write-Host "Current commit:" -ForegroundColor Cyan
git log --oneline -1

# Push to development branch
Write-Host ""
Write-Host "Pushing to test-repo (development branch)..." -ForegroundColor Yellow
$pushDev = git push -u test-repo development --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed to development branch!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to push to development branch" -ForegroundColor Red
    Write-Host $pushDev -ForegroundColor Red
}

# Also push to main branch
Write-Host ""
Write-Host "Pushing to test-repo (main branch)..." -ForegroundColor Yellow
$pushMain = git push test-repo development:main --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed to main branch!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to push to main branch" -ForegroundColor Red
    Write-Host $pushMain -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Done! Check GitHub to verify:" -ForegroundColor Cyan
Write-Host "https://github.com/NRGoranov/test-marosa-map" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($LASTEXITCODE -ne 0) {
    Write-Host "Note: If push failed, you may need to:" -ForegroundColor Yellow
    Write-Host "1. Authenticate with GitHub (git credential helper)" -ForegroundColor Yellow
    Write-Host "2. Use a Personal Access Token" -ForegroundColor Yellow
    Write-Host "3. Or use GitHub CLI: gh auth login" -ForegroundColor Yellow
}






