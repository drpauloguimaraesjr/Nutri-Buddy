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

  // Buscar QR Code diretamente da Evolution API
  const fetchQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Tenta buscar via backend primeiro
      try {
        const response = await fetch('/api/whatsapp/qrcode', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          if (data.base64) {
            setQrCode(data.base64);
            setConnectionStatus('connecting');
            return;
          } else if (data.status === 'connected') {
            setConnectionStatus('connected');
            if (onConnected) onConnected();
            return;
          }
        }
      } catch (backendErr) {
        console.log('Backend não disponível, usando Evolution API diretamente');
      }

      // Se backend não funcionar, tenta diretamente na Evolution API
      const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://nutribuddy-evolution-api.onrender.com';
      const evolutionKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || 'NutriBuddy2024_MinhaChaveSecreta!';
      const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE_NAME || 'nutribuddy';

      const response = await fetch(
        `${evolutionUrl}/instance/connect/${instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': evolutionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // Se der 404 ou erro, pode ser que já está conectado
        const statusCheck = await fetch(
          `${evolutionUrl}/instance/connectionState/${instanceName}`,
          {
            method: 'GET',
            headers: {
              'apikey': evolutionKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (statusCheck.ok) {
          const statusData = await statusCheck.json();
          if (statusData.state === 'open' || statusData.state === 'connected') {
            setConnectionStatus('connected');
            if (onConnected) onConnected();
            return;
          }
        }

        throw new Error('Erro ao buscar QR Code');
      }

      const data = await response.json();

      if (data.base64) {
        setQrCode(data.base64);
        setConnectionStatus('connecting');
      } else if (data.pairingCode) {
        setQrCode(data.pairingCode);
        setConnectionStatus('connecting');
      } else {
        // Pode estar já conectado
        setConnectionStatus('connected');
        if (onConnected) onConnected();
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError('Erro ao carregar QR Code. Verifique se a Evolution API está rodando.');
    } finally {
      setLoading(false);
    }
  }, [onConnected]);

  // Verificar status da conexão
  const checkConnectionStatus = useCallback(async () => {
    try {
      // Tenta via backend primeiro
      try {
        const response = await fetch('/api/whatsapp/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'connected') {
            setConnectionStatus('connected');
            if (onConnected) onConnected();
            return;
          } else if (data.status === 'connecting') {
            setConnectionStatus('connecting');
            return;
          } else {
            setConnectionStatus('disconnected');
            return;
          }
        }
      } catch (backendErr) {
        console.log('Backend não disponível, verificando direto na Evolution API');
      }

      // Se backend falhar, tenta Evolution API diretamente
      const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://nutribuddy-evolution-api.onrender.com';
      const evolutionKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || 'NutriBuddy2024_MinhaChaveSecreta!';
      const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE_NAME || 'nutribuddy';

      const response = await fetch(
        `${evolutionUrl}/instance/connectionState/${instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': evolutionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.state === 'open' || data.state === 'connected') {
          setConnectionStatus('connected');
          if (onConnected) onConnected();
        } else if (data.state === 'connecting') {
          setConnectionStatus('connecting');
        } else {
          setConnectionStatus('disconnected');
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  }, [onConnected]);

  // Desconectar WhatsApp
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setConnectionStatus('disconnected');
        setQrCode('');
      }
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      setError('Erro ao desconectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar QR Code na montagem
  useEffect(() => {
    fetchQRCode();
    checkConnectionStatus();
  }, [fetchQRCode, checkConnectionStatus]);

  // Auto-refresh do QR Code (expira a cada 30 segundos)
  useEffect(() => {
    if (connectionStatus === 'connecting' && qrCode) {
      const interval = setInterval(() => {
        setRetryCount(prev => prev + 1);
        fetchQRCode();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [connectionStatus, qrCode, fetchQRCode]);

  // Verificar status periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkConnectionStatus();
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [checkConnectionStatus]);

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
          <div className="rounded-full bg-green-100 p-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">WhatsApp Conectado!</h3>
          <p className="text-gray-600 text-center">
            Seu WhatsApp está conectado e pronto para enviar mensagens.
          </p>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="mt-4"
          >
            Desconectar
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
                O QR Code é atualizado automaticamente a cada 30 segundos
              </p>
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

