#!/bin/bash

# Script de teste: Enviar mensagem ao chat via endpoint n8n
# Uso: ./test-enviar-mensagem.sh [conversationId]

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 TESTE: Enviar Mensagem ao Chat via n8n"
echo "=========================================="
echo ""

# Configurações
BACKEND_URL="https://web-production-c9eaf.up.railway.app"
WEBHOOK_SECRET="nutribuddy-secret-2024"
CONVERSATION_ID="${1:-T57IAET5UAcfkAO6HFUF}"  # Use o ID da sua conversa
SENDER_ID="system"
SENDER_ROLE="prescriber"
CONTENT="🧪 TESTE: Esta é uma mensagem de teste enviada via n8n. Se você está vendo isso, o sistema está funcionando corretamente! ✅"

echo "📋 Configuração:"
echo "  Backend URL: $BACKEND_URL"
echo "  Conversation ID: $CONVERSATION_ID"
echo "  Sender Role: $SENDER_ROLE"
echo ""

# Construir JSON do body
JSON_BODY=$(cat <<EOF
{
  "senderId": "$SENDER_ID",
  "senderRole": "$SENDER_ROLE",
  "content": "$CONTENT",
  "type": "text",
  "isAiGenerated": true
}
EOF
)

echo "📤 Enviando mensagem..."
echo ""

# Fazer request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BACKEND_URL}/api/n8n/conversations/${CONVERSATION_ID}/messages" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: ${WEBHOOK_SECRET}" \
  -d "$JSON_BODY")

# Extrair HTTP code e body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📨 Resposta do servidor:"
echo ""

# Verificar resultado
if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ SUCESSO!${NC} (HTTP $HTTP_CODE)"
  echo ""
  echo "📄 Response Body:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
  echo -e "${GREEN}🎉 A mensagem foi enviada ao chat!${NC}"
  echo ""
  echo "Verifique no chat NutriBuddy se a mensagem apareceu."
  exit 0
else
  echo -e "${RED}❌ ERRO!${NC} (HTTP $HTTP_CODE)"
  echo ""
  echo "📄 Response Body:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
  echo -e "${YELLOW}⚠️ Possíveis causas:${NC}"
  echo "  1. conversationId incorreto ou não existe"
  echo "  2. webhook secret incorreto"
  echo "  3. backend não está rodando"
  echo "  4. erro no Firestore"
  echo ""
  echo "Tente:"
  echo "  - Verificar se a conversa existe"
  echo "  - Verificar logs do Railway"
  echo "  - Testar outro conversationId"
  exit 1
fi

