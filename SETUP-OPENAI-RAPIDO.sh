#!/bin/bash

echo "🔑 Configuração Rápida - OpenAI API"
echo "===================================="
echo ""

# Verificar se já existe
if grep -q "OPENAI_API_KEY" /Users/drpgjr.../NutriBuddy/.env 2>/dev/null; then
    echo "⚠️ OPENAI_API_KEY já existe no .env"
    echo ""
    read -p "Deseja substituir? (s/n): " resposta
    if [ "$resposta" != "s" ]; then
        echo "❌ Operação cancelada"
        exit 0
    fi
    # Remover linha antiga
    sed -i '' '/OPENAI_API_KEY/d' /Users/drpgjr.../NutriBuddy/.env
fi

echo ""
echo "📝 Cole sua API Key da OpenAI:"
echo "(Obtenha em: https://platform.openai.com/api-keys)"
echo ""
read -p "OPENAI_API_KEY: " api_key

if [ -z "$api_key" ]; then
    echo "❌ API Key não pode estar vazia"
    exit 1
fi

# Adicionar ao .env
echo "OPENAI_API_KEY=$api_key" >> /Users/drpgjr.../NutriBuddy/.env

echo ""
echo "✅ API Key adicionada com sucesso!"
echo ""
echo "🔄 Reiniciando backend..."
echo ""

# Parar backend
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Iniciar backend
cd /Users/drpgjr.../NutriBuddy
npm run dev &

sleep 4

echo ""
echo "✅ Backend reiniciado!"
echo ""
echo "🧪 Testando conexão com OpenAI..."
sleep 2

# Testar
resultado=$(curl -s http://localhost:3000/api/ai/status)

if echo "$resultado" | grep -q '"enabled":true'; then
    echo "✅ OpenAI Vision está funcionando!"
    echo ""
    echo "🎉 Configuração concluída com sucesso!"
    echo ""
    echo "📸 Agora você pode:"
    echo "  - Analisar fotos de alimentos"
    echo "  - Obter estimativa de PESO automática"
    echo "  - Usar o chat nutricional"
else
    echo "❌ Erro: OpenAI não está respondendo"
    echo ""
    echo "Verifique se a API Key está correta:"
    echo "https://platform.openai.com/api-keys"
fi

echo ""
echo "📚 Mais informações:"
echo "  - CONFIGURAR-OPENAI.md"
echo "  - MIGRACAO-OPENAI.md"
echo ""

