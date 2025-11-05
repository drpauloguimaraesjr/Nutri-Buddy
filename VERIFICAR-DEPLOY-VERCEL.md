# ✅ Verificar Deploy Vercel e Conectar

## 📍 Status Atual

Você compartilhou o deployment do Vercel:
- **Link:** https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-ir2n/6QuwLaJx1uHX28Ld3M7sFx9FrqLU
- **Projeto:** `nutri-buddy-ir2n`

---

## 🔍 PASSO 1: Verificar Status do Deployment

### 1.1 Acessar o Dashboard

1. Acesse: **https://vercel.com**
2. Faça login
3. Vá em **Projects** → **nutri-buddy-ir2n**
4. Ou acesse diretamente o link que você compartilhou

### 1.2 Verificar Status

Procure por:
- ✅ **"Ready"** ou **"Deployed"** → Deployment concluído!
- ⏳ **"Building"** → Ainda em processo, aguarde
- ❌ **"Error"** → Verifique os logs

### 1.3 Anotar a URL

Quando o deployment estiver pronto, você verá uma URL como:

```
https://nutri-buddy-ir2n-xxxxx.vercel.app
```

ou

```
https://nutri-buddy-ir2n.vercel.app
```

**📝 ANOTE ESTA URL EXATA!** Você precisará dela no próximo passo.

---

## 🔧 PASSO 2: Verificar Configurações

### 2.1 Verificar Variáveis de Ambiente

1. No Vercel Dashboard, vá em **Settings** → **Environment Variables**
2. Verifique se está configurada:
   - `NEXT_PUBLIC_API_URL` = `https://web-production-c9eaf.up.railway.app`
3. Se não estiver:
   - Clique em **"Add"**
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: `https://web-production-c9eaf.up.railway.app`
   - Ambientes: Marque **Production, Preview, Development**
   - Clique em **Save**
   - Faça um novo deploy

### 2.2 Verificar Root Directory

1. Vá em **Settings** → **General**
2. Verifique se **Root Directory** está como: `frontend`
3. Se não estiver, edite e salve

---

## 🔗 PASSO 3: Configurar CORS no Railway (CRÍTICO!)

Após o deploy do Vercel estar pronto, você **DEVE** atualizar o CORS no Railway:

### 3.1 Acessar Railway

1. Acesse: **https://railway.app**
2. Entre no projeto **NutriBuddy**
3. Vá em **Variables**

### 3.2 Atualizar CORS_ORIGIN

1. Encontre a variável `CORS_ORIGIN`
2. **Edite** o valor para incluir a URL do Vercel:

**Opção 1 (Recomendado - URL específica):**
```
https://nutri-buddy-ir2n-xxxxx.vercel.app
```
*(Use a URL exata que você anotou do Vercel)*

**Opção 2 (Permissivo - Aceitar qualquer subdomínio Vercel):**
```
https://*.vercel.app
```

**Opção 3 (Múltiplos domínios):**
```
https://nutri-buddy-ir2n-xxxxx.vercel.app,https://nutribuddy.com
```

3. Clique em **Save**
4. Aguarde o redeploy do Railway (2-3 minutos)

---

## ✅ PASSO 4: Testar a Conexão

### 4.1 Testar Frontend

1. Abra a URL do Vercel no navegador:
   ```
   https://nutri-buddy-ir2n-xxxxx.vercel.app
   ```

2. Abra o **Console do Navegador** (F12)
3. Vá na aba **Network**
4. Tente fazer login ou qualquer ação
5. Verifique:
   - ✅ A página carrega sem erros
   - ✅ Não há erros CORS no console
   - ✅ As requisições vão para `https://web-production-c9eaf.up.railway.app`
   - ✅ Status 200 (sucesso) nas requisições

### 4.2 Testar Backend

No terminal:

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

### 4.3 Testar CORS

```bash
curl -H "Origin: https://nutri-buddy-ir2n-xxxxx.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  https://web-production-c9eaf.up.railway.app/api/health
```

Deve retornar headers CORS incluindo:
- `Access-Control-Allow-Origin: https://nutri-buddy-ir2n-xxxxx.vercel.app`

---

## 🐛 Troubleshooting

### Erro: "Build Failed" no Vercel

**Verificar:**
1. Veja os **Logs** no Vercel Dashboard
2. Verifique se `package.json` está correto
3. Teste localmente:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

**Solução comum:**
- Dependências faltando → Verifique `package.json`
- Erro de TypeScript → Veja os logs detalhados

### Erro CORS no navegador

**Sintomas:**
- Console mostra: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solução:**
1. Verifique se `CORS_ORIGIN` no Railway tem a URL **exata** do Vercel
2. Aguarde o redeploy do Railway (2-3 minutos)
3. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
4. Teste novamente

### Erro: "API URL not found"

**Sintomas:**
- Frontend não consegue conectar ao backend
- Erros 404 ou "API URL not found"

**Solução:**
1. Verifique se `NEXT_PUBLIC_API_URL` está configurada no Vercel
2. Verifique se está marcada para **Production, Preview, Development**
3. Faça um novo deploy após adicionar a variável
4. Verifique no código se está usando: `process.env.NEXT_PUBLIC_API_URL`

### Frontend carrega mas não conecta ao backend

**Verificar:**
1. Abra o Console do Navegador (F12) → Network
2. Veja se as requisições estão indo para a URL correta
3. Verifique o status das requisições (200 = sucesso, 401 = auth, 404 = not found)
4. Verifique se há erros CORS

---

## 📊 Checklist Final

- [ ] Deployment no Vercel concluído (status "Ready")
- [ ] URL do frontend anotada
- [ ] `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] Root Directory: `frontend` configurado
- [ ] `CORS_ORIGIN` atualizado no Railway com URL do Vercel
- [ ] Redeploy do Railway concluído
- [ ] Frontend carrega sem erros
- [ ] Console do navegador sem erros CORS
- [ ] Requisições API funcionando (status 200)
- [ ] Login funciona

---

## 🎉 Pronto!

Quando tudo estiver funcionando:
- ✅ Frontend no Vercel: `https://nutri-buddy-ir2n-xxxxx.vercel.app`
- ✅ Backend no Railway: `https://web-production-c9eaf.up.railway.app`
- ✅ N8N: Configurado e funcionando
- ✅ Tudo conectado!

---

## 📚 Próximos Passos

1. Testar todas as funcionalidades do frontend
2. Configurar domínio customizado (opcional)
3. Configurar monitoramento (opcional)

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **N8N Cloud:** https://drpauloguimaraesjr.app.n8n.cloud

---

**Precisa de ajuda?** Verifique os logs no Vercel Dashboard ou me informe qual erro específico está ocorrendo!

