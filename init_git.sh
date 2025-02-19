#!/bin/bash

# Exit on error
set -e

echo "=== Configuração do Git ==="
echo

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Inicializando novo repositório Git..."
    git init
    echo "✓ Repositório Git inicializado"
    echo
fi

# Configure Git user if not already configured
echo "Configurando usuário do Git..."
echo "Por favor, digite seu email do Git:"
read -p "> " git_email
git config --global user.email "$git_email"

echo
echo "Por favor, digite seu nome de usuário do Git:"
read -p "> " git_username
git config --global user.name "$git_username"

echo "✓ Configurações do usuário salvas"
echo

# Set the pull strategy to merge
git config pull.rebase false

# Check if we're already on main branch, if not create it
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$current_branch" != "main" ]; then
    echo "Criando branch principal..."
    git checkout main 2>/dev/null || git checkout -b main
    echo "✓ Branch 'main' configurada"
    echo
fi

# Set the specific remote URL with token authentication
if [ -n "$GITHUB_TOKEN" ]; then
    REMOTE_URL="https://${GITHUB_TOKEN}@github.com/VENOM30P/Once-11.git"
else
    echo "Erro: GITHUB_TOKEN não está configurado."
    exit 1
fi

# Remove existing origin if it exists
echo "Configurando remote..."
git remote remove origin 2>/dev/null || true

# Add the new remote
git remote add origin "$REMOTE_URL"
echo "✓ Remote configurado para: https://github.com/VENOM30P/Once-11.git"
echo

# Create initial commit if repository is empty
if ! git rev-parse HEAD &>/dev/null; then
    echo "Criando commit inicial..."
    if [ ! -f "README.md" ]; then
        echo "# Once-11" > README.md
        echo "Initial project setup" >> README.md
    fi

    git add .
    git commit -m "Initial commit"
    echo "✓ Commit inicial criado"
    echo
fi

# Set upstream and push with error handling
echo "Enviando alterações para o GitHub..."
if ! git push -u origin main; then
    echo "Tentando sincronizar com o repositório remoto..."
    git fetch origin
    git pull origin main --allow-unrelated-histories || {
        echo "Erro ao sincronizar. Pode ser necessário resolver conflitos manualmente."
        exit 1
    }
    git push -u origin main
fi

echo
echo "✓ Repositório Git configurado com sucesso!"