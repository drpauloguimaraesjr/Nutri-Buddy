#!/bin/bash

# Script para reorganizar o projeto
echo "🔧 Reorganizando projeto NutriBuddy..."

cd /Users/drpgjr.../NutriBuddy

# Copiar componentes de n8n-workflows/src para src/
echo "📦 Copiando componentes..."
cp -r n8n-workflows/src/components/* src/components/ 2>/dev/null || true
cp -r n8n-workflows/src/hooks/* src/hooks/ 2>/dev/null || true  
cp -r n8n-workflows/src/services/* src/services/ 2>/dev/null || true
cp -r n8n-workflows/src/lib/* src/lib/ 2>/dev/null || true
cp -r n8n-workflows/src/types/* src/types/ 2>/dev/null || true

# Criar pasta docs/ para documentação
echo "📚 Organizando documentação..."
mkdir -p docs/

# Mover todos os .md para docs/ (exceto README.md e principais)
find . -maxdepth 1 -name "*.md" \
  ! -name "README.md" \
  ! -name "🚀-DEPLOY-TUDO-AGORA.md" \
  -exec mv {} docs/ \; 2>/dev/null || true

# Limpar arquivos duplicados/antigos
echo "🧹 Limpando arquivos desnecessários..."
rm -f *.tsbuildinfo
rm -f next.config.mjs
rm -f params.env

echo "✅ Reorganização completa!"
echo ""
echo "📁 Estrutura final:"
echo "   /pages - Frontend (Next.js)"
echo "   /src - Componentes e lógica"
echo "   /routes - Backend (Express)"
echo "   /services - Serviços backend"
echo "   /config - Configurações"
echo "   /docs - Documentação"
echo ""

