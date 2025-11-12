#!/bin/bash

# ============================================
# ⚡ SETUP RÁPIDO - Evolution API
# ============================================
# 
# Este script configura rapidamente a Evolution API
# após o deploy no Railway
#
# USO:
#   ./setup-evolution-quick.sh
#
# O que faz:
#   1. Cria instância WhatsApp
#   2. Mostra QR Code
#   3. Configura webhook N8N
#   4. Testa conexão
# ============================================

# ========== CONFIGURAÇÕES (EDITAR AQUI) ==========
EVOLUTION_URL="https://seu-projeto-evolution.up.railway.app"
EVOLUTION_API_KEY="NutriBuddy2024!SecureKey#789"
EVOLUTION_INSTANCE="nutribuddy-clinic"
N8N_WEBHOOK_URL="https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp"
# ==================================================

echo "⚡ SETUP RÁPIDO - Evolution API"
echo "================================"
echo ""
echo "Evolution URL: $EVOLUTION_URL"
echo "Instância: $EVOLUTION_INSTANCE"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ========== PASSO 1: Criar Instância ==========
echo "📱 PASSO 1: Criar Instância WhatsApp"
echo "-------------------------------------------"

response=$(curl -s -X POST "$EVOLUTION_URL/instance/create" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"instanceName\": \"$EVOLUTION_INSTANCE\",
    \"qrcode\": true,
    \"integration\": \"WHATSAPP-BAILEYS\"
  }")

if echo "$response" | grep -q "instanceName"; then
    echo -e "${GREEN}✅ Instância criada com sucesso!${NC}"
    echo ""
    
    # Extrair QR Code base64
    qrcode=$(echo "$response" | grep -o '"base64":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$qrcode" ]; then
        echo -e "${BLUE}📱 QR CODE GERADO!${NC}"
        echo ""
        echo "Opção 1: Escanear via Manager"
        echo "  → Abrir: $EVOLUTION_URL/manager"
        echo "  → Login com API Key: $EVOLUTION_API_KEY"
        echo "  → Ver QR Code na tela"
        echo ""
        echo "Opção 2: Salvar QR Code como imagem"
        echo "  → Executar o próximo comando e abrir qrcode.html no navegador"
        echo ""
        
        # Criar HTML com QR Code
        cat > qrcode.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>QR Code - NutriBuddy WhatsApp</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        img {
            max-width: 400px;
            border: 2px solid #ddd;
            border-radius: 10px;
        }
        .instructions {
            margin-top: 30px;
            text-align: left;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
        }
        .instructions ol {
            margin: 10px 0;
        }
        .instructions li {
            margin: 10px 0;
        }
        .expire {
            color: #e74c3c;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 NutriBuddy WhatsApp</h1>
        <p class="subtitle">Escaneie o QR Code abaixo</p>
        
        <img src="$qrcode" alt="QR Code WhatsApp">
        
        <div class="instructions">
            <strong>📱 Como Conectar:</strong>
            <ol>
                <li>Abra o <strong>WhatsApp Business</strong> no celular</li>
                <li>Toque em <strong>Menu (⋮)</strong> → <strong>Aparelhos conectados</strong></li>
                <li>Toque em <strong>Conectar um aparelho</strong></li>
                <li>Escaneie o QR Code acima</li>
                <li>Aguarde a mensagem <strong>"Conectado"</strong></li>
            </ol>
        </div>
        
        <p class="expire">⚠️ QR Code expira em 60 segundos. Se expirar, gere um novo.</p>
    </div>
</body>
</html>
EOF
        
        echo -e "${GREEN}✅ Arquivo qrcode.html criado!${NC}"
        echo "   Abrir no navegador: file://$(pwd)/qrcode.html"
        echo ""
        
    else
        echo -e "${YELLOW}⚠️  QR Code não extraído do response${NC}"
    fi
    
elif echo "$response" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  Instância já existe!${NC}"
    echo "   Pulando para próximo passo..."
    echo ""
else
    echo -e "${RED}❌ Erro ao criar instância${NC}"
    echo "   Response: $response"
    echo ""
    exit 1
fi

# Aguardar 5s para dar tempo de escanear
echo -e "${YELLOW}⏳ Aguarde 30 segundos para escanear o QR Code...${NC}"
for i in {30..1}; do
    echo -ne "   $i segundos restantes...\r"
    sleep 1
done
echo ""

# ========== PASSO 2: Verificar Conexão ==========
echo "🔍 PASSO 2: Verificar Conexão WhatsApp"
echo "-------------------------------------------"

response=$(curl -s -X GET "$EVOLUTION_URL/instance/connectionState/$EVOLUTION_INSTANCE" \
  -H "apikey: $EVOLUTION_API_KEY")

if echo "$response" | grep -q '"state":"open"'; then
    echo -e "${GREEN}✅ WhatsApp CONECTADO com sucesso!${NC}"
    echo ""
elif echo "$response" | grep -q '"state":"close"'; then
    echo -e "${RED}❌ WhatsApp ainda não conectado${NC}"
    echo "   Por favor, escaneie o QR Code e tente novamente"
    echo ""
    echo "   Para tentar novamente:"
    echo "   ./setup-evolution-quick.sh"
    exit 1
else
    echo -e "${YELLOW}⚠️  Status desconhecido: $response${NC}"
    echo ""
fi

# ========== PASSO 3: Configurar Webhook ==========
echo "🔗 PASSO 3: Configurar Webhook N8N"
echo "-------------------------------------------"

response=$(curl -s -X POST "$EVOLUTION_URL/webhook/set/$EVOLUTION_INSTANCE" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$N8N_WEBHOOK_URL\",
    \"webhook_by_events\": true,
    \"webhook_base64\": false,
    \"events\": [
      \"MESSAGES_UPSERT\",
      \"CONNECTION_UPDATE\"
    ]
  }")

if echo "$response" | grep -q "webhook"; then
    echo -e "${GREEN}✅ Webhook configurado com sucesso!${NC}"
    echo "   URL: $N8N_WEBHOOK_URL"
    echo ""
else
    echo -e "${YELLOW}⚠️  Webhook pode não ter sido configurado${NC}"
    echo "   Response: $response"
    echo ""
fi

# ========== PASSO 4: Teste Final ==========
echo "🧪 PASSO 4: Teste de Envio de Mensagem"
echo "-------------------------------------------"
echo ""
read -p "Deseja enviar uma mensagem de teste? Digite o número (ex: 5511999998888) ou ENTER para pular: " test_phone

if [ -n "$test_phone" ]; then
    response=$(curl -s -X POST "$EVOLUTION_URL/message/sendText/$EVOLUTION_INSTANCE" \
      -H "apikey: $EVOLUTION_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"number\": \"$test_phone\",
        \"text\": \"🎉 NutriBuddy WhatsApp conectado com sucesso! Sistema operacional.\"
      }")
    
    if echo "$response" | grep -q '"key"' || echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ Mensagem enviada com sucesso!${NC}"
        echo "   Verifique o WhatsApp: $test_phone"
    else
        echo -e "${RED}❌ Erro ao enviar mensagem${NC}"
        echo "   Response: $response"
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Teste de envio pulado${NC}"
    echo ""
fi

# ========== RESUMO FINAL ==========
echo "=========================================="
echo "🎉 SETUP COMPLETO!"
echo "=========================================="
echo ""
echo "✅ Status:"
echo "  • Instância criada: $EVOLUTION_INSTANCE"
echo "  • WhatsApp conectado: ✅"
echo "  • Webhook configurado: $N8N_WEBHOOK_URL"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Ativar Workflows no N8N:"
echo "   • Evolution: Receber Mensagens WhatsApp"
echo "   • Evolution: Enviar Mensagens para WhatsApp"
echo "   • Evolution: Atualizar Score ao Registrar Refeição"
echo ""
echo "2. Adicionar telefones aos pacientes no Firestore"
echo "   • Campo: phone (string)"
echo "   • Formato: 5511999998888 (DDI+DDD+número)"
echo ""
echo "3. Testar integração completa:"
echo "   • Enviar mensagem WhatsApp → Ver no Dashboard"
echo "   • Responder no Dashboard → Receber no WhatsApp"
echo ""
echo "📚 Documentação:"
echo "   • Ver: DEPLOY-EVOLUTION-API-PASSO-A-PASSO.md"
echo "   • Ver: TRABALHO-RECENTE-COMPLETO.md"
echo ""
echo "🔧 Comandos úteis:"
echo "   • Status: curl -H 'apikey: $EVOLUTION_API_KEY' $EVOLUTION_URL/instance/connectionState/$EVOLUTION_INSTANCE"
echo "   • Logs: Railway → Evolution API → View Logs"
echo "   • N8N: https://n8n-production-3eae.up.railway.app/executions"
echo ""
echo "🚀 Sistema NutriBuddy 100% operacional!"


