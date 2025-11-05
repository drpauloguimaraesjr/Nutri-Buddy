# 🚀 Como Iniciar o N8N Localmente

## ⚡ Método Rápido (Recomendado)

### Opção 1: Usando npx (sem instalação)

```bash
cd /Users/drpgjr.../NutriBuddy
npx n8n
```

O N8N será instalado automaticamente e iniciado na porta **5678**.

Aguarde alguns segundos e acesse: **http://localhost:5678**

---

### Opção 2: Usando Docker (se Docker Desktop estiver rodando)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Acesse: **http://localhost:5678**

---

### Opção 3: Instalação Global (permanente)

```bash
npm install -g n8n
n8n
```

Depois, sempre que quiser iniciar:
```bash
n8n
```

---

## 🔧 Primeira Configuração

1. **Acesse:** http://localhost:5678
2. **Crie sua conta** (primeira vez)
3. **Importe o workflow:**
   - Workflows → "+ New"
   - "..." → "Import from File"
   - Selecione: `N8N-WORKFLOW.json`

---

## ⚙️ Configurar Variáveis de Ambiente

No N8N:
1. Settings → Environment Variables
2. Adicione:
   - `WEBHOOK_SECRET` = valor do seu `.env` (backend)
   - `FIREBASE_TOKEN` = seu token Firebase
   - `API_URL` = `http://localhost:3000`

---

## ✅ Verificar se está Rodando

```bash
curl http://localhost:5678/healthz
```

Deve retornar: `OK`

---

## 🛑 Parar o N8N

- Se rodou com `npx`: Pressione `Ctrl+C`
- Se rodou com Docker: `docker stop n8n`
- Se rodou globalmente: Pressione `Ctrl+C`

---

## 📝 Notas

- O N8N salva dados em `~/.n8n` (primeira vez cria automaticamente)
- Para desenvolvimento local, use `http://localhost:3000` como `API_URL`
- Para produção, use N8N Cloud ou exponha o backend com ngrok

---

**✅ Pronto! Agora você pode acessar http://localhost:5678 e começar a usar o N8N!**


