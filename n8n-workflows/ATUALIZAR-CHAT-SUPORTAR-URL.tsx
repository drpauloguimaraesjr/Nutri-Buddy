// ===================================================
// 📱 ATUALIZAÇÃO: Suportar ?conversationId na URL
// ===================================================
//
// Local: frontend/src/app/(dashboard)/dashboard/chat/page.tsx
//
// OBJETIVO: Permitir que ao clicar em "Enviar Mensagem" na página
// do paciente, o chat abra diretamente naquela conversa.

// ===================================================
// PASSO 1: ADICIONAR IMPORT
// ===================================================

// No topo do arquivo, adicione junto com os outros imports:
import { useSearchParams } from 'next/navigation';


// ===================================================
// PASSO 2: ADICIONAR NO COMPONENTE
// ===================================================

// Logo após a declaração do componente, adicione:
const searchParams = useSearchParams();
const conversationIdFromUrl = searchParams?.get('conversationId');


// ===================================================
// PASSO 3: ATUALIZAR useEffect
// ===================================================

// Procure o useEffect que tem fetchConversations
// (por volta da linha 86-90)

// SUBSTITUA este trecho:
/*
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);
*/

// POR ESTE:
useEffect(() => {
  fetchConversations();
  const interval = setInterval(fetchConversations, 10000);
  return () => clearInterval(interval);
}, [fetchConversations]);

// E ADICIONE ESTE NOVO useEffect logo APÓS:
useEffect(() => {
  // Se tem conversationId na URL e ainda não selecionou conversa
  if (conversationIdFromUrl && !selectedConversationId) {
    console.log('🔗 Selecionando conversa da URL:', conversationIdFromUrl);
    setSelectedConversationId(conversationIdFromUrl);
  }
}, [conversationIdFromUrl, selectedConversationId]);


// ===================================================
// CÓDIGO COMPLETO (REFERÊNCIA)
// ===================================================

/*
export default function PrescriberChatPage() {
  const { firebaseUser } = useAuth();
  const searchParams = useSearchParams(); // ← NOVO
  const conversationIdFromUrl = searchParams?.get('conversationId'); // ← NOVO
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  // ... resto dos estados ...

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const fetchConversations = useCallback(async () => {
    // ... código existente ...
  }, [apiBaseUrl, firebaseUser, selectedConversationId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // ← ADICIONAR ESTE useEffect NOVO
  useEffect(() => {
    if (conversationIdFromUrl && !selectedConversationId) {
      console.log('🔗 Selecionando conversa da URL:', conversationIdFromUrl);
      setSelectedConversationId(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, selectedConversationId]);

  // ... resto do código ...

  return (
    // ... JSX ...
  );
}
*/


// ===================================================
// TESTE
// ===================================================

/*
1. Abra a página de um paciente
2. Clique em "Enviar Mensagem"
3. Deve redirecionar para:
   /dashboard/chat?conversationId=ABC123
4. Chat deve abrir com a conversa já selecionada
5. Histórico de mensagens deve carregar automaticamente
*/


// ===================================================
// FLUXO COMPLETO
// ===================================================

/*
Usuário:
  Página do paciente → Botão "Enviar Mensagem"
                              ↓
  Sistema verifica se conversa existe
                              ↓
                    SIM ↙         ↘ NÃO
                                  ↓
              Pega ID          Cria nova conversa
                 ↓                    ↓
              Redireciona: /dashboard/chat?conversationId=XYZ
                              ↓
              Chat carrega e seleciona conversa automaticamente
                              ↓
              ✅ Pronto para enviar mensagens!
*/


// ===================================================
// IMPORTANTE
// ===================================================

/*
⚠️ Esta mudança SÓ funciona se NEXT_PUBLIC_API_BASE_URL estiver
   configurado no Vercel!
   
   Sem a variável configurada, vai dar "Failed to fetch"
   
   Ver: CORRIGIR-ERRO-FAILED-TO-FETCH.md
*/

