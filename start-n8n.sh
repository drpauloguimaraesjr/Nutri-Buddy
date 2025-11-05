#!/bin/bash

# Script para iniciar N8N localmente
# Uso: ./start-n8n.sh

echo "🚀 Iniciando N8N..."
echo ""

# Verificar se já está rodando
if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ N8N já está rodando em http://localhost:5678"
    echo "   Abra no navegador: http://localhost:5678"
    exit 0
fi

# Verificar se Docker está disponível e rodando
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        echo "🐳 Iniciando N8N com Docker..."
        docker run -it --rm \
            --name n8n \
            -p 5678:5678 \
            -v ~/.n8n:/home/node/.n8n \
            n8nio/n8n
        exit 0
    fi
fi

# Usar npx como fallback
echo "📦 Iniciando N8N com npx..."
echo "   Isso pode levar alguns minutos na primeira vez..."
echo ""

npx n8n


