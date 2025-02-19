#!/bin/bash

# Exit on error
set -e

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo "Initialized new Git repository"
fi

# Configure Git user if not already configured
if [ -z "$(git config --get user.email)" ]; then
    echo "Please enter your Git email:"
    read git_email
    git config --global user.email "$git_email"
fi

if [ -z "$(git config --get user.name)" ]; then
    echo "Please enter your Git username:"
    read git_username
    git config --global user.name "$git_username"
fi

# Set the pull strategy to merge
git config pull.rebase false

# Check if we're already on main branch, if not create it
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$current_branch" != "main" ]; then
    # Try to checkout main if it exists, otherwise create it
    git checkout main 2>/dev/null || git checkout -b main
fi

# Set the specific remote URL with token authentication
if [ -n "$GITHUB_TOKEN" ]; then
    REMOTE_URL="https://${GITHUB_TOKEN}@github.com/VENOM30P/Once-11.git"
else
    echo "Error: GITHUB_TOKEN is not set. Please provide a GitHub Personal Access Token."
    exit 1
fi

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true

# Add the new remote
echo "Setting remote to: https://github.com/VENOM30P/Once-11.git"  # Don't print the token
git remote add origin "$REMOTE_URL"

# Create initial commit if repository is empty
if ! git rev-parse HEAD &>/dev/null; then
    # Create a README if it doesn't exist
    if [ ! -f "README.md" ]; then
        echo "# Once-11" > README.md
        echo "Initial project setup" >> README.md
    fi

    git add .
    git commit -m "Initial commit"
fi

# Set upstream and push with error handling
echo "Attempting to push to remote..."
if ! git push -u origin main; then
    echo "Failed to push. Trying to fetch and merge first..."
    git fetch origin
    git pull origin main --allow-unrelated-histories || {
        echo "Pull failed. You may need to manually resolve conflicts."
        exit 1
    }
    git push -u origin main
fi

echo "Git repository has been properly configured!"