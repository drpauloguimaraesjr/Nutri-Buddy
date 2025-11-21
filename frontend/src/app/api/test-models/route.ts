import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'GOOGLE_AI_API_KEY not found'
            }, { status: 500 });
        }

        console.log('🔍 Testing API Key:', apiKey.substring(0, 10) + '...');

        // Try to list models
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                error: 'Failed to list models',
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const models = data.models?.map((m: any) => ({
            name: m.name,
            displayName: m.displayName,
            supportedGenerationMethods: m.supportedGenerationMethods,
        })) || [];

        return NextResponse.json({
            success: true,
            totalModels: models.length,
            models,
            apiKeyPrefix: apiKey.substring(0, 10) + '...'
        });

    } catch (error) {
        const err = error as Error;
        console.error('❌ Error testing models:', err);
        return NextResponse.json({
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
```
