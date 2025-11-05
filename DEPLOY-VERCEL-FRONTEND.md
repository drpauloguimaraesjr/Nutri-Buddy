# 🚀 Deploy Frontend no Vercel - Guia Completo

## ✅ Pré-requisitos

1. ✅ Código no GitHub: `https://github.com/drpauloguimaraesjr/Nutri-Buddy`
2. ✅ Conta no Vercel (gratuita): https://vercel.com

---

## 📋 Passo a Passo

### 1️⃣ Acessar Vercel

1. Acesse: **https://vercel.com**
2. Faça login com **GitHub**
3. Clique em **"Add New Project"**

---

### 2️⃣ Importar Repositório

1. Procure por: **`Nutri-Buddy`**
2. Clique em **"Import"**

---

### 3️⃣ Configurar Projeto

#### **Root Directory:**
```
frontend
```

#### **Framework Preset:**
- Next.js (deve detectar automaticamente)

#### **Build Command:**
```
npm run build
```

#### **Output Directory:**
```
.next
```

#### **Install Command:**
```
npm install
```

---

### 4️⃣ Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://web-production-c9eaf.up.railway.app` |

**⚠️ IMPORTANTE:** 
- Variáveis `NEXT_PUBLIC_*` são expostas no cliente
- Use apenas para valores públicos seguros

---

### 5️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Vercel vai:
   - ✅ Instalar dependências
   - ✅ Build do projeto
   - ✅ Deploy automático
   - ✅ Gerar URL: `https://nutri-buddy.vercel.app`

---

## 🔗 Após o Deploy

### URL do Frontend:
```
https://nutri-buddy-xxxxx.vercel.app
```
*(Anote esta URL exata! Você precisará dela no próximo passo)*

### ⚠️ IMPORTANTE: Configurar CORS no Railway

Após o deploy do Vercel, você **DEVE** atualizar o `CORS_ORIGIN` no Railway:

1. Acesse: **https://railway.app**
2. Entre no projeto **NutriBuddy**
3. Vá em **Variables**
4. Encontre `CORS_ORIGIN`
5. **Edite** para incluir a URL do Vercel:
   ```
   https://nutri-buddy-xxxxx.vercel.app
   ```
   *(Use a URL exata que você anotou acima)*
6. Clique em **Save**
7. Aguarde o redeploy do Railway (2-3 minutos)

### Testar:
1. Abra a URL do Vercel no navegador
2. Verifique se carrega corretamente
3. Abra o Console do Navegador (F12) → Network
4. Tente fazer login/registro
5. Verifique se não há erros CORS
6. Verifique se as requisições vão para `https://web-production-c9eaf.up.railway.app`

---

## 🔄 Atualizações Automáticas

O Vercel faz **deploy automático** sempre que você faz push no GitHub!

1. Faça alterações no código
2. `git push` para o GitHub
3. Vercel detecta automaticamente
4. Faz novo deploy em ~2 minutos

---

## 📝 Configurações Adicionais

### Domínio Customizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Preview Deployments

Cada Pull Request gera um preview deployment único!

---

## 🐛 Troubleshooting

### Erro: "Build Failed"
- Verifique se todas as dependências estão no `package.json`
- Veja logs do build no Vercel Dashboard

### Erro: "API URL not found"
- Verifique se `NEXT_PUBLIC_API_URL` está configurada
- Verifique se a URL do Railway está correta

### CORS Error
- ⚠️ **MAIS COMUM:** `CORS_ORIGIN` no Railway não está configurado
- Verifique se `CORS_ORIGIN` no Railway tem a URL **exata** do Vercel
- Aguarde o redeploy do Railway após atualizar
- Limpe o cache do navegador (Ctrl+Shift+R)
- Teste: `curl -H "Origin: https://sua-url.vercel.app" https://web-production-c9eaf.up.railway.app/api/health`

---

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] Root Directory: `frontend`
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy iniciado
- [ ] URL do frontend anotada
- [ ] **`CORS_ORIGIN` atualizado no Railway com a URL do Vercel**
- [ ] Redeploy do Railway concluído
- [ ] Frontend carrega sem erros
- [ ] API conecta corretamente (sem erros CORS)
- [ ] Login funciona
- [ ] Testes realizados

---

## 🎉 Pronto!

Seu frontend está online no Vercel! 🚀

---

**Dúvidas?** Veja a documentação: https://vercel.com/docs

---

## 📚 Guias Relacionados

- `DEPLOY-FRONTEND-VERCEL-COMPLETO.md` - Guia detalhado completo
- `DEPLOY-RAPIDO-3-PASSOS.md` - Guia rápido
- `GUIA-COMPLETO-N8N-CLOUD.md` - Configuração N8N

