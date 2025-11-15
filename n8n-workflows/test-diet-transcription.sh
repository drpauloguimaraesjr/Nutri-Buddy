#!/bin/bash

# Script para testar o workflow n8n de transcrição de dieta

# 🔧 CONFIGURAÇÃO
N8N_WEBHOOK_URL="https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet"
PATIENT_ID="TESTE_PATIENT_123"  # Substitua por um ID real
PDF_URL="https://firebasestorage.googleapis.com/v0/b/nutribuddy-app.appspot.com/o/teste-dieta.pdf?alt=media"  # Substitua por uma URL real

# 🎯 TESTE
echo "🧪 Testando workflow de transcrição de dieta..."
echo "📍 Webhook: $N8N_WEBHOOK_URL"
echo "👤 Patient ID: $PATIENT_ID"
echo "📄 PDF URL: $PDF_URL"
echo ""

# Fazer requisição
response=$(curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$PATIENT_ID\",
    \"pdfUrl\": \"$PDF_URL\"
  }" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s)

# Exibir resposta
echo "📥 RESPOSTA:"
echo "$response"
echo ""

# Verificar sucesso
if echo "$response" | grep -q '"success":true'; then
  echo "✅ SUCESSO! Dieta transcrita com precisão."
  echo ""
  echo "🔍 Próximos passos:"
  echo "  1. Vá no n8n → Executions para ver detalhes"
  echo "  2. Vá no Firebase Console → Firestore para ver os dados salvos"
  echo "  3. Busque pelo documento: patients/$PATIENT_ID"
else
  echo "❌ ERRO! Verifique:"
  echo "  1. Workflow está ativo no n8n?"
  echo "  2. API Key da OpenAI está configurada?"
  echo "  3. URL do PDF está acessível?"
  echo "  4. Patient ID existe no Firestore?"
fi

