# 🚀 Comandos para Rodar o NutriBuddy

## ✅ COMANDOS CORRETOS

### Terminal 1 - Backend (Porta 3000)
```bash
cd /Users/drpgjr.../NutriBuddy
npm run dev
```

### Terminal 2 - Frontend (Porta 3001)
```bash
cd /Users/drpgjr.../NutriBuddy/frontend
npm run dev
```

## 🔧 Se Der Erro de Lock

Execute isto antes:
```bash
# Matar processos
pkill -f "next dev"
pkill -f "node server.js"

# Limpar cache do Next.js
rm -rf /Users/drpgjr.../NutriBuddy/frontend/.next

# Aguardar
sleep 2
```

Depois rode novamente os comandos acima.

## 🌐 URLs

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:3001
- **API Health:** http://localhost:3000/api/health

## ✅ ESTÁ TUDO PRONTO!

Agora você pode:
1. Abrir 2 terminais
2. Rodar os comandos acima
3. Acessar http://localhost:3001
4. Fazer login e testar!

