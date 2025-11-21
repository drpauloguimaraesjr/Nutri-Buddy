import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Validar segredo do n8n
function validateSecret(req: NextRequest): boolean {
    const secret = req.headers.get('X-Webhook-Secret');
    return secret === 'nutribuddy-secret-2024';
}

export async function POST(req: NextRequest) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
        }

        // Configurar Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Ex: whatsapp:+14155238886

        if (!accountSid || !authToken || !fromNumber) {
            console.error('Missing Twilio credentials');
            return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
        }

        const client = twilio(accountSid, authToken);

        // Normalizar número de destino (adicionar whatsapp: se necessário)
        const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        // Enviar mensagem
        const twilioMessage = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            body: message
        });

        console.log('✅ WhatsApp message sent via Twilio:', twilioMessage.sid);

        return NextResponse.json({
            success: true,
            messageSid: twilioMessage.sid
        });

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return NextResponse.json({
            error: 'Failed to send message',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
