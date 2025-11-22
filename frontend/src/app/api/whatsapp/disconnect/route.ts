import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.SERVER_URL || 'https://confident-success-production.up.railway.app';
const API_KEY = process.env.AUTHENTICATION_API_KEY || 'nutribuddy1!';
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'NutriBuddy';

export async function POST() {
    try {
        const url = `${EVOLUTION_URL}/instance/logout/${INSTANCE_NAME}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': API_KEY
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to disconnect' }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Error disconnecting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
