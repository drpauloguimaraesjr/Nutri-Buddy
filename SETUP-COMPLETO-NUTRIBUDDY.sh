#!/bin/bash
# SETUP-COMPLETO-NUTRIBUDDY.sh
# Script completo para configurar e validar todas as conexões do NutriBuddy

echo "=================================="
echo "🥗 NUTRIBUDDY - SETUP COMPLETO"
echo "=================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para mostrar erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para mostrar aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para mostrar info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ==========================================
# 1. VERIFICAR ARQUIVOS NECESSÁRIOS
# ==========================================
echo ""
echo "📁 1. Verificando estrutura de arquivos..."
echo "-------------------------------------------"

if [ -f "server.js" ]; then
    success "server.js encontrado"
else
    error "server.js não encontrado!"
    exit 1
fi

if [ -d "frontend" ]; then
    success "Pasta frontend/ encontrada"
else
    warning "Pasta frontend/ não encontrada"
fi

if [ -f "package.json" ]; then
    success "package.json encontrado"
else
    error "package.json não encontrado!"
    exit 1
fi

# ==========================================
# 2. VERIFICAR E CONFIGURAR VARIÁVEIS DE AMBIENTE
# ==========================================
echo ""
echo "🔐 2. Verificando variáveis de ambiente..."
echo "-------------------------------------------"

# Criar .env se não existir
if [ ! -f ".env" ]; then
    warning ".env não encontrado. Criando a partir do env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        info ".env criado! EDITE o arquivo com suas credenciais."
    else
        error "env.example não encontrado!"
        exit 1
    fi
else
    success ".env encontrado"
fi

# Verificar variáveis críticas
check_env_var() {
    var_name=$1
    if grep -q "^${var_name}=" .env; then
        value=$(grep "^${var_name}=" .env | cut -d '=' -f2-)
        if [ -n "$value" ] && [ "$value" != "your-*" ] && [ "$value" != "seu-*" ]; then
            success "$var_name configurado"
            return 0
        else
            warning "$var_name existe mas precisa ser configurado"
            return 1
        fi
    else
        error "$var_name não encontrado no .env"
        return 1
    fi
}

check_env_var "PORT"
check_env_var "FIREBASE_PROJECT_ID"
check_env_var "WEBHOOK_SECRET"

# Frontend .env.local
if [ -d "frontend" ]; then
    if [ -f "frontend/.env.local" ]; then
        success "frontend/.env.local encontrado"
    else
        warning "frontend/.env.local não encontrado. Criando..."
        cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
EOF
        info "frontend/.env.local criado! EDITE com suas credenciais Firebase."
    fi
fi

# ==========================================
# 3. VERIFICAR DEPENDÊNCIAS
# ==========================================
echo ""
echo "📦 3. Verificando dependências..."
echo "-------------------------------------------"

if [ ! -d "node_modules" ]; then
    warning "node_modules não encontrado."
    info "Execute 'npm install' para instalar dependências"
else
    success "node_modules encontrado"
fi

# Frontend
if [ -d "frontend" ]; then
    if [ ! -d "frontend/node_modules" ]; then
        warning "Dependências do frontend não encontradas."
        info "Execute 'cd frontend && npm install' para instalar"
    else
        success "node_modules do frontend encontrado"
    fi
fi

# ==========================================
# 4. VERIFICAR FIREBASE
# ==========================================
echo ""
echo "🔥 4. Verificando configuração Firebase..."
echo "-------------------------------------------"

if [ -f "config/firebase.js" ]; then
    success "config/firebase.js encontrado"
    
    # Verificar se tem credenciais configuradas
    if grep -q "FIREBASE_PROJECT_ID" config/firebase.js; then
        info "Firebase configurado para usar variáveis de ambiente"
    else
        warning "Firebase pode precisar de configuração manual"
    fi
else
    error "config/firebase.js não encontrado!"
fi

# ==========================================
# 5. VERIFICAR SE SERVIDOR ESTÁ RODANDO
# ==========================================
echo ""
echo "🚀 5. Verificando servidor backend..."
echo "-------------------------------------------"

# Verificar se já está rodando
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    success "Servidor já está rodando na porta 3000"
else
    warning "Servidor não está rodando"
    info "Execute 'npm start' para iniciar o servidor"
fi

# ==========================================
# 6. TESTAR ENDPOINTS DO BACKEND (se estiver rodando)
# ==========================================
echo ""
echo "🔌 6. Testando endpoints do backend..."
echo "-------------------------------------------"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    API_URL="http://localhost:3000"

    # Health Check
    response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/health 2>/dev/null || echo "000")
    if [ "$response" = "200" ]; then
        success "GET /api/health - Status 200"
    elif [ "$response" = "000" ]; then
        warning "Não foi possível conectar ao servidor"
    else
        error "GET /api/health - Status $response"
    fi

    # Root endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/ 2>/dev/null || echo "000")
    if [ "$response" = "200" ]; then
        success "GET / - Status 200"
    elif [ "$response" = "000" ]; then
        warning "Não foi possível conectar ao servidor"
    else
        error "GET / - Status $response"
    fi
else
    info "Servidor não está rodando. Pule os testes de endpoint."
fi

# ==========================================
# 7. VERIFICAR N8N
# ==========================================
echo ""
echo "🔄 7. Verificando integração N8N..."
echo "-------------------------------------------"

if [ -f ".env" ]; then
    if grep -q "^N8N_URL=" .env || grep -q "^N8N_API_URL=" .env; then
        N8N_URL=$(grep -E "^N8N_(API_)?URL=" .env | head -1 | cut -d '=' -f2-)
        info "N8N URL configurado: $N8N_URL"
        
        # Testar conexão com N8N
        if command -v curl &> /dev/null; then
            n8n_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$N8N_URL" 2>/dev/null || echo "000")
            if [ "$n8n_response" != "000" ]; then
                success "N8N está acessível (Status $n8n_response)"
            else
                warning "N8N não está acessível em $N8N_URL"
                info "Certifique-se que o N8N está rodando"
            fi
        fi
    else
        warning "N8N_URL não configurado no .env"
        info "Configure se quiser usar integração com N8N"
    fi
fi

# ==========================================
# 8. VERIFICAR FRONTEND
# ==========================================
echo ""
echo "🎨 8. Verificando frontend..."
echo "-------------------------------------------"

if [ -d "frontend" ]; then
    if [ -f "frontend/package.json" ]; then
        success "Frontend Next.js encontrado"
        
        # Verificar se está rodando
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            success "Frontend já está rodando na porta 3001"
        else
            info "Para iniciar o frontend, execute:"
            echo "   cd frontend && npm run dev"
        fi
    fi
fi

if [ -f "frontend-html-completo/index.html" ]; then
    success "Frontend HTML também disponível"
    info "Abra frontend-html-completo/index.html no navegador"
fi

# ==========================================
# 9. GERAR RELATÓRIO FINAL
# ==========================================
echo ""
echo "=================================="
echo "📊 RELATÓRIO FINAL"
echo "=================================="
echo ""

echo "Status do Sistema:"
echo ""

# Backend
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    success "Backend: Rodando ✓"
else
    warning "Backend: Não está rodando ✗"
fi

# Firebase
if [ -f "config/firebase.js" ]; then
    success "Firebase: Configurado ✓"
else
    error "Firebase: Não configurado ✗"
fi

# Variáveis de ambiente
if [ -f ".env" ]; then
    success "Variáveis de ambiente: Configuradas ✓"
else
    error "Variáveis de ambiente: Não configuradas ✗"
fi

# Frontend
if [ -d "frontend" ]; then
    success "Frontend: Disponível ✓"
else
    warning "Frontend: Não encontrado"
fi

echo ""
echo "=================================="
echo "📝 PRÓXIMOS PASSOS"
echo "=================================="
echo ""
echo "1. ✏️  Edite o arquivo .env com suas credenciais reais"
echo "2. ✏️  Edite frontend/.env.local com credenciais Firebase"
echo "3. 📦 Execute 'npm install' se necessário"
echo "4. 🚀 Inicie o backend: npm start"
echo "5. 🎨 Inicie o frontend: cd frontend && npm run dev"
echo "6. 🔄 Configure N8N workflows (opcional)"
echo ""
echo "=================================="
echo "📚 DOCUMENTAÇÃO ÚTIL"
echo "=================================="
echo ""
echo "• COMEÇAR-AQUI.md - Guia de início rápido"
echo "• COMO-RODAR-TUDO.md - Como executar o sistema"
echo "• CONFIGURAR-BACKEND-ROLES.md - Configurar permissões"
echo "• ATUALIZAR-N8N-PRODUCAO.md - Configurar N8N"
echo ""
echo "=================================="
echo "🆘 COMANDOS ÚTEIS"
echo "=================================="
echo ""
echo "# Iniciar backend"
echo "npm start"
echo ""
echo "# Iniciar frontend"
echo "cd frontend && npm run dev"
echo ""
echo "# Testar API"
echo "curl http://localhost:3000/api/health"
echo ""
echo "=================================="
echo "✅ VALIDAÇÃO COMPLETA!"
echo "=================================="
echo ""

# Salvar relatório em arquivo
REPORT_FILE="RELATORIO-SETUP-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "======================================"
    echo "RELATÓRIO DE SETUP - NUTRIBUDDY"
    echo "Data: $(date)"
    echo "======================================"
    echo ""
    echo "Backend: $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 'Rodando' || echo 'Parado')"
    echo "Frontend: $([ -d 'frontend' ] && echo 'Disponível' || echo 'Não encontrado')"
    echo "Firebase: $([ -f 'config/firebase.js' ] && echo 'Configurado' || echo 'Não configurado')"
    echo "N8N: $(grep -q '^N8N_URL=' .env 2>/dev/null && echo 'Configurado' || echo 'Não configurado')"
    echo ""
    if [ -f ".env" ]; then
        echo "Variáveis de ambiente (.env):"
        grep -v '^#' .env | grep -v '^$' | while read line; do
            key=$(echo $line | cut -d '=' -f1)
            echo "  - $key"
        done
    fi
} > "$REPORT_FILE"

success "Relatório salvo em: $REPORT_FILE"
echo ""

