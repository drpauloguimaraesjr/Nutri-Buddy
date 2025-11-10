#!/bin/bash

# 🚀 Script de Setup Rápido - Sistema de Mensagens NutriBuddy
# Execute: bash setup-messages.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Setup Sistema de Mensagens NutriBuddy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar pré-requisitos
echo ""
info "Verificando pré-requisitos..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log "Node.js instalado: $NODE_VERSION"
else
    error "Node.js não instalado!"
    echo "  Instale em: https://nodejs.org"
    exit 1
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v)
    log "Docker instalado: $DOCKER_VERSION"
else
    warn "Docker não instalado - N8N não poderá rodar"
    echo "  Instale em: https://www.docker.com/products/docker-desktop"
fi

# Verificar se está no diretório correto
if [ ! -f "server.js" ]; then
    error "Execute este script no diretório raiz do NutriBuddy!"
    exit 1
fi

log "Diretório correto"
echo ""

# 1. Verificar arquivos criados
info "Verificando arquivos do sistema de mensagens..."
echo ""

FILES=(
    "routes/messages.js"
    "frontend/src/components/chat/ChatInterface.tsx"
    "frontend/src/components/chat/MessageBubble.tsx"
    "frontend/src/components/chat/ChatInput.tsx"
    "frontend/src/components/kanban/KanbanBoard.tsx"
    "frontend/src/components/kanban/KanbanColumn.tsx"
    "frontend/src/components/kanban/KanbanCard.tsx"
    "frontend/src/app/(dashboard)/messages/page.tsx"
    "frontend/src/app/(patient)/chat/page.tsx"
    "n8n-workflows/1-autoresposta-inicial.json"
    "n8n-workflows/2-analise-sentimento.json"
    "n8n-workflows/3-sugestoes-resposta.json"
    "n8n-workflows/4-followup-automatico.json"
    "n8n-workflows/5-resumo-diario.json"
)

MISSING_FILES=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        log "$file"
    else
        error "$file não encontrado!"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    error "Faltam $MISSING_FILES arquivos!"
    echo ""
    warn "Execute novamente a criação dos arquivos no Cursor"
    exit 1
fi

echo ""
log "Todos os arquivos estão presentes!"
echo ""

# 2. Instalar dependências do backend (se necessário)
if [ ! -d "node_modules" ]; then
    info "Instalando dependências do backend..."
    npm install
    log "Dependências do backend instaladas"
    echo ""
fi

# 3. Instalar dependências do frontend (se necessário)
if [ ! -d "frontend/node_modules" ]; then
    info "Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
    log "Dependências do frontend instaladas"
    echo ""
fi

# 4. Verificar .env
echo ""
info "Verificando configuração..."
echo ""

if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado!"
    echo "  Crie um arquivo .env baseado em env.example"
    echo ""
fi

if [ ! -f "frontend/.env.local" ]; then
    warn "Arquivo frontend/.env.local não encontrado!"
    echo "  Crie um arquivo .env.local no diretório frontend"
    echo ""
fi

# 5. Setup N8N Docker
echo ""
info "Configurando N8N Docker..."
echo ""

# Criar diretório N8N
N8N_DIR="$HOME/.n8n"
mkdir -p "$N8N_DIR"

# Criar docker-compose.yml
cat > "$N8N_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: nutribuddy-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=nutribuddy123
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - API_URL=http://host.docker.internal:3000
      - FIREBASE_TOKEN=${FIREBASE_TOKEN}
      - PRESCRIBER_EMAIL=${PRESCRIBER_EMAIL}
      - FRONTEND_URL=http://localhost:3001
    volumes:
      - ~/.n8n:/home/node/.n8n
EOF

log "docker-compose.yml criado em $N8N_DIR"

# Criar .env para N8N
if [ ! -f "$N8N_DIR/.env" ]; then
    cat > "$N8N_DIR/.env" << 'EOF'
# Configure suas variáveis aqui
FIREBASE_TOKEN=seu-token-aqui
PRESCRIBER_EMAIL=seu-email@example.com
EOF
    warn ".env criado em $N8N_DIR - CONFIGURE AS VARIÁVEIS!"
else
    log ".env já existe em $N8N_DIR"
fi

echo ""

# 6. Instruções finais
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup concluído com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Configure variáveis de ambiente:"
echo "    ${YELLOW}nano $N8N_DIR/.env${NC}"
echo ""
echo "2️⃣  Gere Firebase Token:"
echo "    ${YELLOW}node generate-token.js${NC}"
echo ""
echo "3️⃣  Inicie os serviços:"
echo ""
echo "    ${BLUE}# Terminal 1 - Backend${NC}"
echo "    ${YELLOW}node server.js${NC}"
echo ""
echo "    ${BLUE}# Terminal 2 - Frontend${NC}"
echo "    ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "    ${BLUE}# Terminal 3 - N8N${NC}"
echo "    ${YELLOW}cd $N8N_DIR && docker-compose up -d${NC}"
echo ""
echo "4️⃣  Acesse as aplicações:"
echo ""
echo "    Backend:  ${GREEN}http://localhost:3000${NC}"
echo "    Frontend: ${GREEN}http://localhost:3001${NC}"
echo "    N8N:      ${GREEN}http://localhost:5678${NC}"
echo "              User: admin | Pass: nutribuddy123"
echo ""
echo "5️⃣  Configure Firestore:"
echo "    - Acesse Firebase Console"
echo "    - Configure Rules (ver SETUP-SISTEMA-MENSAGENS.md)"
echo "    - Crie Índices necessários"
echo ""
echo "6️⃣  Importe workflows N8N:"
echo "    - Acesse http://localhost:5678"
echo "    - Import from File"
echo "    - Selecione arquivos em: ${YELLOW}n8n-workflows/${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo ""
echo "    - ${BLUE}SISTEMA-MENSAGENS-README.md${NC}     - Visão geral"
echo "    - ${BLUE}SETUP-SISTEMA-MENSAGENS.md${NC}      - Setup detalhado"
echo "    - ${BLUE}GUIA-USO-MENSAGENS.md${NC}           - Como usar"
echo "    - ${BLUE}SISTEMA-MENSAGENS-ESTRUTURA.md${NC}  - Arquitetura"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Sistema de Mensagens pronto para uso!"
echo ""

