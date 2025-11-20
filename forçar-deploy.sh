#!/bin/bash

# Script para forçar deploy no Vercel via commit vazio

cd /Users/drpgjr.../NutriBuddy

echo "🔄 Forçando novo deploy no Vercel..."
echo ""

# Criar commit vazio
git commit --allow-empty -m "chore: forçar redeploy no Vercel"

echo "✅ Commit vazio criado!"
echo ""

# Fazer push
echo "📤 Fazendo push para GitHub..."
git push origin main

echo ""
echo "✅ Push concluído!"
echo ""
echo "⏰ Aguarde 2-3 minutos e verifique o deploy em:"
echo "   https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-novo/deployments"
echo ""

