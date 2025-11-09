#!/bin/bash

# ✅ SCRIPT PARA TESTAR TUDO RAPIDAMENTE
# Copie e cole no terminal (na pasta NutriBuddy)

echo "🚀 Testando NutriBuddy..."
echo ""

# Verificar se servidor está rodando
echo "1️⃣ Testando se servidor está rodando..."
curl -s http://localhost:3000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Servidor está rodando!"
    echo ""
    
    # Testar health
    echo "2️⃣ Health check:"
    curl -s http://localhost:3000/api/health | jq '.' || curl -s http://localhost:3000/api/health
    echo ""
    
    # Ver rotas disponíveis
    echo "3️⃣ Rotas disponíveis:"
    curl -s http://localhost:3000/ | jq '.endpoints' || curl -s http://localhost:3000/
    echo ""
    
    echo "✅ Tudo funcionando!"
    echo ""
    echo "📡 APIs disponíveis:"
    echo "   - Prescritor: /api/prescriber/*"
    echo "   - Paciente:   /api/patient/*"
    echo ""
    
else
    echo "❌ Servidor NÃO está rodando!"
    echo ""
    echo "Para iniciar o servidor:"
    echo "  npm start"
    echo ""
    echo "Ou em modo dev:"
    echo "  npm run dev"
    echo ""
fi

echo "🎯 Próximo passo:"
echo "   1. Aplicar regras do Firestore (veja COMECE-AQUI-AGORA.md)"
echo "   2. Testar no frontend (criar conta prescritor/paciente)"
echo ""




