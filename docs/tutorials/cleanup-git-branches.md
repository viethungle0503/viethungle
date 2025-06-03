---
sidebar_position: 2
---

# Cleaning Up Git Branches

As your Git repository grows, you might accumulate many branches that are no longer needed. This tutorial will show you how to clean up both local and remote branches efficiently.

## Prerequisites

- Basic knowledge of Git
- Access to a Git repository
- Appropriate permissions to delete branches

## Cleaning Up Remote Branches

### 1. Prune Remote Branches

The `git remote prune` command removes references to remote branches that no longer exist on the remote repository:

```bash
git remote prune origin
```

This command will remove all stale remote-tracking branches that no longer exist on the remote repository.

## Cleaning Up Local Branches

### 1. List Merged Branches

To see which local branches have been merged into the current branch:

```bash
git branch --merged
```

### 2. Delete Merged Branches

To delete all local branches that have been merged into the current branch (except the current branch itself):

**For Bash/Linux/macOS:**
```bash
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

**For Windows PowerShell:**

Option 1:
```powershell
git branch --merged | Where-Object { $_ -notmatch '^\*' } | ForEach-Object { $_.Trim() } | ForEach-Object { git branch -d $_ }
```

Option 2:
```powershell
git branch --merged | Where-Object { $_ -notmatch '^\*' } | ForEach-Object { $_.Trim() } | ForEach-Object { git branch -d $_ }
```

Option 3:
```powershell
git branch --merged `
  | Select-String -Pattern '^\*' -NotMatch `
  | ForEach-Object { $_.Line.Trim() } `
  | ForEach-Object { git branch -d $_ }
```

These commands:
- List all merged branches (`git branch --merged`)
- Exclude the current branch (using `grep -v "\*"` in Bash or `Where-Object`/`Select-String` in PowerShell)
- Delete each branch one by one (`xargs` in Bash or `ForEach-Object` in PowerShell)

### 3. Check Current Branch

To see which branch you're currently on:

```bash
git rev-parse --abbrev-ref HEAD
```

## Complete Cleanup Process

Here's a complete workflow for cleaning up your Git repository:

1. First, make sure you're on the main branch:
   ```bash
   git checkout main
   ```

2. Pull the latest changes:
   ```bash
   git pull origin main
   ```

3. Prune remote branches:
   ```bash
   git remote prune origin
   ```

4. Delete merged local branches:
   **For Bash/Linux/macOS:**
   ```bash
   git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
   ```
   
   **For Windows PowerShell:**
   ```powershell
   git branch --merged | Where-Object { $_ -notmatch '^\*' } | ForEach-Object { $_.Trim() } | ForEach-Object { git branch -d $_ }
   ```

## Safety Tips

1. Always make sure you're not on a branch you're about to delete
2. Consider using `-D` instead of `-d` to force delete branches that haven't been merged
3. Back up important branches before deletion
4. Check with your team before deleting shared branches

## Common Issues and Solutions

### Issue: Cannot delete branch because it's not fully merged

Solution: Use the `-D` flag to force delete:
```bash
git branch -D branch-name
```

### Issue: Remote branch still exists after pruning

Solution: Make sure you have the latest information:
```bash
git fetch --prune
```

## Conclusion

Regular branch cleanup is an important part of Git repository maintenance. It helps keep your repository organized and reduces confusion for team members. Remember to communicate with your team before deleting shared branches. 