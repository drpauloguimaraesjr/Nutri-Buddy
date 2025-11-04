#!/bin/bash
echo "🔄 Parando servidor..."
pkill -f "node.*server.js" || true
sleep 2
echo "🚀 Iniciando servidor..."
cd "$(dirname "$0")"
npm start
