import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const N8N_SECRET = 'nutribuddy-secret-2024';

function validateSecret(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret');
    return secret === N8N_SECRET;
}

// Criar contexto (POST)
export async function POST(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;
        const body = await req.json();

        await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('context')
            .doc('active')
            .set({
                ...body,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating context:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Buscar contexto (GET) - Usado pelo Node "Buscar Contexto Ativo"
export async function GET(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;
        const doc = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('context')
            .doc('active')
            .get();

        if (!doc.exists) {
            return NextResponse.json({ hasContext: false });
        }

        return NextResponse.json({ hasContext: true, context: doc.data() });
    } catch (error) {
        console.error('Error fetching context:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Atualizar contexto (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;
        const body = await req.json(); // { data: ... }

        await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('context')
            .doc('active')
            .update({
                ...body, // O n8n manda a estrutura aninhada correta em 'contextUpdate'
                updatedAt: FieldValue.serverTimestamp()
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating context:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Deletar contexto (DELETE)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;

        await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('context')
            .doc('active')
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting context:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
