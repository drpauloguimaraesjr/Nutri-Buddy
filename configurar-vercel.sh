#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Executa via Vercel CLI

echo "=========================================="
echo "🔧 CONFIGURANDO VERCEL - NUTRIBUDDY"
echo "=========================================="
echo ""

cd /Users/drpgjr.../NutriBuddy

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Fazendo login no Vercel..."
vercel login

echo ""
echo "🔗 Linkando projeto..."
vercel link --yes

echo ""
echo "📋 Adicionando variáveis de ambiente..."
echo ""

# Firebase Config
echo "1/7 - Firebase API Key..."
echo "AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production

echo "2/7 - Firebase Auth Domain..."
echo "nutribuddy-2fc9c.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production

echo "3/7 - Firebase Project ID..."
echo "nutribuddy-2fc9c" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production

echo "4/7 - Firebase Storage Bucket..."
echo "nutribuddy-2fc9c.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production

echo "5/7 - Firebase Messaging Sender ID..."
echo "225946487395" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production

echo "6/7 - Firebase App ID..."
echo "1:225946487395:web:d14ef325c8970061aa4656" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

echo "7/7 - Backend URL..."
echo "https://web-production-c9eaf.up.railway.app" | vercel env add NEXT_PUBLIC_API_BASE_URL production

echo ""
echo "=========================================="
echo "✅ VARIÁVEIS CONFIGURADAS!"
echo "=========================================="
echo ""
echo "🚀 Fazendo redeploy..."
vercel --prod

echo ""
echo "✅ DEPLOY COMPLETO!"
echo ""
echo "🌐 Acesse: https://nutribuddy.vercel.app"
echo ""

