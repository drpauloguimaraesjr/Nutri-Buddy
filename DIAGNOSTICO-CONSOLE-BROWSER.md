# 🔍 Diagnóstico - Console do Navegador

## ✅ Status Atual

- ✅ Build concluído com sucesso
- ✅ Todas as variáveis do Firebase configuradas
- ❌ Botões não funcionam

O problema está em outro lugar. Vamos investigar!

---

## 🔍 PASSO 1: Verificar Console do Navegador

### 1.1 Abrir Console

1. Acesse: `https://nutri-buddy-ir2n.vercel.app`
2. Pressione **F12** (ou clique direito → Inspectar)
3. Vá na aba **Console**

### 1.2 Verificar Erros

**Procure por erros em VERMELHO:**

- ❌ Erros de JavaScript
- ❌ Erros de Firebase
- ❌ Erros de API
- ❌ Erros de autenticação

**📝 Copie e cole TODOS os erros que aparecerem aqui!**

### 1.3 Verificar Warnings

**Procure por warnings em AMARELO:**

- ⚠️ Warnings de Firebase
- ⚠️ Warnings de depreciação
- ⚠️ Warnings de API

---

## 🔍 PASSO 2: Verificar Network (Rede)

### 2.1 Abrir Network Tab

1. Na mesma janela (F12), vá na aba **Network**
2. Clique no botão **"Clear"** (limpar) se houver requisições antigas
3. Tente clicar em um botão que não funciona

### 2.2 Verificar Requisições

**O que deve acontecer:**
- Deve aparecer requisições para a API (`https://web-production-c9eaf.up.railway.app/api/...`)

**O que pode estar errado:**
- ❌ Nenhuma requisição aparece → Botão não está chamando a função
- ❌ Requisições aparecem com erro 401 → Problema de autenticação
- ❌ Requisições aparecem com erro 404 → Endpoint não existe
- ❌ Requisições aparecem com erro 500 → Erro no backend
- ❌ Requisições bloqueadas por CORS → Problema de CORS

**📝 Me diga:**
- Quantas requisições aparecem quando você clica?
- Qual o status delas? (200 = OK, 401 = auth, 404 = not found, etc.)
- Qual a URL das requisições?

---

## 🔍 PASSO 3: Verificar Firebase Inicialização

### 3.1 Verificar no Console

No console do navegador, digite:

```javascript
window
```

E pressione Enter. Depois digite:

```javascript
console.log('Firebase auth:', typeof window !== 'undefined' ? 'available' : 'not available')
```

### 3.2 Verificar se Firebase Inicializou

No console, digite:

```javascript
import('./lib/firebase').then(m => console.log('Firebase:', m.auth))
```

Ou verifique se há mensagens no console sobre Firebase inicializado.

---

## 🔍 PASSO 4: Verificar NEXT_PUBLIC_API_URL

### 4.1 Verificar Variável

No console do navegador, digite:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

**Ou** acesse qualquer página e no console digite:

```javascript
window.location.origin
```

### 4.2 Verificar se Está Configurada

1. No Vercel Dashboard
2. Vá em **Settings** → **Environment Variables**
3. Verifique se `NEXT_PUBLIC_API_URL` está configurada
4. Valor deve ser: `https://web-production-c9eaf.up.railway.app`

---

## 🔍 PASSO 5: Testar Botão Específico

### 5.1 Identificar Botão

Me diga:
- **Qual botão você está tentando clicar?**
  - Botão de login?
  - Botão de registrar refeição?
  - Botão de salvar?
  - Outro?

### 5.2 Verificar Event Listener

1. No console, digite:
```javascript
document.querySelector('button').addEventListener('click', () => console.log('Button clicked!'))
```

2. Tente clicar no botão
3. Veja se aparece "Button clicked!" no console

**Se aparecer:** O botão está recebendo o clique, mas a função não está executando.
**Se não aparecer:** O botão não está recebendo o clique.

---

## 🐛 Problemas Comuns e Soluções

### Problema: "NEXT_PUBLIC_API_URL is undefined"

**Causa:** Variável `NEXT_PUBLIC_API_URL` não configurada no Vercel.

**Solução:**
1. Vercel → Settings → Environment Variables
2. Adicione: `NEXT_PUBLIC_API_URL` = `https://web-production-c9eaf.up.railway.app`
3. Marque para Production, Preview, Development
4. Faça redeploy

### Problema: "Cannot read property 'currentUser' of null"

**Causa:** Firebase não inicializou ou `auth` é null.

**Solução:**
1. Verifique se todas as variáveis do Firebase estão corretas
2. Verifique se há erros de inicialização do Firebase no console
3. Tente recarregar a página

### Problema: "Network request failed" ou CORS error

**Causa:** Problema de CORS ou API não acessível.

**Solução:**
1. Verifique se `CORS_ORIGIN` no Railway tem a URL do Vercel
2. Teste a API diretamente: `curl https://web-production-c9eaf.up.railway.app/api/health`

### Problema: Botão não faz nada (sem erros no console)

**Causa:** Função do botão não está sendo chamada ou há erro silencioso.

**Solução:**
1. Verifique se há erros no console (mesmo que não apareçam em vermelho)
2. Verifique a aba Network - há requisições sendo feitas?
3. Verifique se há erros de JavaScript que estão sendo "engolidos"

### Problema: "401 Unauthorized" ou "403 Forbidden"

**Causa:** Problema de autenticação.

**Solução:**
1. Verifique se o usuário está logado
2. Verifique se o token do Firebase está sendo enviado
3. Verifique se o token está válido

---

## 📋 Checklist de Diagnóstico

**Me informe:**

1. ✅ **Console do navegador (F12):**
   - Quais erros aparecem em VERMELHO?
   - Quais warnings aparecem em AMARELO?
   - Copie e cole TODOS os erros aqui

2. ✅ **Network tab (F12 → Network):**
   - Quando você clica em um botão, aparecem requisições?
   - Qual o status das requisições? (200, 401, 404, 500?)
   - Qual a URL das requisições?

3. ✅ **Qual botão você está tentando clicar?**
   - Botão de login?
   - Botão de salvar?
   - Botão de registrar?
   - Outro?

4. ✅ **O que acontece quando você clica?**
   - Nada acontece?
   - Aparece algum erro na tela?
   - A página recarrega?
   - Alguma animação/loading aparece?

5. ✅ **Verificar NEXT_PUBLIC_API_URL:**
   - Está configurada no Vercel?
   - Qual o valor?

---

## 🎯 Próximos Passos

Com essas informações, consigo identificar exatamente o problema:

1. **Se não há erros no console:** Pode ser problema de JavaScript sendo "engolido" ou função não sendo chamada
2. **Se há erros 401/403:** Problema de autenticação
3. **Se há erros CORS:** Problema de configuração do CORS no Railway
4. **Se não há requisições:** O botão não está chamando a função correta
5. **Se há erros 404:** Endpoint não existe ou URL incorreta
6. **Se há erros 500:** Erro no backend

---

## 📞 Informações que Preciso Agora

**Por favor, me informe:**

1. **Screenshot ou copie os erros do Console (F12)**
2. **O que aparece na aba Network quando você clica em um botão**
3. **Qual botão específico você está tentando usar**
4. **Se `NEXT_PUBLIC_API_URL` está configurada no Vercel**

Com essas informações, consigo resolver rapidamente! 🚀

