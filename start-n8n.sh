#!/bin/bash

# Script para iniciar N8N localmente
# Uso: ./start-n8n.sh

echo "🚀 Iniciando N8N..."
echo ""

# Carregar arquivo de variáveis (opcional)
ENV_FILE_CANDIDATES=(
  "./.env.n8n"
  "./n8n.env"
  "$HOME/.n8n.env"
)

ENV_FILE=""
for candidate in "${ENV_FILE_CANDIDATES[@]}"; do
  if [ -f "$candidate" ]; then
    ENV_FILE="$candidate"
    break
  fi
done

if [ -n "$ENV_FILE" ]; then
  echo "📁 Usando variáveis de ambiente de: $ENV_FILE"
else
  echo "ℹ️ Nenhum arquivo de variáveis (.env.n8n ou n8n.env) encontrado."
  echo "   Você pode criar um arquivo .env.n8n com conteúdo como:"
  echo "     N8N_BASIC_AUTH_ACTIVE=true"
  echo "     N8N_BASIC_AUTH_USER=admin"
  echo "     N8N_BASIC_AUTH_PASSWORD=troque-esta-senha"
  echo "     API_URL=http://localhost:3000"
  echo "     WEBHOOK_SECRET=seu-segredo"
  echo ""
fi

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
            ${ENV_FILE:+--env-file "$ENV_FILE"} \
            n8nio/n8n
        exit 0
    fi
fi

# Usar npx como fallback
echo "📦 Iniciando N8N com npx..."
echo "   Isso pode levar alguns minutos na primeira vez..."
echo ""

npx n8n



