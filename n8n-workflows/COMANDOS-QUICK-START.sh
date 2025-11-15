#!/bin/bash
# 🚀 NutriBuddy - Quick Start Commands
# Execute este script para configurar tudo rapidamente

set -e  # Para em caso de erro

echo "🚀 NutriBuddy - Quick Start Setup"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# URLs dos serviços
BACKEND_URL="https://web-production-c9eaf.up.railway.app"
N8N_URL="https://n8n-production-3eae.up.railway.app"

echo -e "${BLUE}📊 Verificando serviços...${NC}"
echo ""

# 1. Verificar Backend
echo -n "Backend Railway... "
if curl -s "$BACKEND_URL/api/health" | grep -q "running"; then
  echo -e "${GREEN}✅ Online${NC}"
else
  echo -e "${RED}❌ Offline ou sem resposta${NC}"
fi

# 2. Verificar n8n
echo -n "n8n Railway... "
if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
  echo -e "${GREEN}✅ Online${NC}"
else
  echo -e "${RED}❌ Offline ou precisa auth${NC}"
fi

# 3. Verificar Z-API
echo -n "Z-API WhatsApp... "
ZAPI_STATUS=$(curl -s "https://api.z-api.io/instances/3EA240373A126172229A82761BB89DF3/token/8F4DA3C4CA0EFA2069E84E7D/status" | grep -o '"connected"' || echo "")
if [ "$ZAPI_STATUS" == '"connected"' ]; then
  echo -e "${GREEN}✅ Conectado${NC}"
else
  echo -e "${YELLOW}⚠️  Não conectado (precisa escanear QR Code)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Perguntar se quer continuar
echo -e "${YELLOW}Deseja configurar as variáveis de ambiente no Railway?${NC}"
echo "(Você precisará fazer login no Railway manualmente)"
echo ""
read -p "Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${RED}Setup cancelado.${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}📋 VARIÁVEIS PARA COPIAR NO RAILWAY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}🔸 BACKEND (Railway - Projeto web-production-c9eaf):${NC}"
echo ""
cat << 'EOF'
N8N_URL=https://n8n-production-3eae.up.railway.app
N8N_NEW_MESSAGE_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-messages
WEBHOOK_SECRET=nutribuddy-secret-2024
ZAPI_INSTANCE_ID=3EA240373A126172229A82761BB89DF3
ZAPI_TOKEN=8F4DA3C4CA0EFA2069E84E7D
ZAPI_BASE_URL=https://api.z-api.io
EOF

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}🔸 FRONTEND (Vercel):${NC}"
echo ""
cat << 'EOF'
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet
NEXT_PUBLIC_API_BASE_URL=https://web-production-c9eaf.up.railway.app
EOF

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📝 PASSOS MANUAIS:${NC}"
echo ""
echo "1️⃣  Railway Backend:"
echo "   - Abra: https://railway.app/project/seu-projeto"
echo "   - Vá em Variables"
echo "   - Cole as variáveis acima"
echo "   - Clique em Deploy"
echo ""

echo "2️⃣  Vercel Frontend:"
echo "   - Abra: https://vercel.com/seu-projeto/settings/environment-variables"
echo "   - Adicione as variáveis do frontend"
echo "   - Redeploy"
echo ""

echo "3️⃣  n8n Workflows:"
echo "   - Abra: $N8N_URL"
echo "   - Faça login"
echo "   - Import from File:"
echo "     • 1-AUTO-RESPOSTA-FINAL.json"
echo "     • 2-ANALISE-COMPLETO-FINAL.json"
echo "     • 3-SUGESTOES-RESPOSTA-FINAL.json"
echo "     • 9-PROCESSAR-DIETA-PDF-GPT4O-VISION.json"
echo "   - Configure credenciais (Google + OpenAI)"
echo "   - Ative os workflows"
echo ""

echo "4️⃣  Z-API WhatsApp:"
echo "   - Abra: https://z-api.io"
echo "   - Login na sua conta"
echo "   - Vá em Webhooks"
echo "   - Configure URL: $BACKEND_URL/api/webhooks/zapi-whatsapp"
echo "   - Ative eventos: message-received, message-ack"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Guia completo criado!${NC}"
echo ""
echo -e "${YELLOW}📄 Consulte o plano detalhado em:${NC}"
echo "   ./PLANO-IMPLEMENTACAO-HOJE.md"
echo ""
echo -e "${BLUE}🎯 Próximo passo: Importar workflows no n8n${NC}"
echo ""

# Oferecer testar API
echo -e "${YELLOW}Deseja testar a API de mensagens?${NC}"
read -p "Testar agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo ""
  echo -e "${BLUE}🧪 Testando API...${NC}"
  echo ""
  
  # Teste health
  echo -n "Health check... "
  HEALTH=$(curl -s "$BACKEND_URL/api/health")
  if echo "$HEALTH" | grep -q "running"; then
    echo -e "${GREEN}✅${NC}"
  else
    echo -e "${RED}❌${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✅ Teste concluído!${NC}"
  echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎊 Setup completo! Bom trabalho!${NC}"
echo ""

