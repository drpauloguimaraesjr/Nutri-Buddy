# 📱 Organizar Sistema de Mensagens - NutriBuddy

## 🐛 Problema Identificado

**Situação atual:**
- O prescritor NÃO consegue encontrar o paciente para enviar mensagem
- O sistema espera que o PACIENTE inicie a conversa
- Falta um fluxo claro: Prescritor → Iniciar conversa → Paciente

**Screenshots mostram:**
1. Paciente vê: "Nenhum nutricionista atribuído"
2. Prescritor vê: "Failed to fetch" (lista vazia mesmo se corrigido)

---

## ✅ SOLUÇÃO: 3 Fluxos de Conversa

### **Fluxo 1: Prescritor Inicia Conversa** 🎯 PRECISA IMPLEMENTAR

**Como deve funcionar:**

```
Prescritor → Lista de Pacientes → Clica no paciente → Botão "💬 Enviar Mensagem"
                                                            ↓
                                            Abre chat diretamente OU
                                            Vai para Central de Atendimento
                                            com conversa criada
```

**Backend já suporta isso!**
- ✅ POST `/api/messages/conversations` (linha 239 de messages.js)
- ✅ Aceita `prescriberId` e `initialMessage`
- ✅ Cria conversa automaticamente

**Frontend precisa:**
- ⚠️ Botão "Enviar Mensagem" na página do paciente
- ⚠️ Lógica para criar conversa se não existir
- ⚠️ Redirecionar para `/dashboard/chat` com conversa selecionada

---

### **Fluxo 2: Paciente Inicia Conversa** ✅ JÁ IMPLEMENTADO

**Como funciona:**

```
Paciente → /chat → Sistema busca prescritor → Cria conversa automática
```

**Já está no código:**
- ✅ `frontend/src/app/(patient)/chat/page.tsx` (linha 19-66)
- ✅ Busca `prescriberId` do paciente
- ✅ Cria conversa se não existir
- ✅ Abre chat automaticamente

**Problema:**
- Paciente precisa ter `prescriberId` atribuído
- Se não tiver, mostra: "Nenhum nutricionista atribuído"

---

### **Fluxo 3: Continuar Conversa Existente** ✅ JÁ IMPLEMENTADO

**Como funciona:**

```
Prescritor → Central de Atendimento → Lista de conversas → Seleciona → Chat abre
Paciente → /chat → Conversa existente carrega → Chat abre
```

**Já está funcionando:**
- ✅ Lista de conversas no Kanban
- ✅ Seleção de conversa
- ✅ Histórico de mensagens
- ✅ Envio de mensagens

**Problema atual:**
- ⚠️ "Failed to fetch" impede de ver lista (variável Vercel)

---

## 🔧 IMPLEMENTAÇÃO: Adicionar Botão "Enviar Mensagem"

### Passo 1: Adicionar Botão na Página do Paciente

**Arquivo:** `frontend/src/app/(dashboard)/patients/[patientId]/page.tsx`

**Adicionar após a linha onde tem "Ativação" (aba):**

```typescript
// Importar no topo do arquivo
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Adicionar dentro do componente
const router = useRouter();
const [isCreatingConversation, setIsCreatingConversation] = useState(false);

// Função para criar conversa
const handleStartConversation = async () => {
  if (!firebaseUser || !patientId) return;
  
  try {
    setIsCreatingConversation(true);
    const token = await firebaseUser.getIdToken();
    const apiBaseUrl = getApiBaseUrl();
    
    // Verificar se já existe conversa
    const existingResponse = await fetch(
      `${apiBaseUrl}/api/messages/conversations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (existingResponse.ok) {
      const data = await existingResponse.json();
      const existingConversation = data.conversations.find(
        (conv: any) => conv.patientId === patientId
      );
      
      if (existingConversation) {
        // Redirecionar para conversa existente
        router.push(`/dashboard/chat?conversationId=${existingConversation.id}`);
        return;
      }
    }
    
    // Criar nova conversa
    const response = await fetch(
      `${apiBaseUrl}/api/messages/conversations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patientId,
          initialMessage: 'Olá! Estou aqui para te ajudar.',
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Erro ao criar conversa');
    }
    
    const data = await response.json();
    
    // Redirecionar para nova conversa
    router.push(`/dashboard/chat?conversationId=${data.conversation.id}`);
  } catch (error) {
    console.error('Erro ao iniciar conversa:', error);
    setFeedback({
      type: 'error',
      message: 'Erro ao iniciar conversa. Tente novamente.',
    });
  } finally {
    setIsCreatingConversation(false);
  }
};

// Adicionar botão no JSX (próximo aos outros botões de ação)
<Button
  onClick={handleStartConversation}
  disabled={isCreatingConversation}
  className="flex items-center gap-2"
>
  {isCreatingConversation ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Abrindo...
    </>
  ) : (
    <>
      <MessageSquare className="w-4 h-4" />
      💬 Enviar Mensagem
    </>
  )}
</Button>
```

---

### Passo 2: Atualizar Central de Atendimento

**Arquivo:** `frontend/src/app/(dashboard)/dashboard/chat/page.tsx`

**Adicionar suporte para conversationId na URL:**

```typescript
import { useSearchParams } from 'next/navigation';

// Dentro do componente
const searchParams = useSearchParams();
const conversationIdFromUrl = searchParams.get('conversationId');

// No useEffect inicial, priorizar conversationId da URL
useEffect(() => {
  // ... código existente ...
  
  if (conversationIdFromUrl && !selectedConversationId) {
    setSelectedConversationId(conversationIdFromUrl);
  }
}, [conversationIdFromUrl]);
```

---

### Passo 3: Atribuir Prescritor ao Paciente

**Para que o fluxo do paciente funcione, precisa:**

**Opção A: Manual (no cadastro)**
- Ao criar paciente, selecionar prescritor
- Salvar `prescriberId` no Firestore

**Opção B: Automático**
- Quando prescritor cria conversa, atualizar paciente com `prescriberId`

**Código para Opção B (adicionar em `handleStartConversation`):**

```typescript
// Após criar conversa com sucesso
await updateDoc(doc(db, 'users', patientId), {
  prescriberId: firebaseUser.uid,
  updatedAt: serverTimestamp(),
});
```

---

## 📊 FLUXO COMPLETO (Depois das Mudanças)

### 🔵 **Prescritor Quer Falar com Paciente:**

```
1. Dashboard → Pacientes
2. Clica no paciente
3. Botão "💬 Enviar Mensagem"
4. Sistema:
   - Verifica se conversa existe
   - Se não, cria nova conversa
   - Atualiza paciente com prescriberId
   - Redireciona para Central de Atendimento
5. Chat abre pronto para usar
```

### 🟢 **Paciente Quer Falar com Prescritor:**

```
1. App do paciente → Menu "Conversa"
2. Sistema busca prescriberId
3. Se existe:
   - Busca conversa existente OU cria nova
   - Abre chat
4. Se não existe:
   - Mostra "Entre em contato com suporte"
```

### 🟡 **Prescritor Quer Ver Todas Conversas:**

```
1. Dashboard → Conversas (Central de Atendimento)
2. Lista todas as conversas
3. Seleciona conversa
4. Chat abre
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Urgente (Para funcionar hoje):
- [ ] Corrigir `NEXT_PUBLIC_API_BASE_URL` no Vercel
- [ ] Adicionar botão "Enviar Mensagem" na página do paciente
- [ ] Implementar lógica `handleStartConversation`
- [ ] Atualizar prescritor no paciente ao criar conversa
- [ ] Suportar `?conversationId=` na URL do chat

### Bônus (Melhorias):
- [ ] Indicador visual se conversa já existe
- [ ] Badge "Nova conversa" vs "Continuar conversa"
- [ ] Atalho rápido: paciente → nome → ícone chat → abrir direto
- [ ] Notificação: "Prescritor iniciou conversa com você"

---

## 🧪 TESTE DO FLUXO

**Cenário 1: Prescritor inicia**
```
✅ Prescritor abre paciente "Paulo Coelho"
✅ Clica em "Enviar Mensagem"
✅ Chat abre
✅ Envia "Olá Paulo, como está?"
✅ Paulo vê mensagem no app dele
```

**Cenário 2: Paciente responde**
```
✅ Paulo abre app
✅ Vai em "Conversa"
✅ Vê mensagem do prescritor
✅ Responde "Oi! Tudo bem!"
✅ Prescritor vê resposta na Central de Atendimento
```

---

## 📝 CÓDIGO PRONTO (COPIAR E COLAR)

Vou criar arquivo separado com código completo pronto para usar.

Ver: `CODIGO-BOTAO-ENVIAR-MENSAGEM.md`

---

**Criado em:** 15/11/2024  
**Problema:** Prescritor não consegue iniciar conversa com paciente  
**Solução:** Adicionar botão "Enviar Mensagem" + lógica de criação  
**Tempo estimado:** 30-45 minutos

