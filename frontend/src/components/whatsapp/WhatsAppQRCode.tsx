'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface WhatsAppQRCodeProps {
  onConnected?: () => void;
}

export function WhatsAppQRCode({ onConnected }: WhatsAppQRCodeProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Buscar QR Code via Evolution API
  const fetchQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📱 Buscando QR Code Evolution API');

      // Usar caminho relativo para evitar problemas de CORS/URL
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.base64) {
        setQrCode(data.base64);
        setConnectionStatus('connecting');
        console.log('✅ QR Code recebido');
      } else if (data.qrcode && data.qrcode.base64) {
        // Algumas versões retornam dentro de um objeto qrcode
        setQrCode(data.qrcode.base64);
        setConnectionStatus('connecting');
      } else if (data.instance?.state === 'open' || data.state === 'open') {
        setConnectionStatus('connected');
        setPhoneNumber(data.phone || '');
        console.log('✅ WhatsApp já conectado');
        if (onConnected) onConnected();
      } else {
        // Se não veio base64 e não está conectado, tenta mostrar o que veio para debug
        console.warn('⚠️ Resposta inesperada:', data);
        if (data.qrcode) setQrCode(data.qrcode); // Tenta usar direto se for string
        else setError('Não foi possível gerar QR Code');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar QR Code:', err);
      setError('Erro ao carregar QR Code. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [onConnected]);

  // Verificar status da conexão via Evolution API
  const checkConnectionStatus = useCallback(async () => {
    try {
      // Usar caminho relativo
      const response = await fetch('/api/whatsapp/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.connected) {
          setConnectionStatus('connected');
          setPhoneNumber(data.phone || '');
          setQrCode(''); // Limpar QR Code quando conectar
          console.log('✅ Status: Conectado');
          if (onConnected) onConnected();
        } else {
          setConnectionStatus('disconnected');
          setPhoneNumber('');
          // console.log('⚠️ Status: Desconectado'); // Comentado para não poluir console
        }
      }
    } catch {
      // Silenciar erro de fetch - servidor pode estar offline
      setConnectionStatus('disconnected');
    }
  }, [onConnected]);

  // Desconectar WhatsApp via Evolution API
  const handleDisconnect = async () => {
    if (!window.confirm('Deseja realmente desconectar o WhatsApp?')) {
      return;
    }

    try {
      setLoading(true);

      // Usar caminho relativo
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConnectionStatus('disconnected');
        setQrCode('');
        setPhoneNumber('');
        console.log('✅ WhatsApp desconectado');
      } else {
        setError('Erro ao desconectar. Tente novamente.');
      }
    } catch (err) {
      console.error('❌ Erro ao desconectar:', err);
      setError('Erro ao desconectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Não buscar QR Code automaticamente na montagem
  useEffect(() => {
    setConnectionStatus('disconnected');
    setLoading(false);
    // Verificar status inicial apenas
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  // Auto-refresh DESABILITADO - QR Code só é gerado sob demanda

  // Verificar status periodicamente apenas se estiver tentando conectar
  useEffect(() => {
    if (connectionStatus === 'connecting' || qrCode) {
      const interval = setInterval(() => {
        checkConnectionStatus();
      }, 5000); // 5 segundos

      return () => clearInterval(interval);
    }
  }, [connectionStatus, qrCode, checkConnectionStatus]);

  if (loading && !qrCode) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (connectionStatus === 'connected') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-4 animate-pulse">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">WhatsApp Conectado!</h3>
          <p className="text-gray-600 text-center">
            Seu WhatsApp está conectado e pronto para enviar mensagens.
          </p>
          {phoneNumber && (
            <p className="text-sm text-green-600 font-mono">
              📞 {phoneNumber}
            </p>
          )}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Desconectando...' : 'Desconectar'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conectar WhatsApp
          </h2>
          <p className="text-gray-600">
            Escaneie o QR Code com seu WhatsApp para conectar
          </p>
        </div>

        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
              <img
                src={qrCode}
                alt="QR Code do WhatsApp"
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {retryCount > 0 && `QR Code atualizado ${retryCount} vez${retryCount > 1 ? 'es' : ''}`}
              </p>
              <p className="text-xs text-gray-500">
                ⏱️ QR Code expira em 60 segundos
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                Renovar QR Code automaticamente
              </label>
            </div>

            <Button
              onClick={fetchQRCode}
              variant="outline"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar QR Code'}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Não foi possível gerar o QR Code
            </p>
            <Button onClick={fetchQRCode} disabled={loading}>
              {loading ? 'Carregando...' : 'Tentar Novamente'}
            </Button>
          </div>
        )}

        <div className="w-full mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Como conectar:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-semibold text-green-600 mr-2">1.</span>
              <span>Abra o WhatsApp no seu celular</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-green-600 mr-2">2.</span>
              <span>Vá em <strong>Configurações</strong> → <strong>Aparelhos conectados</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-green-600 mr-2">3.</span>
              <span>Toque em <strong>Conectar novo dispositivo</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-green-600 mr-2">4.</span>
              <span>Aponte a câmera para este QR Code</span>
            </li>
          </ol>
        </div>
      </div>
    </Card>
  );
}

