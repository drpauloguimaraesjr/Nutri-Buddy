'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Send, Smile, Loader2, Image as ImageIcon, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onSendMedia: (file: File, mediaType: 'image' | 'audio') => Promise<void>;
  onSimulatePatient?: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  onSendMedia,
  onSimulatePatient,
  placeholder = 'Digite sua mensagem...',
  disabled = false,
  maxLength = 1000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSend(trimmedMessage);
      setMessage('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  const handleSelectImage = () => {
    if (disabled || isUploadingMedia) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      console.warn('Apenas imagens são suportadas no momento.');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingMedia(true);
      await onSendMedia(file, 'image');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    } finally {
      setIsUploadingMedia(false);
      event.target.value = '';
    }
  };

  const stopRecording = async (send: boolean) => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current;
      mediaRecorderRef.current = null;

      if (!recorder) {
        resolve();
        return;
      }

      recorder.onstop = async () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        setRecordingSeconds(0);
        setIsRecording(false);

        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        recordingChunksRef.current = [];

        if (send && blob.size > 0) {
          const file = new File([blob], `audio-${Date.now()}.webm`, { type: blob.type });
          try {
            setIsUploadingMedia(true);
            await onSendMedia(file, 'audio');
          } catch (error) {
            console.error('Erro ao enviar áudio:', error);
          } finally {
            setIsUploadingMedia(false);
          }
        }

        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve();
      };

      recorder.stop();
    });
  };

  const startRecording = async () => {
    if (isRecording || disabled || isUploadingMedia) return;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn('Gravação de áudio não é suportada neste dispositivo.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
    }
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording(true);
    } else {
      await startRecording();
    }
  };

  const recordingLabel = () => {
    const minutes = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
    const seconds = String(recordingSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={handleSelectImage}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            disabled={disabled || isUploadingMedia}
            title="Enviar foto"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending || isOverLimit}
              maxLength={maxLength}
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-20 rounded-xl border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'resize-none overflow-y-auto',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )}
              style={{ maxHeight: '150px' }}
            />

            {isNearLimit && (
              <span
                className={cn(
                  'absolute bottom-2 right-14 text-xs',
                  isOverLimit ? 'text-red-500' : 'text-gray-400'
                )}
              >
                {characterCount}/{maxLength}
              </span>
            )}
          </div>

          <button
            type="button"
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-colors',
              isRecording
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
            onClick={handleRecordingToggle}
            disabled={disabled || isUploadingMedia}
            title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            disabled={disabled}
            title="Emoji (em breve)"
          >
            <Smile className="w-5 h-5" />
          </button>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending || disabled || isOverLimit}
            className={cn(
              'flex-shrink-0 px-4 py-3 rounded-xl',
              'bg-gradient-to-r from-blue-500 to-purple-600',
              'hover:from-blue-600 hover:to-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>

          {onSimulatePatient && (
            <Button
              onClick={async () => {
                const trimmedMessage = message.trim();
                if (!trimmedMessage || isSending || disabled) return;
                try {
                  setIsSending(true);
                  await onSimulatePatient(trimmedMessage);
                  setMessage('');
                  if (textareaRef.current) textareaRef.current.style.height = 'auto';
                } finally {
                  setIsSending(false);
                }
              }}
              disabled={!message.trim() || isSending || disabled}
              variant="outline"
              className="flex-shrink-0 px-3 py-3 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
              title="Simular mensagem do paciente (Teste)"
            >
              <span className="text-xs font-bold">Simular</span>
            </Button>
          )}
        </div>

        {(isRecording || isUploadingMedia) && (
          <div className="text-xs text-gray-500 flex items-center gap-2 px-1">
            {isRecording && (
              <span className="flex items-center gap-1 text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Gravando áudio • {recordingLabel()}
              </span>
            )}
            {isUploadingMedia && <span>Enviando mídia...</span>}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-400 text-center">
        Pressione Enter para enviar, Shift + Enter para quebra de linha
      </p>
    </div>
  );
}
