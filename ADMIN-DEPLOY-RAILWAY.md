# 🚀 Deploy Admin - Railway/Vercel

## ✅ Status Atual

A funcionalidade admin **já está implementada** no código:
- ✅ Endpoints de API admin criados
- ✅ Página admin no frontend criada
- ✅ Middleware de proteção implementado
- ✅ Script para ativar admin criado

## 🔄 O que precisa ser feito

### 1. Commit e Push para GitHub (SE AINDA NÃO FEZ)

As mudanças precisam estar no GitHub para que o Railway e Vercel façam deploy automático:

```bash
git add .
git commit -m "feat: adicionar painel admin com proteção de acesso"
git push origin main
```

**Ou se preferir fazer commit seletivo:**

```bash
git add routes/api.js middleware/auth.js frontend/app/admin frontend/lib/api.ts frontend/context/AuthContext.tsx frontend/types/index.ts
git commit -m "feat: adicionar painel admin"
git push origin main
```

### 2. Railway vai fazer deploy automático

O Railway detecta automaticamente quando você faz push no GitHub e:
- ✅ Faz rebuild do servidor
- ✅ Aplica as novas rotas admin
- ✅ Tudo funciona automaticamente!

**Nenhuma configuração adicional necessária no Railway!**

### 3. Vercel vai fazer deploy automático

O Vercel também detecta automaticamente e:
- ✅ Faz build do frontend
- ✅ Aplica a nova página `/admin`
- ✅ Tudo funciona automaticamente!

**Nenhuma configuração adicional necessária no Vercel!**

### 4. Ativar seu acesso admin

Depois que o deploy terminar, você precisa ativar seu acesso admin:

#### Opção A: Script local (Recomendado)

```bash
# No seu computador, na pasta do projeto
node set-admin.js seu-email@exemplo.com
```

**Importante:** O script precisa rodar localmente porque precisa das credenciais do Firebase Admin SDK que estão no `.env`.

#### Opção B: Firebase Console

1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore
2. Vá na coleção `users`
3. Encontre seu usuário (pelo email ou UID)
4. Edite o campo `role` e coloque `admin`
5. Salve
6. Vá em **Authentication** → **Users**
7. Encontre seu usuário
8. Clique nos três pontos → **Edit**
9. Em **Custom claims**, adicione: `{"role": "admin"}`
10. Salve

### 5. Fazer logout e login

Depois de ativar o admin:
1. Faça logout do sistema
2. Faça login novamente
3. Acesse: `nutri-buddy-ir2n.vercel.app/admin`

---

## ✅ Checklist de Deploy

### Código:
- [x] Endpoints admin criados em `routes/api.js`
- [x] Página admin criada em `frontend/app/admin/page.tsx`
- [x] Middleware `requireAdmin` criado
- [x] Tipos atualizados
- [ ] Código commitado e enviado ao GitHub

### Deploy:
- [ ] Railway detectou o push e fez deploy
- [ ] Vercel detectou o push e fez deploy
- [ ] Backend respondendo (teste: `https://seu-backend.railway.app/api/health`)
- [ ] Frontend online (teste: `https://nutri-buddy-ir2n.vercel.app`)

### Configuração:
- [ ] Acesso admin ativado (via script ou Firebase Console)
- [ ] Logout e login feito
- [ ] Página `/admin` acessível

---

## 🧪 Como Testar

### 1. Testar Backend (Railway)

```bash
# Teste se o backend está online
curl https://seu-backend.railway.app/api/health

# Deve retornar:
# {"status":"ok","timestamp":"...","service":"NutriBuddy API"}
```

### 2. Testar Frontend (Vercel)

1. Acesse: `https://nutri-buddy-ir2n.vercel.app`
2. Verifique se a página carrega
3. Faça login (se já tem conta) ou crie uma conta

### 3. Testar Admin (Depois de ativar)

1. Acesse: `https://nutri-buddy-ir2n.vercel.app/admin`
2. Se você não é admin, verá mensagem de "Acesso Negado"
3. Se você é admin, verá o painel administrativo

---

## 🔍 Verificar se está funcionando

### No Railway:
1. Acesse o dashboard do Railway
2. Vá em **Deployments**
3. Verifique se há um deploy recente (depois do seu push)
4. Verifique os logs para ver se não há erros

### No Vercel:
1. Acesse o dashboard do Vercel
2. Vá no projeto
3. Verifique se há um deploy recente
4. Verifique os logs do build

### No Navegador:
1. Abra o console (F12)
2. Acesse `/admin`
3. Verifique se há erros no console
4. Se não for admin, deve aparecer mensagem de erro
5. Se for admin, deve carregar o painel

---

## 🆘 Problemas Comuns

### ❌ "Acesso Negado" mesmo sendo admin

**Causa:** Token não foi atualizado após mudar a role

**Solução:**
1. Faça logout
2. Feche completamente o navegador
3. Abra novamente
4. Faça login
5. Acesse `/admin`

### ❌ Backend retorna 403 ao acessar `/api/admin/*`

**Causa:** Role não está configurada corretamente

**Solução:**
1. Verifique no Firestore se o campo `role` está como `admin`
2. Verifique no Firebase Auth se as Custom Claims têm `{"role": "admin"}`
3. Faça logout e login novamente

### ❌ Página admin não carrega

**Causa:** Deploy ainda não terminou ou erro no build

**Solução:**
1. Verifique os logs do Vercel
2. Aguarde alguns minutos (deploy pode estar em andamento)
3. Tente fazer um novo deploy manualmente no Vercel

---

## 📝 Resumo Rápido

1. **Commit e push** para GitHub (se ainda não fez)
2. **Aguardar** Railway e Vercel fazerem deploy automático (~2-5 minutos)
3. **Ativar admin** usando `node set-admin.js seu-email@exemplo.com`
4. **Fazer logout e login**
5. **Acessar** `/admin` no Vercel

**Pronto! Tudo deve funcionar automaticamente após o push!** 🚀

