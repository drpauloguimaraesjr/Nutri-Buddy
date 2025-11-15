#!/usr/bin/env bash
set -euo pipefail

API_KEY="AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0"
PATIENT_EMAIL="guimaraesjrpaulo@gmail.com"
PATIENT_PASSWORD='Paulo050038$$'
PRESCRIBER_EMAIL="drpauloguimaraesjr@gmail.com"
PRESCRIBER_PASSWORD='123456'
API_BASE="https://web-production-c9eaf.up.railway.app"
PRESCRIBER_UID="6yooHer7ZgYOcYe0JHkXHLnWBq83"

log() { echo -e "\n==== $1 ===="; }

log "Gerando PATIENT_TOKEN"
PATIENT_TOKEN=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PATIENT_EMAIL\",\"password\":\"$PATIENT_PASSWORD\",\"returnSecureToken\":true}" \
  | jq -r '.idToken')

log "Gerando PRESCRIBER_TOKEN"
PRESCRIBER_TOKEN=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PRESCRIBER_EMAIL\",\"password\":\"$PRESCRIBER_PASSWORD\",\"returnSecureToken\":true}" \
  | jq -r '.idToken')

echo "PATIENT_TOKEN=$PATIENT_TOKEN"
echo "PRESCRIBER_TOKEN=$PRESCRIBER_TOKEN"

log "Listando conversas como paciente"
CONV_JSON=$(curl -s -X GET "$API_BASE/api/messages/conversations" \
  -H "Authorization: Bearer $PATIENT_TOKEN")

CONVERSATION_COUNT=$(echo "$CONV_JSON" | jq '.conversations | length')

if [ "$CONVERSATION_COUNT" -eq 0 ]; then
  log "Nenhuma conversa encontrada, criando conversa com o prescritor padrão"
  curl -s -X POST "$API_BASE/api/messages/conversations" \
    -H "Authorization: Bearer $PATIENT_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"prescriberId\":\"$PRESCRIBER_UID\",\"initialMessage\":\"Conversa criada automaticamente pelo script\"}" | jq

  CONV_JSON=$(curl -s -X GET "$API_BASE/api/messages/conversations" \
    -H "Authorization: Bearer $PATIENT_TOKEN")
fi

echo "$CONV_JSON" | jq '.conversations | .[0]'
CONVERSATION_ID=$(echo "$CONV_JSON" | jq -r '.conversations[0].id')
echo "CONVERSATION_ID=$CONVERSATION_ID"

log "Paciente envia mensagem"
curl -s -X POST "$API_BASE/api/messages/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Teste via script","type":"text"}' | jq

log "Prescritor responde"
curl -s -X POST "$API_BASE/api/messages/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $PRESCRIBER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Resposta via script","type":"text"}' | jq

log "Mensagens atualizadas"
curl -s -X GET "$API_BASE/api/messages/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq '.messages | .[-5:]'
