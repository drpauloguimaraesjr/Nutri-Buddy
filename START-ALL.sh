#!/bin/bash

echo "🚀 Iniciando NutriBuddy..."
echo ""

# Matar processos existentes
echo "🧹 Limpando processos antigos..."
pkill -f "next dev" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null

sleep 2

# Limpar cache do Next.js
echo "🗑️  Limpando cache..."
rm -rf /Users/drpgjr.../NutriBuddy/frontend/.next 2>/dev/null

sleep 1

echo ""
echo "✅ Tudo limpo!"
echo ""
echo "📋 Agora execute estes 2 comandos em terminais separados:"
echo ""
echo "Terminal 1 - Backend:"
echo "cd /Users/drpgjr.../NutriBuddy && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "cd /Users/drpgjr.../NutriBuddy/frontend && npm run dev"
echo ""
echo "Depois acesse: http://localhost:3001"

