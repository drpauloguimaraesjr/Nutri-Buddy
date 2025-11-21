import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { analyzeDietLog } from '@/lib/diet-assistant';
import { DietPlan } from '@/types/diet';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

// Função para normalizar telefone (remove tudo que não é número)
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

export async function POST(req: NextRequest) {
    try {
        // Parse do form data do Twilio
        const formData = await req.formData();
        const from = formData.get('From') as string;
        const body = formData.get('Body') as string;
        // const mediaUrl = formData.get('MediaUrl0') as string; // Para imagens no futuro

        console.log('📩 Twilio Webhook received:', { from, body });

        const twiml = new MessagingResponse();

        if (!from || !body) {
            return new NextResponse('Missing From or Body', { status: 400 });
        }

        // 1. Identificar Paciente
        // Twilio manda "whatsapp:+5511999999999". Vamos limpar para "5511999999999"
        const phone = normalizePhone(from);

        // Buscar no Firestore (pode precisar ajustar dependendo de como salvou o telefone)
        // Vamos tentar buscar pelo telefone exato ou com/sem DDI
        // Idealmente, o telefone no banco deve estar padronizado.

        console.log('🔍 Searching patient with phone:', phone);

        const patientsSnapshot = await adminDb
            .collection('patients')
            .where('phone', '==', phone) // Assumindo que salvou apenas números com DDI
            .limit(1)
            .get();

        let patientDoc;

        if (patientsSnapshot.empty) {
            // Tentar buscar com +
            const patientsSnapshotPlus = await adminDb
                .collection('patients')
                .where('phone', '==', `+${phone}`)
                .limit(1)
                .get();

            if (patientsSnapshotPlus.empty) {
                console.log('❌ Patient not found');
                twiml.message('Olá! Não encontrei seu cadastro no NutriBuddy. Por favor, entre em contato com seu nutricionista para verificar seu número.');
                return new NextResponse(twiml.toString(), {
                    headers: { 'Content-Type': 'text/xml' },
                });
            }

            // Achou com +
            patientDoc = patientsSnapshotPlus.docs[0];
        } else {
            // Achou sem +
            patientDoc = patientsSnapshot.docs[0];
        }

        const patientId = patientDoc.id;
        const patientData = patientDoc.data();
        console.log('✅ Patient found:', patientData.name);

        // 2. Buscar Dieta Ativa
        const dietSnapshot = await adminDb
            .collection('dietPlans')
            .where('patientId', '==', patientId)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (dietSnapshot.empty) {
            twiml.message(`Olá ${patientData.name}! Você ainda não tem uma dieta ativa. Peça para seu nutricionista cadastrar seu plano.`);
            return new NextResponse(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const dietPlan = dietSnapshot.docs[0].data() as DietPlan;

        // 3. Analisar Mensagem com IA
        const analysis = await analyzeDietLog(body, dietPlan);

        if (!analysis) {
            // Não entendeu como comida
            // TODO: Implementar chat geral
            twiml.message('Desculpe, não entendi se isso é um registro de refeição. Tente algo como "Comi 2 ovos no café".');
        } else {
            // 4. Calcular e Salvar Score
            // Chamar a lógica de cálculo (reusando a lógica da API ou chamando via fetch se fosse externo, mas aqui podemos importar ou duplicar a logica de salvar)

            // Para simplificar e evitar duplicar código complexo, vou salvar o log bruto e chamar a API de calculo internamente
            // Mas como estamos no server side, posso chamar a função de calculo se eu a extrair.
            // Por enquanto, vou fazer o fetch para a própria API (localhost)

            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

            // Salvar no Firestore (append no dia)
            // A API de cálculo sobrescreve o dia todo baseada no input.
            // Precisamos primeiro PEGAR o que já foi consumido hoje e ADICIONAR o novo.

            const today = new Date().toISOString().split('T')[0];
            // const adherenceDocId = `${patientId}_${today}`;
            // const adherenceDoc = await adminDb.collection('dailyAdherence').doc(adherenceDocId).get();

            // Salvar log bruto
            await adminDb.collection('mealLogs').add({
                patientId,
                date: today,
                ...analysis,
                originalText: body,
                createdAt: new Date().toISOString()
            });

            // Recalcular o dia (buscando todos os logs do dia)
            const logsSnapshot = await adminDb
                .collection('mealLogs')
                .where('patientId', '==', patientId)
                .where('date', '==', today)
                .get();

            const allMeals = logsSnapshot.docs.map(doc => ({
                name: doc.data().mealName,
                foods: doc.data().foods,
                timestamp: doc.data().createdAt
            }));

            // Chamar API de cálculo (ou executar lógica)
            // Vou chamar a API via fetch para garantir consistência
            try {
                await fetch(`${apiUrl}/api/adherence/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patientId,
                        date: today,
                        consumedMeals: allMeals
                    })
                });
            } catch (err) {
                console.error('Error calling calculation API:', err);
            }

            // 5. Responder
            twiml.message(`✅ ${analysis.feedback}\n\nRefeição: ${analysis.mealName}\nCalorias: ~${analysis.foods.reduce((a, b) => a + b.calories, 0)}kcal`);
        }

        return new NextResponse(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' },
        });

    } catch (error) {
        console.error('Webhook error:', error);
        const twiml = new MessagingResponse();
        twiml.message('Desculpe, tive um erro ao processar sua mensagem. Tente novamente.');
        return new NextResponse(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' },
        });
    }
}
