# 🍎 Diagnóstico - Instruções para Mac

## ⌨️ Atalhos do Mac

### Abrir Developer Tools
- **Cmd + Option + I** (ou clique direito → Inspectar)
- Ou **Cmd + Option + J** (abre direto no Console)

### Limpar Console
- **Cmd + K** (limpa o console)
- Ou clique no ícone de lixeira

### Hard Refresh (Limpar Cache)
- **Cmd + Shift + R** (hard refresh)
- Ou **Cmd + Option + R** (limpa cache e recarrega)

### Limpar Cache do Navegador
- **Cmd + Shift + Delete** (abre diálogo de limpar dados)
- Ou Safari: **Cmd + Option + E** (limpa cache)

---

## 🔍 PASSO 1: Limpar e Verificar Erros (Mac)

### 1.1 Abrir Console

1. Abra: `https://nutri-buddy-ir2n.vercel.app`
2. Pressione **Cmd + Option + J** (abre direto no Console)
3. Ou **Cmd + Option + I** → aba **Console**

### 1.2 Limpar Console

1. Pressione **Cmd + K** (limpa o console)
2. Ou clique no ícone de **lixeira** no console

### 1.3 Recarregar Página

1. Pressione **Cmd + R** (recarregar normal)
2. Ou **Cmd + Shift + R** (hard refresh - limpa cache)
3. **Aguarde a página carregar completamente**

### 1.4 Filtrar Apenas Erros

No Console, clique no filtro e selecione apenas **"Erros"** (Errors)

---

## 🔍 PASSO 2: Capturar Erros

### 2.1 Ver Erros

Após limpar e recarregar, você verá os erros aparecerem.

### 2.2 Copiar Erros

1. **Clique com botão direito** no erro
2. Selecione **"Copy"** (Copiar)
3. Ou selecione o texto e pressione **Cmd + C**

### 2.3 Me Enviar

**Copie e cole aqui os PRIMEIROS 5-10 erros** que aparecerem, incluindo:
- ✅ A mensagem de erro completa
- ✅ O arquivo onde ocorreu
- ✅ O número da linha

---

## 🧪 PASSO 3: Teste Rápido (Mac)

### 3.1 Abrir Console

Pressione **Cmd + Option + J**

### 3.2 Executar Teste

Cole este código no console e pressione **Enter**:

```javascript
// TESTE COMPLETO - Mac
console.log('=== DIAGNÓSTICO INICIADO ===');

// 1. Verificar botões
const buttons = document.querySelectorAll('button');
console.log('1. Total de botões:', buttons.length);

// 2. Encontrar botão "Adicionar Refeição"
const addMealBtn = Array.from(buttons).find(
  btn => btn.textContent?.includes('Adicionar Refeição')
);
console.log('2. Botão encontrado?', addMealBtn ? 'SIM ✅' : 'NÃO ❌');

// 3. Verificar erros
window.addEventListener('error', (e) => {
  console.error('❌ ERRO:', e.message, e.filename, e.lineno);
});

// 4. Tentar clicar
if (addMealBtn) {
  console.log('3. Tentando clicar...');
  addMealBtn.click();
  console.log('4. Clique executado!');
  
  // Verificar modal após 1 segundo
  setTimeout(() => {
    const modal = document.querySelector('[role="dialog"], .modal');
    console.log('5. Modal apareceu?', modal ? 'SIM ✅' : 'NÃO ❌');
  }, 1000);
} else {
  console.log('❌ Botão não encontrado!');
}

console.log('=== FIM DO TESTE ===');
```

### 3.3 Me Enviar Resultados

**Me diga:**
1. Quantos botões foram encontrados?
2. O botão "Adicionar Refeição" foi encontrado?
3. O modal apareceu?
4. Apareceram erros? (copie e cole)

---

## 🔍 PASSO 4: Verificar Network (Mac)

### 4.1 Abrir Network Tab

1. **Cmd + Option + I** (abre DevTools)
2. Vá na aba **Network** (Rede)

### 4.2 Limpar e Testar

1. Clique no botão **Clear** (limpar)
2. Clique no botão **"Adicionar Refeição"** na página
3. Veja o que aparece na lista

### 4.3 Me Enviar

**Me diga:**
- Aparece alguma requisição quando você clica?
- Se sim, qual a URL? Qual o status? (200, 401, 404, 500?)

---

## 📋 Informações que Preciso (Mac)

**Por favor, me envie:**

1. ✅ **Limpe o console** (Cmd + K)
2. ✅ **Recarregue a página** (Cmd + Shift + R)
3. ✅ **Aguarde carregar completamente**
4. ✅ **Copie e cole os PRIMEIROS 5-10 erros** que aparecem
5. ✅ **Execute o teste do PASSO 3** e me diga os resultados
6. ✅ **Teste a Network do PASSO 4** e me diga o que aparece

---

## 🎯 Atalhos Úteis Mac

- **Cmd + Option + I** → Abre DevTools
- **Cmd + Option + J** → Abre Console direto
- **Cmd + K** → Limpa console
- **Cmd + Shift + R** → Hard refresh (limpa cache)
- **Cmd + Shift + Delete** → Limpar dados do navegador
- **Cmd + C** → Copiar
- **Cmd + V** → Colar
- **Cmd + R** → Recarregar página

---

## 🚀 Próximos Passos

1. **Abra o Console** (Cmd + Option + J)
2. **Limpe** (Cmd + K)
3. **Recarregue** (Cmd + Shift + R)
4. **Copie os erros** e me envie
5. **Execute o teste** e me envie os resultados

Com essas informações, consigo corrigir os problemas! 🎉

