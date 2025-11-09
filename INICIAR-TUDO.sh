#!/bin/bash
# INICIAR-TUDO.sh
# Script para iniciar Backend + Frontend de uma vez

echo "🚀 Iniciando NutriBuddy completo..."
echo ""

# Verificar se os arquivos necessários existem
if [ ! -f "server.js" ]; then
    echo "❌ server.js não encontrado!"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Pasta frontend/ não encontrada!"
    exit 1
fi

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "=================================="
echo "🥗 NUTRIBUDDY - INICIALIZANDO"
echo "=================================="
echo ""

# Criar arquivo de log
LOG_DIR="logs"
mkdir -p $LOG_DIR
BACKEND_LOG="$LOG_DIR/backend-$(date +%Y%m%d-%H%M%S).log"
FRONTEND_LOG="$LOG_DIR/frontend-$(date +%Y%m%d-%H%M%S).log"

# Iniciar backend
echo "🚀 Iniciando Backend (porta 3000)..."
npm start > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
echo "   Log: $BACKEND_LOG"

# Aguardar backend iniciar
sleep 3

# Verificar se backend está rodando
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Backend iniciado com sucesso!"
else
    echo "❌ Falha ao iniciar backend"
    echo "   Verifique o log: $BACKEND_LOG"
    exit 1
fi

echo ""

# Iniciar frontend
echo "🎨 Iniciando Frontend (porta 3001)..."
cd frontend
npm run dev > "../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   PID: $FRONTEND_PID"
echo "   Log: $FRONTEND_LOG"

# Aguardar frontend iniciar
sleep 5

# Verificar se frontend está rodando
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend iniciado com sucesso!"
else
    echo "⚠️  Frontend pode ainda estar inicializando..."
    echo "   Aguarde mais alguns segundos e verifique: http://localhost:3001"
fi

echo ""
echo "=================================="
echo "✅ NUTRIBUDDY RODANDO!"
echo "=================================="
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔌 Backend:  http://localhost:3000"
echo "📋 API Docs: http://localhost:3000/"
echo ""
echo "🔍 PIDs dos processos:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs salvos em:"
echo "   Backend:  $BACKEND_LOG"
echo "   Frontend: $FRONTEND_LOG"
echo ""
echo "=================================="
echo "🛑 PARA PARAR TUDO:"
echo "=================================="
echo ""
echo "Execute:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Ou use:"
echo "   ./PARAR-TUDO.sh"
echo ""
echo "=================================="
echo ""

# Salvar PIDs em arquivo para script de parada
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Manter script rodando para não fechar os processos
echo "✨ Pressione Ctrl+C para ver instruções de parada"
echo ""

# Trap para capturar Ctrl+C
trap 'echo ""; echo "🛑 Para parar os servidores:"; echo "   kill $(cat .backend.pid) $(cat .frontend.pid)"; echo ""; exit' INT

# Aguardar indefinidamente
wait


