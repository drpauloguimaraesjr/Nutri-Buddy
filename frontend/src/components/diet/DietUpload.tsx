'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToast } from '@/components/ui/ToastProvider';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import type { UploadResult } from '@/types/diet';

interface DietUploadProps {
  patientId: string;
  prescriberId: string;
  patientName?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export default function DietUpload({
  patientId,
  prescriberId,
  patientName,
  onSuccess,
  onError
}: DietUploadProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (file.type !== 'application/pdf') {
      return 'Por favor, selecione um arquivo PDF';
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'PDF muito grande. Tamanho máximo: 10MB';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validationError = validateFile(file);
    if (validationError) {
      showToast({
        title: 'Erro ao validar arquivo',
        description: validationError,
        variant: 'error',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // 1. Upload para Firebase Storage
      const timestamp = Date.now();
      const storagePath = `prescribers/${prescriberId}/patients/${patientId}/diets/${timestamp}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      console.log('📤 Uploading PDF to Firebase Storage:', storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // 2. Monitorar progresso do upload
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
            console.log(`Upload progress: ${progress.toFixed(1)}%`);
          },
          (error) => {
            console.error('❌ Upload error:', error);
            reject(error);
          },
          () => {
            console.log('✅ Upload completed');
            resolve(null);
          }
        );
      });

      // 3. Obter URL pública
      const pdfUrl = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('🔗 PDF URL:', pdfUrl);

      showToast({
        title: 'PDF enviado!',
        description: 'Iniciando transcrição com IA...',
        variant: 'success',
      });
      setUploading(false);
      setTranscribing(true);

      // 4. Chamar API interna para transcrição com Gemini
      const transcribeUrl = '/api/diet/transcribe';

      console.log('🤖 Calling internal transcription API:', transcribeUrl);

      const response = await fetch(transcribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: pdfUrl,
          patientId: patientId,
          patientName: patientName || 'Paciente',
          prescriberId: prescriberId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result: UploadResult = await response.json();

      console.log('✅ N8N response:', result);

      if (result.success) {
        const summary = result.resumo;

        showToast({
          title: 'Dieta transcrita com sucesso!',
          description: `📊 ${summary?.totalCalorias || result.totalCalorias || 0} kcal/dia • 🍽️ ${summary?.totalRefeicoes || result.totalRefeicoes || 0} refeições • 🥗 ${summary?.totalAlimentos || result.totalAlimentos || 0} alimentos`,
          variant: 'success',
          duration: 6000,
        });

        onSuccess?.(result);
      } else {
        throw new Error(result.message || 'Erro ao transcrever dieta');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Error processing diet PDF:', error);
      showToast({
        title: 'Erro ao processar dieta',
        description: errorMessage,
        variant: 'error',
        duration: 7000,
      });
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setUploading(false);
      setTranscribing(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isProcessing = uploading || transcribing;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="hidden"
      />

      <div
        onClick={!isProcessing ? handleButtonClick : undefined}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isProcessing
            ? 'border-blue-400 bg-blue-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
          }
        `}
      >
        {isProcessing ? (
          <div className="space-y-4">
            {uploading && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-gray-800">
                    Enviando PDF... {uploadProgress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Fazendo upload do arquivo...
                  </p>
                </div>
              </>
            )}

            {transcribing && (
              <>
                <div className="relative">
                  <FileText className="w-16 h-16 mx-auto text-blue-500" />
                  <Loader2 className="w-8 h-8 absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-gray-800">
                    Transcrevendo com IA...
                  </div>
                  <p className="text-sm text-gray-500">
                    Gemini AI está analisando o PDF da dieta
                  </p>
                  <p className="text-xs text-gray-400">
                    Isso pode levar 30-45 segundos
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-16 h-16 mx-auto text-gray-400" />
            <div className="text-xl font-semibold text-gray-800">
              Upload PDF da Dieta
            </div>
            <p className="text-sm text-gray-500">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Apenas PDF
              </span>
              <span>•</span>
              <span>Máximo 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      {!isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-blue-900">
                Transcrição automática com IA
              </p>
              <p className="text-blue-700">
                O sistema irá extrair automaticamente:
              </p>
              <ul className="list-disc list-inside text-blue-600 space-y-0.5 ml-2">
                <li>Calorias totais e macronutrientes</li>
                <li>Todas as refeições com horários</li>
                <li>Alimentos com quantidades exatas</li>
                <li>Observações do nutricionista</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

