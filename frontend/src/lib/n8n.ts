/**
 * 🤖 Integração com n8n para processamento de PDFs de dieta
 * 
 * Este arquivo contém funções para enviar PDFs para o n8n workflow
 * que processa e transcreve dietas com precisão usando GPT-4o Vision.
 */

// ⚠️ CONFIGURAÇÃO: Cole a URL do webhook do seu n8n aqui
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
  'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet';

export interface DietTranscriptionResult {
  success: boolean;
  message: string;
  patientId: string;
  status: string;
  model: string;
  transcribedAt: string;
  detalhes?: {
    totalCalorias: number;
    totalRefeicoes: number;
    totalAlimentos: number;
    objetivo: string;
  };
  resumo?: {
    totalCalorias: number;
    totalRefeicoes: number;
    totalAlimentos: number;
    objetivo: string;
  };
}

/**
 * Envia PDF para processamento no n8n
 * 
 * @param pdfUrl - URL do PDF no Firebase Storage (com token)
 * @param patientId - ID do paciente no Firestore
 * @returns Resultado da transcrição
 */
export async function processDietPDF(
  pdfUrl: string,
  patientId: string
): Promise<DietTranscriptionResult> {
  try {
    console.log('🤖 [n8n] Enviando PDF para processamento...');
    console.log('📄 [n8n] URL:', pdfUrl);
    console.log('👤 [n8n] Patient ID:', patientId);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfUrl,
        patientId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [n8n] Erro HTTP:', response.status, errorText);
      
      throw new Error(
        `Erro ao processar PDF no n8n: ${response.status} ${response.statusText}`
      );
    }

    const result: DietTranscriptionResult = await response.json();
    
    console.log('✅ [n8n] Processamento concluído com sucesso!');
    console.log('📊 [n8n] Resumo:', result.detalhes || result.resumo);

    return result;
  } catch (error) {
    console.error('❌ [n8n] Erro ao processar PDF:', error);
    throw error;
  }
}

/**
 * Verifica se a URL do webhook está configurada
 */
export function isN8nConfigured(): boolean {
  return !!N8N_WEBHOOK_URL && N8N_WEBHOOK_URL !== 'YOUR_N8N_WEBHOOK_URL_HERE';
}

/**
 * Retorna a URL do webhook configurada (para debug)
 */
export function getN8nWebhookUrl(): string {
  return N8N_WEBHOOK_URL;
}

