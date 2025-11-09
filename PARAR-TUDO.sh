#!/bin/bash
# PARAR-TUDO.sh
# Script para parar Backend + Frontend

echo "🛑 Parando NutriBuddy..."
echo ""

# Ler PIDs salvos
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔴 Parando Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        
        # Forçar se ainda estiver rodando
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        
        echo "✅ Backend parado"
    else
        echo "⚠️  Backend já estava parado"
    fi
    rm -f .backend.pid
else
    echo "⚠️  Arquivo .backend.pid não encontrado"
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🔴 Parando Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
        
        # Forçar se ainda estiver rodando
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        
        echo "✅ Frontend parado"
    else
        echo "⚠️  Frontend já estava parado"
    fi
    rm -f .frontend.pid
else
    echo "⚠️  Arquivo .frontend.pid não encontrado"
fi

# Verificar e limpar portas se ainda estiverem em uso
echo ""
echo "🔍 Verificando portas..."

# Porta 3000 (Backend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Porta 3000 ainda em uso. Limpando..."
    PORT_PID=$(lsof -t -i:3000)
    kill -9 $PORT_PID 2>/dev/null
    echo "✅ Porta 3000 liberada"
else
    echo "✅ Porta 3000 livre"
fi

# Porta 3001 (Frontend)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Porta 3001 ainda em uso. Limpando..."
    PORT_PID=$(lsof -t -i:3001)
    kill -9 $PORT_PID 2>/dev/null
    echo "✅ Porta 3001 liberada"
else
    echo "✅ Porta 3001 livre"
fi

echo ""
echo "=================================="
echo "✅ NUTRIBUDDY PARADO"
echo "=================================="
echo ""
echo "Para iniciar novamente:"
echo "   ./INICIAR-TUDO.sh"
echo ""


