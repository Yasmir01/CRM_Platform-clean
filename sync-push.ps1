# sync-push.ps1 - Autopilot Git sync + push for CRM_Platform

Write-Host "🚀 Autopilot Git Sync & Push Starting..." -ForegroundColor Cyan

# Go to your repo folder (adjust if needed)
Set-Location "C:\Users\yasmi\OneDrive\Desktop\CRM Project\CRM_Platform2\CRM_Platform-main"

# Detect current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📂 Current branch: $currentBranch" -ForegroundColor Yellow

# Step 1: Fetch + Pull latest from remote
Write-Host "⬇️ Fetching & pulling latest changes from GitHub..." -ForegroundColor Yellow
git fetch origin
git pull origin $currentBranch --rebase

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Pull failed — possible merge conflicts!" -ForegroundColor Red
    $conflicts = git diff --name-only --diff-filter=U
    if ($conflicts) {
        Write-Host "`n🚨 Merge conflicts detected:" -ForegroundColor Red
        $conflicts | ForEach-Object { Write-Host " - $_" -ForegroundColor DarkRed }
        Write-Host "`n❗ Resolve the conflicts manually in VS Code, then re-run this script." -ForegroundColor Yellow
        pause
        exit 1
    }
}

# Step 2: Stage all changes
git add .

# Step 3: Auto-generate commit message with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "autopilot: sync at $timestamp"

# Step 4: Commit (skip if nothing to commit)
if (git diff --cached --quiet) {
    Write-Host "✅ No changes to commit." -ForegroundColor Green
} else {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "$commitMessage"
}

# Step 5: Push to GitHub
Write-Host "⬆️ Pushing to GitHub ($currentBranch)..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Push successful! GitHub + Vercel will rebuild." -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Please check your network or GitHub settings." -ForegroundColor Red
}

pause
