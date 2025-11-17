#!/bin/bash

# ============================================
# 🧪 TESTE COMPLETO - Evolution API
# ============================================
# 
# Este script testa toda a integração Evolution + N8N + WhatsApp
# 
# USO:
#   ./test-evolution-complete.sh
#
# ANTES DE RODAR:
#   1. Editar variáveis abaixo com suas URLs
#   2. Dar permissão: chmod +x test-evolution-complete.sh
#   3. Rodar: ./test-evolution-complete.sh
# ============================================

# ========== CONFIGURAÇÕES (EDITAR AQUI) ==========
EVOLUTION_URL="https://seu-projeto-evolution.up.railway.app"
EVOLUTION_API_KEY="NutriBuddy2024!SecureKey#789"
EVOLUTION_INSTANCE="nutribuddy-clinic"
N8N_WEBHOOK_URL="https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp"
TEST_PHONE="5511999998888"  # Número para teste de envio
# ==================================================

echo "🚀 INICIANDO TESTES - Sistema NutriBuddy"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== TESTE 1: Health Check Evolution ==========
echo "📋 TESTE 1: Health Check Evolution API"
echo "-------------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$EVOLUTION_URL/")
if [ "$response" -eq 200 ] || [ "$response" -eq 301 ]; then
    echo -e "${GREEN}✅ Evolution API está rodando!${NC}"
    echo "   HTTP Status: $response"
else
    echo -e "${RED}❌ Evolution API não está respondendo${NC}"
    echo "   HTTP Status: $response"
    echo "   URL testada: $EVOLUTION_URL"
fi
echo ""

# ========== TESTE 2: Manager Page ==========
echo "📋 TESTE 2: Manager Page"
echo "-------------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$EVOLUTION_URL/manager")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}✅ Manager page acessível!${NC}"
    echo "   Acesse: $EVOLUTION_URL/manager"
else
    echo -e "${YELLOW}⚠️  Manager page não acessível${NC}"
    echo "   HTTP Status: $response"
fi
echo ""

# ========== TESTE 3: Status da Instância ==========
echo "📋 TESTE 3: Status da Instância WhatsApp"
echo "-------------------------------------------"
response=$(curl -s -X GET "$EVOLUTION_URL/instance/connectionState/$EVOLUTION_INSTANCE" \
  -H "apikey: $EVOLUTION_API_KEY")

if echo "$response" | grep -q '"state":"open"'; then
    echo -e "${GREEN}✅ WhatsApp CONECTADO!${NC}"
    echo "   Instância: $EVOLUTION_INSTANCE"
    echo "   Response: $response"
elif echo "$response" | grep -q '"state":"close"'; then
    echo -e "${RED}❌ WhatsApp DESCONECTADO${NC}"
    echo "   Response: $response"
    echo ""
    echo -e "${YELLOW}🔧 Para reconectar, rode:${NC}"
    echo "   curl -X GET $EVOLUTION_URL/instance/connect/$EVOLUTION_INSTANCE \\"
    echo "     -H 'apikey: $EVOLUTION_API_KEY'"
else
    echo -e "${RED}❌ Erro ao verificar status${NC}"
    echo "   Response: $response"
fi
echo ""

# ========== TESTE 4: Webhook Configurado ==========
echo "📋 TESTE 4: Configuração de Webhook"
echo "-------------------------------------------"
response=$(curl -s -X GET "$EVOLUTION_URL/webhook/find/$EVOLUTION_INSTANCE" \
  -H "apikey: $EVOLUTION_API_KEY")

if echo "$response" | grep -q "$N8N_WEBHOOK_URL"; then
    echo -e "${GREEN}✅ Webhook configurado corretamente!${NC}"
    echo "   URL: $N8N_WEBHOOK_URL"
else
    echo -e "${YELLOW}⚠️  Webhook não configurado ou diferente${NC}"
    echo "   Response: $response"
    echo ""
    echo -e "${YELLOW}🔧 Para configurar, rode:${NC}"
    echo "   curl -X POST $EVOLUTION_URL/webhook/set/$EVOLUTION_INSTANCE \\"
    echo "     -H 'apikey: $EVOLUTION_API_KEY' \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"url\": \"$N8N_WEBHOOK_URL\", \"webhook_by_events\": true}'"
fi
echo ""

# ========== TESTE 5: Teste Webhook N8N ==========
echo "📋 TESTE 5: Teste Webhook N8N"
echo "-------------------------------------------"
response=$(curl -s -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "data": {"message": "Teste automático do script"}
  }')

if [ -n "$response" ]; then
    echo -e "${GREEN}✅ Webhook N8N respondeu!${NC}"
    echo "   Response: $response"
else
    echo -e "${YELLOW}⚠️  Webhook N8N não respondeu${NC}"
    echo "   Verificar se workflow está ativo no N8N"
fi
echo ""

# ========== TESTE 6: Enviar Mensagem Teste (OPCIONAL) ==========
echo "📋 TESTE 6: Enviar Mensagem de Teste (OPCIONAL)"
echo "-------------------------------------------"
read -p "Deseja enviar mensagem de teste para $TEST_PHONE? (s/N): " confirm
if [ "$confirm" == "s" ] || [ "$confirm" == "S" ]; then
    response=$(curl -s -X POST "$EVOLUTION_URL/message/sendText/$EVOLUTION_INSTANCE" \
      -H "apikey: $EVOLUTION_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"number\": \"$TEST_PHONE\",
        \"text\": \"🤖 Teste automático do sistema NutriBuddy! Sistema funcionando corretamente.\"
      }")
    
    if echo "$response" | grep -q '"status":"success"' || echo "$response" | grep -q '"key"'; then
        echo -e "${GREEN}✅ Mensagem enviada com sucesso!${NC}"
        echo "   Response: $response"
    else
        echo -e "${RED}❌ Erro ao enviar mensagem${NC}"
        echo "   Response: $response"
    fi
else
    echo -e "${YELLOW}⏭️  Teste de envio pulado${NC}"
fi
echo ""

# ========== RESUMO FINAL ==========
echo "=========================================="
echo "📊 RESUMO DOS TESTES"
echo "=========================================="
echo ""
echo "Para ver mais detalhes:"
echo "  • Railway Logs: https://railway.app → Evolution API → View Logs"
echo "  • N8N Executions: https://n8n-production-3eae.up.railway.app/executions"
echo "  • Firebase Console: https://console.firebase.google.com"
echo ""
echo "Próximos passos:"
echo "  1. Se tudo OK ✅ → Testar WhatsApp → Dashboard"
echo "  2. Se houver erros ❌ → Ver TROUBLESHOOTING em:"
echo "     DEPLOY-EVOLUTION-API-PASSO-A-PASSO.md"
echo ""
echo "🎉 Testes concluídos!"


