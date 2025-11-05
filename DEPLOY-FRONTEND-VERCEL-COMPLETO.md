# 🚀 Deploy Frontend Vercel - Guia Completo

## ✅ Status Atual

- ✅ **Backend:** Railway (`https://web-production-c9eaf.up.railway.app`)
- ✅ **N8N:** Configurado e funcionando
- ⏳ **Frontend:** Vamos fazer deploy agora!

---

## 📋 PASSO 1: Preparar o Repositório

### 1.1 Verificar se está no GitHub

```bash
# Verificar se o repositório está commitado
git status

# Se houver mudanças, commitar:
git add .
git commit -m "feat: prepare frontend for Vercel deploy"
git push origin main
```

✅ **Repositório:** `https://github.com/drpauloguimaraesjr/Nutri-Buddy`

---

## 📋 PASSO 2: Deploy no Vercel

### 2.1 Acessar Vercel

1. Acesse: **https://vercel.com**
2. Faça login com **GitHub** (mesma conta do repositório)
3. Clique em **"Add New Project"** ou **"Import Project"**

### 2.2 Importar Repositório

1. Procure por: **`Nutri-Buddy`** (ou `drpauloguimaraesjr/Nutri-Buddy`)
2. Clique em **"Import"**

### 2.3 Configurar Projeto

⚠️ **IMPORTANTE:** Configure estas opções:

#### **Root Directory:**
```
frontend
```

#### **Framework Preset:**
- Deve detectar automaticamente: **Next.js**

#### **Build Settings:**
O Vercel detecta automaticamente, mas verifique:
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

### 2.4 Configurar Variáveis de Ambiente

⚠️ **CRÍTICO:** Adicione estas variáveis antes de fazer deploy!

Clique em **"Environment Variables"** e adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `NEXT_PUBLIC_API_URL` | `https://web-production-c9eaf.up.railway.app` | Production, Preview, Development |

**📝 Nota:** 
- `NEXT_PUBLIC_*` são expostas no cliente (é seguro neste caso)
- Use a URL **completa** do Railway (sem barra no final)

### 2.5 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. O Vercel vai:
   - ✅ Instalar dependências (`npm install`)
   - ✅ Build do projeto (`npm run build`)
   - ✅ Deploy automático
   - ✅ Gerar URL: `https://nutri-buddy-xxxxx.vercel.app`

---

## 📋 PASSO 3: Anotar URL do Frontend

Após o deploy, você verá uma URL como:

```
https://nutri-buddy-xxxxx.vercel.app
```

**📝 ANOTE ESTA URL!** Você precisará dela no próximo passo.

---

## 📋 PASSO 4: Configurar CORS no Railway

### 4.1 Acessar Railway

1. Acesse: **https://railway.app**
2. Entre no projeto **NutriBuddy**
3. Vá em **Variables** (ou **Settings** → **Variables**)

### 4.2 Atualizar CORS_ORIGIN

1. Encontre a variável `CORS_ORIGIN`
2. **Edite** o valor para incluir a URL do Vercel:

**Opção 1 (Recomendado - Específico):**
```
https://nutri-buddy-xxxxx.vercel.app
```

**Opção 2 (Permissivo - Se quiser aceitar qualquer subdomínio do Vercel):**
```
https://*.vercel.app
```

**Opção 3 (Múltiplos domínios - Separe por vírgula):**
```
https://nutri-buddy-xxxxx.vercel.app,https://nutribuddy.com
```

3. Clique em **"Save"**
4. O Railway vai fazer **redeploy automático** (2-3 minutos)

---

## 📋 PASSO 5: Verificar Configuração do Firebase

### 5.1 Adicionar Domínio no Firebase Console

1. Acesse: **https://console.firebase.google.com**
2. Selecione o projeto: **nutribuddy-2fc9c**
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **"Add domain"**
5. Adicione: `nutri-buddy-xxxxx.vercel.app` (sem `https://`)
6. Clique em **"Add"**

**📝 Nota:** O domínio `localhost` e `vercel.app` já devem estar configurados por padrão, mas verifique!

---

## 📋 PASSO 6: Testar a Conexão

### 6.1 Testar Frontend

1. Abra a URL do Vercel no navegador:
   ```
   https://nutri-buddy-xxxxx.vercel.app
   ```

2. Verifique se:
   - ✅ A página carrega
   - ✅ Não há erros no console do navegador (F12)
   - ✅ A tela de login aparece

### 6.2 Testar API Connection

1. Abra o **Console do Navegador** (F12)
2. Vá na aba **Network**
3. Tente fazer login ou qualquer ação
4. Verifique se:
   - ✅ As requisições vão para `https://web-production-c9eaf.up.railway.app`
   - ✅ Não há erros CORS
   - ✅ Não há erros 401/403

### 6.3 Testar Backend Health

No terminal, teste:

```bash
curl https://web-production-c9eaf.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "NutriBuddy API"
}
```

---

## 📋 PASSO 7: Verificar Logs

### 7.1 Logs do Vercel

1. No Vercel Dashboard, vá em **Deployments**
2. Clique no último deploy
3. Veja os logs de build e runtime

### 7.2 Logs do Railway

1. No Railway Dashboard, vá em **Deployments**
2. Veja os logs para verificar:
   - ✅ CORS configurado corretamente
   - ✅ Sem erros de conexão

---

## ✅ Checklist Final

- [ ] Código commitado no GitHub
- [ ] Projeto importado no Vercel
- [ ] Root Directory: `frontend` configurado
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy realizado com sucesso
- [ ] URL do frontend anotada
- [ ] `CORS_ORIGIN` atualizado no Railway
- [ ] Domínio adicionado no Firebase (se necessário)
- [ ] Frontend carrega sem erros
- [ ] API conecta corretamente
- [ ] Login funciona
- [ ] Sem erros CORS

---

## 🐛 Troubleshooting

### Erro: "Build Failed"

**Causa:** Dependências faltando ou erro de build.

**Solução:**
1. Veja os logs do build no Vercel
2. Verifique se todas as dependências estão no `package.json`
3. Teste localmente: `cd frontend && npm run build`

### Erro: "API URL not found"

**Causa:** `NEXT_PUBLIC_API_URL` não configurada.

**Solução:**
1. Verifique se a variável está configurada no Vercel
2. Verifique se está marcada para **Production, Preview, Development**
3. Faça um novo deploy após adicionar

### Erro CORS no navegador

**Causa:** `CORS_ORIGIN` no Railway não inclui o domínio do Vercel.

**Solução:**
1. Verifique se `CORS_ORIGIN` no Railway tem a URL correta do Vercel
2. Aguarde o redeploy do Railway (2-3 minutos)
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Erro: "Invalid Firebase token"

**Causa:** Domínio não autorizado no Firebase.

**Solução:**
1. Adicione o domínio do Vercel no Firebase Console
2. Verifique se o domínio está na lista de autorizados

### Frontend não atualiza após mudanças

**Causa:** Cache do navegador ou build antigo.

**Solução:**
1. O Vercel faz deploy automático a cada push no GitHub
2. Aguarde alguns minutos após o push
3. Limpe o cache do navegador
4. Verifique se o novo deploy foi criado no Vercel Dashboard

---

## 🔄 Deploy Automático

O Vercel faz **deploy automático** sempre que você faz push no GitHub!

1. Faça alterações no código
2. `git add .`
3. `git commit -m "sua mensagem"`
4. `git push origin main`
5. Vercel detecta automaticamente
6. Faz novo deploy em ~2 minutos

**📝 Nota:** Você pode ver o progresso no Vercel Dashboard.

---

## 🌐 Domínio Customizado (Opcional)

Se quiser usar um domínio próprio:

1. No Vercel Dashboard, vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio (ex: `nutribuddy.com`)
4. Configure o DNS conforme as instruções do Vercel
5. Aguarde a propagação DNS (pode levar até 24h)

**⚠️ Importante:** Depois de adicionar o domínio customizado, atualize:
- `CORS_ORIGIN` no Railway com o novo domínio
- Lista de domínios autorizados no Firebase

---

## 📊 URLs Finais

Após o deploy completo:

- **Frontend:** `https://nutri-buddy-xxxxx.vercel.app`
- **Backend:** `https://web-production-c9eaf.up.railway.app`
- **N8N:** `https://drpauloguimaraesjr.app.n8n.cloud`

---

## 🎉 Pronto!

Agora você tem:
- ✅ Backend rodando no Railway
- ✅ Frontend rodando no Vercel
- ✅ N8N configurado e funcionando
- ✅ Tudo conectado e funcionando!

**🚀 Seu sistema NutriBuddy está 100% online!**

---

## 📚 Próximos Passos

1. Testar todas as funcionalidades
2. Configurar domínio customizado (opcional)
3. Configurar monitoramento (opcional)
4. Configurar backups (opcional)

---

**Dúvidas?** Veja os outros guias:
- `DEPLOY-RAPIDO-3-PASSOS.md` - Guia rápido
- `GUIA-COMPLETO-N8N-CLOUD.md` - Configuração N8N
- `COMANDOS-CURL-N8N.md` - Comandos cURL para N8N

