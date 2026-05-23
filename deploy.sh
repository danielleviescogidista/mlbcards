#!/usr/bin/env sh

# Script para desplegar en GitHub Pages

set -e

echo "🔨 Construyendo la aplicación..."
npm run build

echo "📤 Pushing a GitHub..."
git add .
git commit -m "🚀 Deploy a GitHub Pages - $(date)"
git push origin main

echo "✅ ¡Publicado! La app estará disponible en unos minutos en:"
echo "https://danielleviescogidista.github.io/mlbcards/"
