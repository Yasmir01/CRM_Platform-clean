# sync-push.ps1 - Smart Git sync + push with conflict detection & file preview

Write-Host "🔄 Starting Git sync & push for CRM_Platform..." -ForegroundColor Cyan

# Go to your repo folder
Set-Location "C:\Users\yasmi\OneDrive\Desktop\CRM Project\CRM_Platform"

# Detect current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📂 Current branch detected: $currentBranch" -ForegroundColor Yellow

# Step 1: Fetch + Pull latest from remote
Write-Host "⬇️ Fetching & pulling latest changes from GitHub..." -ForegroundColor Yellow
git fetch origin
git pull origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Pull failed — possible merge conflicts." -ForegroundColor Red

    # Check for conflicts
    $conflicts = git diff --name-only --diff-filter=U
    if ($conflicts) {
        Write-Host "🚨 Merge conflicts detected in these files:" -ForegroundColor Red
        $conflicts | ForEach-Object { Write-Host " - $_" -ForegroundColor DarkRed }
        Write-Host "`n❗ Resolve the conflicts manually in VS Code, then re-run this script." -ForegroundColor Yellow
    }
    pause
    exit 1
}

# Step 2: Stage changes
Write-Host "📂 Staging all local changes..." -ForegroundColor Yellow
git add .

# Step 3: Show preview of what will be committed
$changes = git diff --cached --name-only
if ($changes) {
    Write-Host "`n📝 Files staged for commit:" -ForegroundColor Cyan
    $changes | ForEach-Object { Write-Host " - $_" -ForegroundColor Green }
} else {
    Write-Host "⚠️ No local changes to commit." -ForegroundColor DarkYellow
    pause
    exit 0
}

# Step 4: Ask for confirmation
$confirm = Read-Host "`nDo you want to proceed with commit & push? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Commit cancelled. No changes pushed." -ForegroundColor Red
    pause
    exit 0
}

# Step 5: Ask for commit message
$commitMessage = Read-Host "📝 Enter a commit message"
if (-not $commitMessage) {
    $commitMessage = "chore: sync and push changes"
}

# Step 6: Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Step 7: Push to GitHub
Write-Host "⬆️ Pushing to GitHub branch $currentBranch..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push successful! Branch $currentBranch is synced." -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Please check your GitHub permissions or network connection." -ForegroundColor Red
}

pause

