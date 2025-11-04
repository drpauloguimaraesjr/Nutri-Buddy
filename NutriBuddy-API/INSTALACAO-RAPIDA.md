# 🚀 INSTALAÇÃO RÁPIDA - NutriBuddy API

## ⚡ 3 PASSOS PARA COMECAR

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar Firebase
```bash
cp env.example .env
```

Edite o `.env` com suas credenciais:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

### 3️⃣ Iniciar servidor
```bash
npm start
```

✅ **Pronto!** Servidor rodando em `http://localhost:3000`

---

## 🔗 Teste rápido

Abra no navegador:
```
http://localhost:3000/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "service": "NutriBuddy API"
}
```

---

## 🔧 Integração N8N

No N8N, configure um Webhook:
- **URL**: `http://localhost:3000/api/webhook`
- **Header**: `x-webhook-secret` (valor do `.env`)

Mais detalhes no `README.md`

