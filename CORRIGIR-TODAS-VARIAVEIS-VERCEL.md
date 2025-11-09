# 🔧 CORRIGIR TODAS AS VARIÁVEIS NO VERCEL

## ❌ PROBLEMA IDENTIFICADO

**TODAS as variáveis estão com ASPAS DUPLAS no valor!**

Veja o que está aparecendo:
- `"AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0"` ❌ (com aspas)
- `"nutribuddy-2fc9c.firebaseapp.com"` ❌ (com aspas)

**O Firebase não aceita aspas!** Precisa ser:
- `AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0` ✅ (sem aspas)
- `nutribuddy-2fc9c.firebaseapp.com` ✅ (sem aspas)

---

## ✅ SOLUÇÃO - REMOVER ASPAS DE TODAS

### No Vercel Dashboard → Settings → Environment Variables

**Para CADA variável abaixo, edite e REMOVA as aspas do início e fim:**

| Variável | Valor ERRADO (com aspas) | Valor CORRETO (sem aspas) |
|----------|--------------------------|---------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `"AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0"` | `AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `"nutribuddy-2fc9c.firebaseapp.com"` | `nutribuddy-2fc9c.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `"nutribuddy-2fc9c"` | `nutribuddy-2fc9c` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `"nutribuddy-2fc9c.firebasestorage.app"` | `nutribuddy-2fc9c.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `"225946487395"` | `225946487395` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `"1:225946487395:web:d14ef325c8970061aa4656"` | `1:225946487395:web:d14ef325c8970061aa4656` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `"G-MB7VG6TFXN"` | `G-MB7VG6TFXN` |

---

## 📝 Passo a Passo

1. **No Vercel**, vá em **Settings** → **Environment Variables**
2. **Para cada variável** da lista acima:
   - Clique na variável
   - No campo **"Valor"**, REMOVA as aspas `"` do início e fim
   - Clique em **"Salvar"**
3. **Repita para TODAS as 7 variáveis**

---

## ⚠️ IMPORTANTE

- **NÃO** deixe aspas no início nem no fim
- **NÃO** adicione espaços extras
- O valor deve ser EXATAMENTE como está na tabela "Valor CORRETO"

---

## 🔄 Depois de Corrigir

1. **Aguarde o redeploy automático** (ou force um redeploy)
2. **Acesse novamente:** `https://nutri-buddy-ir2n.vercel.app/debug-firebase`
3. **Verifique** se agora aparece SEM aspas
4. **Teste o login** novamente

---

**Remova as aspas de TODAS as 7 variáveis e teste novamente!** 🚀



