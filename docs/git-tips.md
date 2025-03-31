---
sidebar_position: 1
---

# Git Tips and Best Practices

## Understanding git add Commands

When working with Git, adding files to the staging area is a crucial step before committing changes. While there are multiple ways to add files, understanding the differences between them is important for efficient version control.

### Common git add Commands and Their Implications

#### 1. `git add .`
This is the most commonly used command. It adds all changes in the current directory to the staging area. However, it has a limitation:
- Only adds files in the current directory
- If you're in a subdirectory, it won't add files from parent directories
- Example: If you're in `assets/` directory, `git add .` won't add changes to `index.html` in the parent directory

#### 2. `git add *`
Similar to `git add .` but with an additional limitation:
- Excludes hidden files (files starting with a dot)
- The `*` is expanded by your shell to match non-hidden files
- Example: `.env.example` won't be added because it's a hidden file

#### 3. `git add :`
This is the recommended approach because:
- `:` refers to the Git repository root
- Adds all changes in the entire repository, regardless of your current directory
- Includes hidden files and files in parent directories
- Example: Even if you're in `assets/icons/`, `git add :` will add all changes in your repository

### Best Practice Recommendation

Use `git add :` when you want to add all changes in your repository, regardless of your current directory location. This ensures you don't miss any files and works consistently across different directory levels. 