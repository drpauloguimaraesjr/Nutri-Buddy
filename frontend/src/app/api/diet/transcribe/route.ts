import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Tipos para validação
interface Refeicao {
  horario: string;
  nome: string;
  alimentos: Array<{
    descricao: string;
    quantidade: string;
    calorias?: number;
    proteinas?: number;
    carboidratos?: number;
    gorduras?: number;
    fibras?: number;
  }>;
  totais?: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras: number;
  };
}

interface DietDataResponse {
  textoFormatado: string;
  totais: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras: number;
  };
  refeicoes: Refeicao[];
}

// Função para validar resposta do Gemini
function validateDietData(data: unknown): data is DietDataResponse {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.textoFormatado === 'string' &&
    obj.totais !== undefined &&
    typeof obj.totais === 'object' &&
    obj.totais !== null &&
    typeof (obj.totais as Record<string, unknown>).calorias === 'number' &&
    Array.isArray(obj.refeicoes)
  );
}

// Função de retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`⏳ Tentativa ${i + 1} falhou. Aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Falha após múltiplas tentativas');
}

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, patientId, patientName, prescriberId } = await req.json();

    if (!pdfUrl || !patientId) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos: pdfUrl e patientId são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🚀 Iniciando transcrição de dieta:', { patientId, pdfUrl });

    // 1. Baixar o PDF com retry
    const pdfBuffer = await retryWithBackoff(async () => {
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Falha ao baixar PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      return await pdfResponse.arrayBuffer();
    });

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    console.log('✅ PDF baixado com sucesso');

    // 2. Configurar Modelo Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // Baixa temperatura para maior precisão
        topP: 0.95,
        topK: 40,
      }
    });

    // 3. Prompt otimizado para gerar formato específico
    const prompt = `
Você é um nutricionista especialista em análise de planos alimentares.

Analise este PDF de plano alimentar e extraia TODOS os dados em JSON estruturado.

**FORMATO DE SAÍDA OBRIGATÓRIO:**

{
  "textoFormatado": "Plano Alimentar\\n\\n*Período de 24 horas*\\n\\n*07:00 Em Jejum:*\\n- 3 x Nutrata de creatina (9,0g)\\n- 4 x 100 ml de água (400,0g)\\n\\n*07:30 Café da Manhã:*\\n- 2 x 1 unidade de banana, prata, crua (140,0g)\\n...\\n\\n*Totais Diários:*\\n- Calorias: 2.717,47 KCal\\n- Proteínas: 192,89 g\\n- Carboidratos: 328,14 g\\n- Gorduras: 76,92 g\\n- Fibras: 39,55 g",
  "totais": {
    "calorias": 2717.47,
    "proteinas": 192.89,
    "carboidratos": 328.14,
    "gorduras": 76.92,
    "fibras": 39.55
  },
  "refeicoes": [
    {
      "horario": "07:00",
      "nome": "Em Jejum",
      "alimentos": [
        {
          "descricao": "3 x Nutrata de creatina",
          "quantidade": "9,0g",
          "calorias": 0.30,
          "proteinas": 9.00,
          "carboidratos": 0.00,
          "gorduras": 0.00,
          "fibras": 0.00
        }
      ],
      "totais": {
        "calorias": 4.30,
        "proteinas": 9.00,
        "carboidratos": 0.00,
        "gorduras": 0.00,
        "fibras": 0.00
      }
    }
  ]
}

**REGRAS IMPORTANTES:**

1. **textoFormatado**: Gere um texto formatado em Markdown com:
   - Título "Plano Alimentar"
   - Subtítulo "*Período de 24 horas*"
   - Cada refeição com formato: "*HH:mm Nome da Refeição:*"
   - Alimentos em lista com "-" no formato: "X x Nome do alimento (quantidade)"
   - Ao final: "*Totais Diários:*" com todos os macros

2. **totais**: Soma de TODOS os macronutrientes do dia

3. **refeicoes**: Array com TODAS as refeições, incluindo:
   - horario: formato "HH:mm"
   - nome: nome da refeição
   - alimentos: array com descrição EXATA do PDF (ex: "3 x Nutrata de creatina")
   - quantidade: peso total (ex: "9,0g")
   - macros individuais de cada alimento
   - totais da refeição

4. **Preserve EXATAMENTE**:
   - Multiplicadores (ex: "3 x", "4 x")
   - Nomes completos dos alimentos
   - Quantidades com vírgula decimal (ex: 9,0g não 9.0g)
   - Todos os detalhes (ex: "ovo caipira", "pão 100% integral Wickbold")

5. Se algum valor não estiver no PDF, estime com base em tabelas TACO/IBGE

**Retorne APENAS o JSON válido, sem markdown (sem \`\`\`json), sem explicações.**
    `.trim();

    // 4. Gerar Conteúdo com retry
    console.log('🤖 Enviando para Gemini...');
    const text = await retryWithBackoff(async () => {
      const result = await model.generateContent([
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf',
          },
        },
        prompt,
      ]);

      const response = await result.response;
      return response.text();
    });

    console.log('✅ Resposta recebida do Gemini');

    // 5. Limpar e parsear JSON
    let dietData: DietDataResponse;
    try {
      const jsonStr = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      dietData = JSON.parse(jsonStr);

      // Validar estrutura
      if (!validateDietData(dietData)) {
        throw new Error('Estrutura de dados inválida retornada pelo Gemini');
      }

      console.log('✅ JSON validado com sucesso');
      console.log('📊 Totais:', dietData.totais);
      console.log('🍽️ Refeições:', dietData.refeicoes.length);

    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('📄 Texto recebido:', text.substring(0, 500));
      throw new Error('Gemini retornou formato inválido. Por favor, tente novamente.');
    }

    // 6. Salvar no Firestore
    const dietPlanRef = adminDb.collection('dietPlans').doc();
    const dietPlan = {
      id: dietPlanRef.id,
      patientId,
      prescriberId,
      patientName: patientName || 'Paciente',

      // Dados principais
      name: 'Plano Alimentar',
      description: `Plano de ${dietData.totais.calorias.toFixed(0)} kcal/dia`,
      isActive: true,
      status: 'active',
      source: 'pdf_transcription',

      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      transcribedAt: Timestamp.now(),

      // PDF original
      originalPdfUrl: pdfUrl,

      // Dados da dieta (formato compatível com DietPlan)
      dailyCalories: Math.round(dietData.totais.calorias),
      dailyProtein: Math.round(dietData.totais.proteinas),
      dailyCarbs: Math.round(dietData.totais.carboidratos),
      dailyFats: Math.round(dietData.totais.gorduras),

      // Texto formatado para exibição
      formattedText: dietData.textoFormatado,

      // Refeições estruturadas
      meals: dietData.refeicoes.map(ref => ({
        time: ref.horario,
        name: ref.nome,
        foods: ref.alimentos.map(alimento => ({
          name: alimento.descricao,
          amount: alimento.quantidade,
          unit: '',
          calories: alimento.calorias || 0,
          protein: alimento.proteinas || 0,
          carbs: alimento.carboidratos || 0,
          fats: alimento.gorduras || 0,
        })),
        macros: ref.totais ? {
          calories: ref.totais.calorias,
          protein: ref.totais.proteinas,
          carbs: ref.totais.carboidratos,
          fats: ref.totais.gorduras,
        } : undefined
      })),

      // Metadados adicionais
      metadata: {
        // Informações básicas
        totalMeals: dietData.refeicoes.length,
        totalFoods: dietData.refeicoes.reduce((sum, ref) => sum + ref.alimentos.length, 0),

        // Meta da dieta
        meta: {
          caloriasDiarias: dietData.totais.calorias,
          periodo: 'Diário',
          objetivo: 'Plano nutricional personalizado',
          dataCriacao: new Date().toISOString()
        },

        // Macronutrientes detalhados
        macronutrientes: {
          proteinas: {
            gramas: dietData.totais.proteinas,
            percentual: (dietData.totais.proteinas * 4 / dietData.totais.calorias) * 100
          },
          carboidratos: {
            gramas: dietData.totais.carboidratos,
            percentual: (dietData.totais.carboidratos * 4 / dietData.totais.calorias) * 100
          },
          gorduras: {
            gramas: dietData.totais.gorduras,
            percentual: (dietData.totais.gorduras * 9 / dietData.totais.calorias) * 100
          },
          fibras: {
            gramas: dietData.totais.fibras || 0
          }
        },

        // Arrays vazios para compatibilidade
        micronutrientes: [],
        observacoes: [],
        substituicoes: [],

        // Status da transcrição
        transcriptionStatus: 'completed',
        transcribedAt: new Date().toISOString(),
        model: 'gemini-2.0-flash-exp',

        // Resumo
        resumo: {
          totalCalorias: dietData.totais.calorias,
          totalRefeicoes: dietData.refeicoes.length,
          totalAlimentos: dietData.refeicoes.reduce((sum, ref) => sum + ref.alimentos.length, 0),
          objetivo: 'Plano nutricional personalizado'
        }
      }
    };

    // 7. Desativar dietas anteriores e salvar nova
    const oldDietsQuery = await adminDb
      .collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();

    const batch = adminDb.batch();

    oldDietsQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        isActive: false,
        deactivatedAt: Timestamp.now()
      });
    });

    batch.set(dietPlanRef, dietPlan);
    await batch.commit();

    console.log('✅ Dieta salva no Firestore:', dietPlanRef.id);

    return NextResponse.json({
      success: true,
      message: 'Dieta transcrita e salva com sucesso',
      resumo: {
        totalCalorias: dietData.totais.calorias,
        totalProteinas: dietData.totais.proteinas,
        totalCarboidratos: dietData.totais.carboidratos,
        totalGorduras: dietData.totais.gorduras,
        totalRefeicoes: dietData.refeicoes.length,
        totalAlimentos: dietData.refeicoes.reduce((sum, ref) => sum + ref.alimentos.length, 0)
      },
      data: dietPlan
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Erro na transcrição:', err);
    console.error('Stack trace:', err.stack);

    // Identificar tipo de erro
    let errorMessage = 'Erro ao processar dieta';
    const errorDetails = err instanceof Error ? err.message : String(error);

    if (err.message?.includes('Falha ao baixar PDF')) {
      errorMessage = 'Não foi possível acessar o PDF. Verifique se o link está correto.';
    } else if (err.message?.includes('JSON')) {
      errorMessage = 'Erro ao processar resposta da IA. Tente novamente.';
    } else if (err.message?.includes('quota')) {
      errorMessage = 'Limite de uso da API atingido. Tente novamente em alguns minutos.';
    } else if (err.message?.includes('timeout')) {
      errorMessage = 'Tempo limite excedido. O PDF pode ser muito grande.';
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        details: errorDetails,
        error: err.message
      },
      { status: 500 }
    );
  }
}
