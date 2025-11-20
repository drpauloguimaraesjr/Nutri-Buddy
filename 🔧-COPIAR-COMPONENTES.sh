#!/bin/bash
# Copiar componentes de n8n-workflows/src para src/

cd /Users/drpgjr.../NutriBuddy

echo "📦 Copiando componentes..."

# Copiar tudo de n8n-workflows/src/ para src/
cp -r n8n-workflows/src/components/* src/components/ 2>/dev/null || true
cp -r n8n-workflows/src/hooks/* src/hooks/ 2>/dev/null || true
cp -r n8n-workflows/src/services/* src/services/ 2>/dev/null || true
cp -r n8n-workflows/src/types/* src/types/ 2>/dev/null || true

echo "✅ Componentes copiados!"
echo ""
echo "Execute:"
echo "  git add src/"
echo "  git commit -m 'fix: restaurar componentes'"
echo "  git push"

