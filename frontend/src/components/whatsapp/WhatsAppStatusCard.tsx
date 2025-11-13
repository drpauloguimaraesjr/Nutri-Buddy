'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface WhatsAppStatusCardProps {
  onOpenQRCode?: () => void;
  refreshInterval?: number;
}

export function WhatsAppStatusCard({ 
  onOpenQRCode, 
  refreshInterval = 30000 
}: WhatsAppStatusCardProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Verificar status
  const checkStatus = async () => {
    try {
      setIsRefreshing(true);
      
      // Usar endpoint de teste (sem auth)
      const response = await fetch(`${apiBaseUrl}/api/whatsapp/status-test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        setStatus(data.connected ? 'connected' : 'disconnected');
        setPhoneNumber(data.phone || '');
        setLastCheck(new Date());
      } else {
        setStatus('error');
      }
    } catch (error) {
      // Silenciar erro de fetch - servidor pode estar offline
      // console.error('Erro ao verificar status WhatsApp:', error);
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh - DESABILITADO até backend estar rodando
  useEffect(() => {
    // checkStatus(); // Comentado para evitar erros no console
    
    // const interval = setInterval(checkStatus, refreshInterval);
    
    // return () => clearInterval(interval);
  }, [refreshInterval, checkStatus]);

  // Handlers
  const handleClick = () => {
    if (status === 'disconnected' || status === 'error') {
      if (onOpenQRCode) {
        onOpenQRCode();
      }
    }
  };

  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkStatus();
  };

  // Format phone number
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/@.*/, '');
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      const ddd = cleaned.substring(2, 4);
      const part = cleaned.substring(4, 9);
      return `(${ddd}) ${part}...`;
    }
    return cleaned.substring(0, 12) + '...';
  };

  // Get time since last check
  const getTimeSince = () => {
    if (!lastCheck) return '';
    const seconds = Math.floor((new Date().getTime() - lastCheck.getTime()) / 1000);
    
    if (seconds < 10) return 'agora';
    if (seconds < 60) return `${seconds}s atrás`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <div 
      className={`
        relative flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer
        ${status === 'connected' ? 'bg-green-50 border-2 border-green-200 hover:border-green-300' : ''}
        ${status === 'disconnected' ? 'bg-red-50 border-2 border-red-200 hover:border-red-300' : ''}
        ${status === 'checking' ? 'bg-gray-50 border-2 border-gray-200' : ''}
        ${status === 'error' ? 'bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-300' : ''}
        hover:shadow-md
      `}
      onClick={handleClick}
      title={status === 'connected' ? 'WhatsApp conectado' : 'Clique para conectar'}
    >
      {/* Icon with pulse animation */}
      <div className="relative flex-shrink-0">
        {status === 'connected' && (
          <>
            <Wifi className="w-8 h-8 text-green-600" />
            <div className="absolute inset-0 animate-ping">
              <Wifi className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </>
        )}
        {status === 'disconnected' && <WifiOff className="w-8 h-8 text-red-600" />}
        {status === 'checking' && (
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        )}
        {status === 'error' && <WifiOff className="w-8 h-8 text-yellow-600" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 text-sm">WhatsApp</h4>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Atualizar status"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {status === 'connected' && (
          <>
            <p className="text-xs font-medium text-green-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Conectado
            </p>
            {phoneNumber && (
              <p className="text-xs text-gray-600 font-mono mt-1">
                {formatPhone(phoneNumber)}
              </p>
            )}
          </>
        )}

        {status === 'disconnected' && (
          <>
            <p className="text-xs font-medium text-red-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Desconectado
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenQRCode) onOpenQRCode();
              }}
              className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
            >
              Conectar
            </button>
          </>
        )}

        {status === 'checking' && (
          <p className="text-xs text-gray-500">
            Verificando...
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="text-xs font-medium text-yellow-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Erro na conexão
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Servidor offline
            </p>
          </>
        )}

        {lastCheck && status !== 'checking' && (
          <p className="text-xs text-gray-400 mt-1">
            {getTimeSince()}
          </p>
        )}
      </div>

      {/* Connection indicator dot */}
      <div className={`
        absolute top-2 right-2 w-3 h-3 rounded-full
        ${status === 'connected' ? 'bg-green-500 animate-pulse' : ''}
        ${status === 'disconnected' ? 'bg-red-500' : ''}
        ${status === 'checking' ? 'bg-gray-400 animate-pulse' : ''}
        ${status === 'error' ? 'bg-yellow-500' : ''}
      `}></div>
    </div>
  );
}

