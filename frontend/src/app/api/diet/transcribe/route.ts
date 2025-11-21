import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, patientId, patientName, prescriberId } = await req.json();

    if (!pdfUrl || !patientId) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    console.log('🚀 Iniciando transcrição de dieta:', { patientId, pdfUrl });

    // 1. Baixar o PDF
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error('Falha ao baixar o PDF');
    }
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // 2. Configurar Modelo Gemini 1.5 Flash (Multimodal e Rápido)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 3. Prompt para extração
    const prompt = `
      Você é um nutricionista especialista em análise de dados.
      Analise este PDF de plano alimentar e extraia os dados estruturados em JSON.
      
      O JSON deve seguir EXATAMENTE esta estrutura:
      {
        "resumo": {
          "totalCalorias": number (kcal),
          "totalProteinas": number (g),
          "totalCarboidratos": number (g),
          "totalGorduras": number (g),
          "totalRefeicoes": number,
          "totalAlimentos": number
        },
        "refeicoes": [
          {
            "horario": "HH:mm",
            "nome": "Nome da Refeição (ex: Café da Manhã)",
            "alimentos": [
              {
                "nome": "Nome do alimento",
                "quantidade": "Quantidade (ex: 2 fatias, 100g)",
                "calorias": number (estimado se não tiver),
                "proteina": number (estimado se não tiver),
                "carboidrato": number (estimado se não tiver),
                "gordura": number (estimado se não tiver),
                "substituicoes": ["Opção 1", "Opção 2"] (se houver)
              }
            ],
            "observacoes": "Obs da refeição"
          }
        ],
        "suplementacao": [
          {
            "nome": "Nome do suplemento",
            "dosagem": "Dosagem e horário",
            "observacao": "Obs"
          }
        ],
        "observacoesGerais": "Texto corrido com orientações gerais"
      }

      Se algum valor numérico não estiver explícito, estime com base em tabelas nutricionais padrão (TACO/IBGE).
      Retorne APENAS o JSON, sem markdown ou explicações adicionais.
    `;

    // 4. Gerar Conteúdo
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
    const text = response.text();

    // Limpar markdown se houver (```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const dietData = JSON.parse(jsonStr);

    console.log('✅ Dieta transcrita com sucesso!', dietData.resumo);

    // 5. Salvar no Firestore
    const dietPlanRef = adminDb.collection('dietPlans').doc();
    const dietPlan = {
      id: dietPlanRef.id,
      patientId,
      prescriberId,
      patientName,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'active',
      source: 'pdf_transcription',
      originalPdfUrl: pdfUrl,
      ...dietData
    };

    // Desativar dietas anteriores
    const oldDietsQuery = await adminDb
      .collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();

    const batch = adminDb.batch();

    oldDietsQuery.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false, deactivatedAt: Timestamp.now() });
    });

    batch.set(dietPlanRef, dietPlan);
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Dieta transcrita e salva com sucesso',
      data: dietPlan
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Erro na transcrição:', error);
    console.error('Stack trace:', error.stack);

    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
