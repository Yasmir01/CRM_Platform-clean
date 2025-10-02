# 🔧 Git Conflict Resolution Cheat Sheet (VS Code + PowerShell)

Use this guide whenever you hit a merge conflict between **local edits** and **Builder.io AI commits**.

---

## ⚠️ Step 1 — Find Conflicted Files
```powershell
git diff --name-only --diff-filter=U
