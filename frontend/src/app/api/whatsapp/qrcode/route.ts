import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.SERVER_URL || 'https://confident-success-production.up.railway.app';
const API_KEY = process.env.AUTHENTICATION_API_KEY || 'nutribuddy1!';
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'NutriBuddy';

export async function GET() {
    try {
        console.log('🔄 Fetching QR Code from Evolution API...');

        // 1. Tentar conectar (pegar QR Code)
        const connectUrl = `${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}`;
        console.log('🔗 URL:', connectUrl);

        const response = await fetch(connectUrl, {
            method: 'GET',
            headers: {
                'apikey': API_KEY
            }
        });

        if (!response.ok) {
            // Se der 404 ou erro, pode ser que a instância não exista. Vamos tentar criar.
            console.log('⚠️ Instance might not exist. Attempting to create...');

            const createUrl = `${EVOLUTION_URL}/instance/create`;
            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY
                },
                body: JSON.stringify({
                    instanceName: INSTANCE_NAME,
                    qrcode: true
                })
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                console.error('❌ Failed to create instance:', errorText);
                return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 });
            }

            const createData = await createResponse.json();

            // Se criou e já devolveu o QR Code (v2 faz isso)
            if (createData.base64 || createData.qrcode) {
                return NextResponse.json({
                    base64: createData.base64 || createData.qrcode
                });
            }

            // Se criou mas não devolveu, tenta conectar de novo
            const retryResponse = await fetch(connectUrl, { headers: { 'apikey': API_KEY } });
            const retryData = await retryResponse.json();
            return NextResponse.json(retryData);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('❌ Error in QR Code route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
