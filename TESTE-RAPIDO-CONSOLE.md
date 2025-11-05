# 🧪 Teste Rápido no Console - Diagnóstico Imediato

## 🚀 Teste Rápido (2 minutos)

Execute estes comandos no console do navegador (F12 → Console) e me diga o resultado:

### 1. Testar se Botões Existem

```javascript
const buttons = document.querySelectorAll('button');
console.log('Total de botões encontrados:', buttons.length);
buttons.forEach((btn, i) => {
  console.log(`Botão ${i}:`, btn.textContent?.trim(), btn);
});
```

**Me diga:** Quantos botões foram encontrados?

---

### 2. Testar Clique Manual

```javascript
// Encontrar botão "Adicionar Refeição"
const addMealBtn = Array.from(document.querySelectorAll('button')).find(
  btn => btn.textContent?.includes('Adicionar Refeição')
);

if (addMealBtn) {
  console.log('Botão encontrado!', addMealBtn);
  addMealBtn.click();
  console.log('Clique executado!');
} else {
  console.log('❌ Botão NÃO encontrado!');
}
```

**Me diga:** O botão foi encontrado? O que aconteceu?

---

### 3. Verificar Event Listeners

```javascript
const addMealBtn = Array.from(document.querySelectorAll('button')).find(
  btn => btn.textContent?.includes('Adicionar Refeição')
);

if (addMealBtn) {
  // Verificar listeners
  const listeners = getEventListeners(addMealBtn);
  console.log('Event Listeners:', listeners);
  
  // Tentar adicionar listener manualmente
  addMealBtn.addEventListener('click', () => {
    console.log('✅ Clique detectado manualmente!');
    alert('Botão funcionou!');
  });
  console.log('Listener manual adicionado!');
}
```

**Me diga:** O que aparece?

---

### 4. Verificar Erros JavaScript

```javascript
// Verificar se há erros não tratados
window.addEventListener('error', (e) => {
  console.error('❌ ERRO CAPTURADO:', e.error, e.message, e.filename, e.lineno);
});

// Verificar erros de Promise rejeitadas
window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ PROMISE REJEITADA:', e.reason);
});

console.log('✅ Listeners de erro instalados!');
```

Depois, tente clicar no botão e veja se aparece algo.

**Me diga:** Apareceu algum erro?

---

### 5. Verificar React

```javascript
// Verificar se React está carregado
console.log('React disponível:', typeof window.React !== 'undefined');
console.log('ReactDOM disponível:', typeof window.ReactDOM !== 'undefined');

// Tentar encontrar elementos React
const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
console.log('Elementos React encontrados:', reactElements.length);

// Verificar se há componentes renderizados
const root = document.getElementById('__next') || document.body;
console.log('Root element:', root);
```

**Me diga:** O que aparece?

---

### 6. Verificar Firebase/Auth

```javascript
// Verificar se Firebase está inicializado
import('./lib/firebase').then((m) => {
  console.log('Firebase auth:', m.auth);
  if (m.auth) {
    m.auth.onAuthStateChanged((user) => {
      console.log('Usuário:', user ? user.email : 'Não logado');
    });
  }
}).catch((err) => {
  console.error('❌ Erro ao carregar Firebase:', err);
});
```

**Me diga:** O que aparece?

---

### 7. Teste Completo - Simular Clique

```javascript
// Teste completo
console.log('=== TESTE COMPLETO ===');

// 1. Encontrar botão
const btn = Array.from(document.querySelectorAll('button')).find(
  b => b.textContent?.includes('Adicionar Refeição')
);

if (!btn) {
  console.log('❌ Botão não encontrado!');
} else {
  console.log('✅ Botão encontrado!', btn);
  
  // 2. Verificar se tem onClick
  console.log('onClick:', btn.onclick);
  console.log('getAttribute onclick:', btn.getAttribute('onclick'));
  
  // 3. Tentar clicar
  console.log('Tentando clicar...');
  btn.click();
  console.log('Clique executado!');
  
  // 4. Verificar se modal abriu
  setTimeout(() => {
    const modal = document.querySelector('[role="dialog"], .modal, [data-modal]');
    console.log('Modal encontrado?', modal ? 'SIM' : 'NÃO');
    if (modal) {
      console.log('✅ Modal está na tela!');
    } else {
      console.log('❌ Modal NÃO apareceu');
    }
  }, 500);
}
```

**Me diga:** O que aparece em cada passo?

---

## 📋 Resumo - Me Envie

Execute os comandos acima e me diga:

1. ✅ **Quantos botões foram encontrados?**
2. ✅ **O botão "Adicionar Refeição" foi encontrado?**
3. ✅ **Quando executa `btn.click()`, o que acontece?**
4. ✅ **Há event listeners registrados?**
5. ✅ **Apareceram erros?** (copie e cole)
6. ✅ **React está carregado?**
7. ✅ **Firebase está funcionando?**
8. ✅ **O modal aparece quando clica?**

---

## 🎯 Com Essas Informações

Com essas informações, consigo identificar **exatamente** onde está o problema:
- Se o botão não é encontrado → Problema de renderização
- Se não há listeners → Problema de React/componente
- Se há erros → Problema de JavaScript
- Se o modal não abre → Problema no componente modal

**Por favor, execute os testes e me envie os resultados!** 🚀

