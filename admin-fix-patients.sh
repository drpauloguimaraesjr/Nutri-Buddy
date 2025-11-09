#!/bin/bash

# Script automático para corrigir pacientes via API admin
# Uso: ./admin-fix-patients.sh

echo "🔧 Admin Fix Patients - NutriBuddy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Gerar ID Token
echo "🔑 1. Gerando ID Token de administrador..."
ID_TOKEN=$(node get-id-token.js 2>/dev/null | grep -A1 "ID TOKEN GERADO:" | tail -n1 | sed 's/━//g' | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo "❌ Erro ao gerar token. Execute manualmente:"
  echo "   node get-id-token.js"
  exit 1
fi

echo "✅ Token gerado com sucesso!"
echo ""

# 2. Executar endpoint
echo "🚀 2. Executando fix-patients no Railway..."
echo ""

RESPONSE=$(curl -s -X POST https://web-production-c9eaf.up.railway.app/api/admin/fix-patients \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json")

# 3. Mostrar resultado formatado
echo "📊 Resultado:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Verificar sucesso
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Operação concluída com sucesso!"
  
  # Extrair estatísticas
  CHECKED=$(echo "$RESPONSE" | grep -o '"checked":[0-9]*' | cut -d':' -f2)
  FIXED=$(echo "$RESPONSE" | grep -o '"fixed":[0-9]*' | cut -d':' -f2)
  
  echo ""
  echo "📈 Estatísticas:"
  echo "   • Pacientes verificados: $CHECKED"
  echo "   • Pacientes corrigidos: $FIXED"
else
  echo "❌ Erro na operação. Veja o resultado acima."
  exit 1
fi

echo ""
echo "✨ Processo concluído!"

