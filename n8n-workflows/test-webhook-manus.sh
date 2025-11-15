#!/bin/bash

# 🧪 Script para testar o workflow do Manus no n8n

echo "🧪 Testando workflow de transcrição de dieta (Manus)..."
echo ""

# ⚠️ ATENÇÃO: Substitua esta URL pela URL de teste que aparece no n8n
# quando você clicar em "Listen for Test Event"
N8N_TEST_URL="COLE_AQUI_A_URL_QUE_APARECE_NO_N8N"

# 📋 Dados de teste
PATIENT_ID="TESTE_PATIENT_123"
PDF_URL="https://firebasestorage.googleapis.com/v0/b/nutribuddy-app.appspot.com/o/exemplo-dieta.pdf?alt=media"

# Se você tiver um PDF real, substitua acima ↑

echo "📍 URL de teste: $N8N_TEST_URL"
echo "👤 Patient ID: $PATIENT_ID"
echo "📄 PDF URL: $PDF_URL"
echo ""
echo "🚀 Enviando requisição..."
echo ""

# Fazer requisição
curl -X POST "$N8N_TEST_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$PATIENT_ID\",
    \"pdfUrl\": \"$PDF_URL\"
  }" \
  -v

echo ""
echo ""
echo "✅ Requisição enviada!"
echo "🔍 Veja os resultados no n8n (cada nó vai mostrar os dados processados)"

