#!/bin/bash

# ========================================
# 🔍 TESTE AUTOMATIZADO - Failed to fetch
# ========================================
# 
# Este script testa todas as possíveis causas do erro
# "TypeError: Failed to fetch"
#
# Uso: bash test-cors-issue.sh
#

echo "🔍 INICIANDO DIAGNÓSTICO..."
echo ""
echo "=========================================="
echo "TESTE 1: Backend está online?"
echo "=========================================="

BACKEND_URL="https://web-production-c9eaf.up.railway.app"

echo "📡 Testando: $BACKEND_URL"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/")

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Backend está ONLINE (Status: $RESPONSE)"
  curl -s "$BACKEND_URL/" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/"
else
  echo "❌ Backend OFFLINE ou com problema (Status: $RESPONSE)"
  echo "   → Verifique se o Railway está rodando!"
  exit 1
fi

echo ""
echo "=========================================="
echo "TESTE 2: Endpoint de conversas existe?"
echo "=========================================="

echo "📡 Testando: $BACKEND_URL/api/messages/conversations"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/messages/conversations")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Status: $STATUS"
echo "Resposta:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

if echo "$BODY" | grep -q "No token provided\|error"; then
  echo "✅ Endpoint existe e está protegido (correto!)"
  echo "   → Isso significa que precisa autenticação"
elif [ "$STATUS" = "200" ]; then
  echo "⚠️  Endpoint respondeu 200 sem token (estranho)"
  echo "   → Pode ser problema de autenticação"
else
  echo "❌ Endpoint com problema (Status: $STATUS)"
  echo "   → Verifique o backend no Railway"
fi

echo ""
echo "=========================================="
echo "TESTE 3: CORS Headers"
echo "=========================================="

echo "📡 Verificando headers CORS..."
HEADERS=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/messages/conversations" \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization")

echo "$HEADERS" | grep -i "access-control" || echo "⚠️  Nenhum header CORS encontrado"

if echo "$HEADERS" | grep -qi "access-control-allow-origin"; then
  ALLOWED_ORIGIN=$(echo "$HEADERS" | grep -i "access-control-allow-origin" | cut -d: -f2- | tr -d '[:space:]')
  echo "✅ CORS configurado!"
  echo "   Allowed Origin: $ALLOWED_ORIGIN"
  
  if [ "$ALLOWED_ORIGIN" = "*" ] || [ "$ALLOWED_ORIGIN" = "https://nutri-buddy-ir2n.vercel.app" ]; then
    echo "   ✅ Origem permitida corretamente!"
  else
    echo "   ⚠️  Origem diferente: $ALLOWED_ORIGIN"
    echo "   → Deveria ser: https://nutri-buddy-ir2n.vercel.app"
  fi
else
  echo "❌ CORS NÃO configurado!"
  echo ""
  echo "   🔧 SOLUÇÃO:"
  echo "   1. Abra Railway"
  echo "   2. Variables → Add:"
  echo "      CORS_ORIGIN=https://nutri-buddy-ir2n.vercel.app"
  echo "   3. Aguarde redeploy (1-2 min)"
  echo ""
fi

echo ""
echo "=========================================="
echo "TESTE 4: Teste completo com fetch"
echo "=========================================="

echo "📡 Simulando requisição do frontend..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/messages/conversations" \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" \
  -H "Accept: application/json")

BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Status: $STATUS"
echo "Resposta:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

if [ "$STATUS" = "401" ] || echo "$BODY" | grep -q "No token provided"; then
  echo "✅ Endpoint funciona! (precisa token, mas isso é correto)"
elif [ "$STATUS" = "200" ]; then
  echo "✅ Endpoint respondeu com sucesso!"
else
  echo "⚠️  Status inesperado: $STATUS"
fi

echo ""
echo "=========================================="
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "=========================================="
echo ""

# Verificar cada item
BACKEND_OK=false
ENDPOINT_OK=false
CORS_OK=false

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/")
[ "$BACKEND_STATUS" = "200" ] && BACKEND_OK=true

# Check endpoint
ENDPOINT_RESPONSE=$(curl -s "$BACKEND_URL/api/messages/conversations")
echo "$ENDPOINT_RESPONSE" | grep -q "error\|No token" && ENDPOINT_OK=true

# Check CORS
CORS_HEADERS=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/messages/conversations" -H "Origin: https://nutri-buddy-ir2n.vercel.app")
echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin" && CORS_OK=true

# Results
if [ "$BACKEND_OK" = true ]; then
  echo "✅ Backend está online"
else
  echo "❌ Backend está offline"
fi

if [ "$ENDPOINT_OK" = true ]; then
  echo "✅ Endpoint de conversas existe"
else
  echo "❌ Endpoint de conversas com problema"
fi

if [ "$CORS_OK" = true ]; then
  echo "✅ CORS configurado"
else
  echo "❌ CORS NÃO configurado ← ESTE É O PROBLEMA!"
  echo ""
  echo "   🔧 SOLUÇÃO:"
  echo "   Railway → Variables → Add:"
  echo "   CORS_ORIGIN=https://nutri-buddy-ir2n.vercel.app"
fi

echo ""
echo "=========================================="
echo "🎯 PRÓXIMOS PASSOS"
echo "=========================================="
echo ""

if [ "$CORS_OK" = false ]; then
  echo "1. ⚠️  Configure CORS no Railway"
  echo "2. Aguarde redeploy (1-2 min)"
  echo "3. Rode este script novamente"
  echo "4. Teste o site: https://nutri-buddy-ir2n.vercel.app/dashboard/chat"
elif [ "$BACKEND_OK" = false ]; then
  echo "1. ⚠️  Verifique Railway (backend offline)"
  echo "2. Restart o deploy se necessário"
  echo "3. Rode este script novamente"
elif [ "$ENDPOINT_OK" = false ]; then
  echo "1. ⚠️  Verifique logs do Railway"
  echo "2. Confirme que a rota existe no código"
  echo "3. Verifique se há erros no deploy"
else
  echo "✅ Tudo OK no backend!"
  echo ""
  echo "Se ainda há erro no frontend:"
  echo "1. Verifique Vercel → Environment Variables"
  echo "2. Confirme: NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL"
  echo "3. Faça logout e login no site"
  echo "4. F12 → Console para ver erro específico"
fi

echo ""
echo "=========================================="
echo "✅ DIAGNÓSTICO COMPLETO!"
echo "=========================================="
echo ""
echo "📸 Salve este resultado e me envie se precisar de ajuda!"
echo ""

