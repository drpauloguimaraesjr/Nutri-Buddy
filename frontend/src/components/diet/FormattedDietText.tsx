'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface FormattedDietTextProps {
    formattedText: string;
}

export default function FormattedDietText({ formattedText }: FormattedDietTextProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    // Processar o texto formatado para renderizar com estilos
    const renderFormattedText = () => {
        const lines = formattedText.split('\n');

        return lines.map((line, index) => {
            // Título principal
            if (line.trim() === 'Plano Alimentar') {
                return (
                    <h2 key={index} className="text-fluid-2xl font-bold text-high-contrast mb-2">
                        {line}
                    </h2>
                );
            }

            // Subtítulo (Período)
            if (line.includes('*Período de')) {
                return (
                    <p key={index} className="text-fluid-base text-high-contrast-muted italic mb-6">
                        {line.replace(/\*/g, '')}
                    </p>
                );
            }

            // Horário da refeição (ex: *07:00 Café da Manhã:*)
            if (line.match(/^\*\d{2}:\d{2}.*:\*$/)) {
                return (
                    <h3 key={index} className="text-fluid-lg font-semibold text-high-contrast mt-6 mb-3 pb-2 border-b border-border">
                        {line.replace(/\*/g, '')}
                    </h3>
                );
            }

            // Totais Diários
            if (line.includes('*Totais Diários:*')) {
                return (
                    <h3 key={index} className="text-fluid-lg font-bold text-high-contrast mt-8 mb-3 pt-4 border-t-2 border-border">
                        {line.replace(/\*/g, '')}
                    </h3>
                );
            }

            // Alimentos (linhas com -)
            if (line.trim().startsWith('-')) {
                const content = line.replace(/^-\s*/, '');
                return (
                    <div key={index} className="flex items-start gap-2 ml-4 mb-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-fluid-sm text-high-contrast-muted flex-1">{content}</span>
                    </div>
                );
            }

            // Linha vazia
            if (line.trim() === '') {
                return <div key={index} className="h-2" />;
            }

            // Outras linhas
            return (
                <p key={index} className="text-fluid-sm text-high-contrast-muted mb-1">
                    {line}
                </p>
            );
        });
    };

    return (
        <div className="bg-background-secondary rounded-lg border border-border p-6 relative">
            {/* Botão de copiar */}
            <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background transition-colors"
                title="Copiar texto"
            >
                {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                ) : (
                    <Copy className="w-5 h-5 text-high-contrast-muted" />
                )}
            </button>

            {/* Texto formatado */}
            <div className="pr-12">
                {renderFormattedText()}
            </div>
        </div>
    );
}
