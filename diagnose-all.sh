#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO - NutriBuddy"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Backend
echo "📡 1. BACKEND (Porta 3000)"
echo "-------------------------"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo "   Resposta: $HEALTH"
else
    echo -e "${RED}❌ Backend NÃO está respondendo${NC}"
fi

echo ""

# 2. Verificar Frontend
echo "🌐 2. FRONTEND (Porta 3001)"
echo "-------------------------"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está rodando${NC}"
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
    echo "   Status HTTP: $STATUS_CODE"
else
    echo -e "${RED}❌ Frontend NÃO está respondendo${NC}"
fi

echo ""

# 3. Verificar processos
echo "⚙️  3. PROCESSOS"
echo "-------------------------"
BACKEND_PID=$(lsof -ti:3000)
FRONTEND_PID=$(lsof -ti:3001)

if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}✅ Backend rodando (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend NÃO está rodando${NC}"
fi

if [ -n "$FRONTEND_PID" ]; then
    echo -e "${GREEN}✅ Frontend rodando (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend NÃO está rodando${NC}"
fi

echo ""

# 4. Verificar rotas importantes
echo "🔗 4. TESTANDO ROTAS"
echo "-------------------------"

# Testar rota do Strava (sem auth, deve retornar erro de auth, não erro de callback)
STRAVA_TEST=$(curl -s http://localhost:3000/api/strava/status 2>&1)
if echo "$STRAVA_TEST" | grep -q "No token provided\|Authentication required"; then
    echo -e "${GREEN}✅ Rota /api/strava/status funcionando (erro de auth esperado)${NC}"
elif echo "$STRAVA_TEST" | grep -q "callback function"; then
    echo -e "${RED}❌ Rota /api/strava/status com erro de callback${NC}"
else
    echo -e "${YELLOW}⚠️  Resposta inesperada: ${STRAVA_TEST:0:100}${NC}"
fi

# Testar outras rotas
ROUTES=("health" "api/health")
for route in "${ROUTES[@]}"; do
    if curl -s "http://localhost:3000/$route" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Rota /$route OK${NC}"
    else
        echo -e "${RED}❌ Rota /$route falhou${NC}"
    fi
done

echo ""

# 5. Verificar erros recentes
echo "📋 5. ÚLTIMOS ERROS"
echo "-------------------------"
if [ -f "server.log" ]; then
    echo "Últimas linhas do server.log:"
    tail -5 server.log 2>/dev/null || echo "Nenhum log encontrado"
else
    echo "Nenhum arquivo server.log encontrado"
fi

echo ""
echo "======================================"
echo "💡 COMANDOS ÚTEIS:"
echo "   Parar tudo: lsof -ti:3000,3001 | xargs kill -9"
echo "   Iniciar backend: cd /Users/drpgjr.../NutriBuddy && npm start"
echo "   Iniciar frontend: cd frontend && npm run dev"
echo ""

