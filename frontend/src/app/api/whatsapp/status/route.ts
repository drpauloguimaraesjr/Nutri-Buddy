import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.SERVER_URL || 'https://confident-success-production.up.railway.app';
const API_KEY = process.env.AUTHENTICATION_API_KEY || 'nutribuddy1!';
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'NutriBuddy';

export async function GET() {
    try {
        const url = `${EVOLUTION_URL}/instance/connectionState/${INSTANCE_NAME}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': API_KEY
            }
        });

        if (!response.ok) {
            // Se der erro (ex: 404), assume desconectado
            return NextResponse.json({ connected: false });
        }

        const data = await response.json();
        // Evolution v1/v2 structure might vary slightly, but usually it's instance.state
        const state = data?.instance?.state || data?.state;

        const isConnected = state === 'open';

        return NextResponse.json({
            connected: isConnected,
            phone: data?.instance?.ownerJid || null // Tenta pegar o número se disponível
        });

    } catch (error) {
        console.error('❌ Error checking status:', error);
        return NextResponse.json({ connected: false });
    }
}
