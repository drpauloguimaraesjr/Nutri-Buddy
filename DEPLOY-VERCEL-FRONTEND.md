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
https://nutri-buddy.vercel.app
```

### Testar:
1. Abra a URL no navegador
2. Verifique se carrega corretamente
3. Teste login/registro
4. Teste chamadas à API

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
- Configure CORS no Railway para aceitar `*.vercel.app`
- Ou adicione seu domínio específico

---

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] Root Directory: `frontend`
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy iniciado
- [ ] URL funcionando
- [ ] Testes realizados

---

## 🎉 Pronto!

Seu frontend está online no Vercel! 🚀

---

**Dúvidas?** Veja a documentação: https://vercel.com/docs

