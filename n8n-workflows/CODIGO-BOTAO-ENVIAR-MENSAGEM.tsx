// ===================================================
// 📱 CÓDIGO PARA ADICIONAR BOTÃO "ENVIAR MENSAGEM"
// ===================================================
//
// Local: frontend/src/app/(dashboard)/patients/[patientId]/page.tsx
//
// INSTRUÇÕES:
// 1. Adicionar imports no TOPO do arquivo
// 2. Adicionar estados e função dentro do componente
// 3. Adicionar botão no JSX (próximo aos outros botões)

// ===================================================
// PASSO 1: ADICIONAR IMPORTS (no topo do arquivo)
// ===================================================

// Adicione estas linhas junto com os outros imports:
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';


// ===================================================
// PASSO 2: ADICIONAR DENTRO DO COMPONENTE
// ===================================================

// Adicione logo após as outras declarações de useState (por volta da linha 75):

const router = useRouter();
const [isCreatingConversation, setIsCreatingConversation] = useState(false);

// Adicione esta função logo após as outras funções (antes do return):

const handleStartConversation = async () => {
  if (!firebaseUser || !patientId) {
    setFeedback({
      type: 'error',
      message: 'Erro: usuário ou paciente não identificado.',
    });
    return;
  }
  
  try {
    setIsCreatingConversation(true);
    const token = await firebaseUser.getIdToken();
    const apiBaseUrl = getApiBaseUrl();
    
    console.log('🔍 Verificando conversa existente...');
    
    // Verificar se já existe conversa com este paciente
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
        console.log('✅ Conversa existente encontrada:', existingConversation.id);
        // Redirecionar para conversa existente
        router.push(`/dashboard/chat?conversationId=${existingConversation.id}`);
        return;
      }
    }
    
    console.log('📝 Criando nova conversa...');
    
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
          initialMessage: `Olá! Estou aqui para te ajudar com seu acompanhamento.`,
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar conversa');
    }
    
    const data = await response.json();
    console.log('✅ Conversa criada:', data.conversation.id);
    
    // Atribuir prescritor ao paciente (se ainda não tiver)
    if (!patient?.prescriberId) {
      console.log('📌 Atribuindo prescritor ao paciente...');
      await updateDoc(doc(db, 'users', patientId), {
        prescriberId: firebaseUser.uid,
        updatedAt: serverTimestamp(),
      });
    }
    
    // Mostrar sucesso
    setFeedback({
      type: 'success',
      message: 'Conversa iniciada! Redirecionando...',
    });
    
    // Aguardar 1 segundo e redirecionar
    setTimeout(() => {
      router.push(`/dashboard/chat?conversationId=${data.conversation.id}`);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar conversa:', error);
    setFeedback({
      type: 'error',
      message: error instanceof Error ? error.message : 'Erro ao iniciar conversa. Tente novamente.',
    });
  } finally {
    setIsCreatingConversation(false);
  }
};


// ===================================================
// PASSO 3: ADICIONAR BOTÃO NO JSX
// ===================================================

// Procure no código onde tem os botões de "Enviar credenciais" 
// (por volta da linha 550-600)
// Adicione este botão ANTES ou DEPOIS desses botões:

{/* Botão para iniciar conversa */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  <Button
    onClick={handleStartConversation}
    disabled={isCreatingConversation || !patient}
    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
  >
    {isCreatingConversation ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Abrindo conversa...
      </>
    ) : (
      <>
        <MessageSquare className="mr-2 h-4 w-4" />
        💬 Enviar Mensagem
      </>
    )}
  </Button>
</motion.div>


// ===================================================
// LOCALIZAÇÃO EXATA NO CÓDIGO
// ===================================================

// Procure por este trecho (linha ~550-600):
/*
  <div className="flex gap-3">
    <Button
      onClick={() => handleSendCredentials(patient, 'email')}
      disabled={isSendingCredentials}
      variant="outline"
      className="flex-1"
    >
      <Mail className="mr-2 h-4 w-4" />
      Enviar por Email
    </Button>
    
    <Button
      onClick={() => handleSendCredentials(patient, 'whatsapp')}
      disabled={isSendingCredentials}
      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      Enviar por WhatsApp
    </Button>
  </div>
*/

// E adicione O BOTÃO NOVO logo APÓS essa div:
// (veja o código acima em "PASSO 3")


// ===================================================
// RESULTADO ESPERADO
// ===================================================

/*
Quando o prescritor:
1. Abre a página do paciente
2. Vê o botão "💬 Enviar Mensagem"
3. Clica no botão:
   - Sistema verifica se já existe conversa
   - Se SIM: redireciona para conversa existente
   - Se NÃO: cria nova conversa
   - Atribui prescritor ao paciente
   - Redireciona para /dashboard/chat com conversa selecionada
4. Chat abre pronto para uso!
*/


// ===================================================
// TESTE
// ===================================================

/*
Cenário 1: Primeira vez
✅ Prescritor clica em "Enviar Mensagem"
✅ Sistema cria nova conversa
✅ Redireciona para chat
✅ Chat abre vazio (pronto para primeira mensagem)

Cenário 2: Conversa já existe
✅ Prescritor clica em "Enviar Mensagem"
✅ Sistema encontra conversa existente
✅ Redireciona para chat
✅ Chat abre com histórico de mensagens
*/


// ===================================================
// DICAS
// ===================================================

/*
1. Teste localmente primeiro (npm run dev)
2. Verifique console do navegador (F12) para logs
3. Certifique-se que NEXT_PUBLIC_API_BASE_URL está configurado
4. Teste com um paciente real
5. Verifique se conversa aparece em /dashboard/chat
*/

