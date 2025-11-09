#!/bin/bash

# Script para fazer commit das mudanças e executar fix-patients

echo "🔧 Iniciando processo de commit e fix de pacientes..."
echo ""

# Token de administrador
ADMIN_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc2MjcyNzE2MCwiZXhwIjoxNzYyNzMwNzYwLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BudXRyaWJ1ZGR5LTJmYzljLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAbnV0cmlidWRkeS0yZmM5Yy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6Ing4elpJdVRPeHZjdXdwbEtlSWdnaThGNjFIdzIifQ.r2-tw6X9vCltp3igyqsTDlQw0-PErae88Dy4Im3IlCi_YRXm5xhKDkiJRul0YwjBRGB9iFVziHATRSuy0Qj1sKIpye_w8mNWxryL0SXsAH_yjSAAz2U1yQfcNi0HR-mU6CkfLWpRDmuYrPLzWNLfGKQJnd_zIODro-k1RlvEg0yDl9o_WayLCgo_nLB9VqNWfc18BDrojbSz6_nf3meV_tSwobChAh5TNZyOE9oxg6ajvZcq1S5ft_1uc6r9HBhojH0KeM3Qc7O_t2C7_BSUQcXattX_ZEumXHFYSMaVTVtySS5eKW3-yAwN2LfrpOQkJrK4hWxIG1SJWrKXIi9s9g"

echo "📝 1. Adicionando arquivos ao git..."
git add -A

echo ""
echo "📊 2. Verificando status..."
git status --short

echo ""
echo "💾 3. Fazendo commit..."
git commit -m "feat: add admin endpoint to fix patients auth and toggle password visibility"

echo ""
echo "🚀 4. Fazendo push para o repositório..."
git push origin main

echo ""
echo "⏳ 5. Executando fix-patients no servidor Railway..."
echo ""

curl -X POST https://web-production-c9eaf.up.railway.app/api/admin/fix-patients \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "✅ Processo concluído!"

