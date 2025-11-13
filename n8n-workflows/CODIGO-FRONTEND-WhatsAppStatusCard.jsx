// =============================================================
// NUTRIBUDDY - WHATSAPP STATUS CARD (para Kanban)
// =============================================================
// Arquivo: WhatsAppStatusCard.jsx
// Card compacto para exibir no Kanban/Dashboard
// =============================================================

import React, { useState, useEffect } from 'react';
import './WhatsAppStatusCard.css';

const WhatsAppStatusCard = ({ onOpenQRCode, refreshInterval = 30000 }) => {
  // ==========================================================
  // STATES
  // ==========================================================
  const [status, setStatus] = useState('checking');
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://web-production-c9eaf.up.railway.app';

  // ==========================================================
  // VERIFICAR STATUS
  // ==========================================================
  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      const data = await response.json();

      setStatus(data.connected ? 'connected' : 'disconnected');
      setPhoneNumber(data.phone);
      setLastCheck(new Date());
      setIsOnline(true);
    } catch (error) {
      console.error('Erro ao verificar status WhatsApp:', error);
      setStatus('error');
      setIsOnline(false);
    }
  };

  // ==========================================================
  // EFEITO: Auto-refresh
  // ==========================================================
  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleClick = () => {
    if (status === 'disconnected' || status === 'error') {
      if (onOpenQRCode) {
        onOpenQRCode();
      }
    }
  };

  const handleManualRefresh = (e) => {
    e.stopPropagation();
    checkStatus();
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div 
      className={`whatsapp-status-card status-${status}`}
      onClick={handleClick}
      title={status === 'connected' ? 'WhatsApp conectado' : 'Clique para conectar'}
    >
      {/* ICON */}
      <div className="card-icon-container">
        <StatusIcon status={status} />
        {status === 'connected' && <div className="pulse-ring"></div>}
      </div>

      {/* CONTENT */}
      <div className="card-content">
        <div className="card-header-row">
          <h4>WhatsApp</h4>
          <button 
            className="refresh-btn"
            onClick={handleManualRefresh}
            title="Atualizar status"
          >
            🔄
          </button>
        </div>

        {status === 'connected' && (
          <>
            <p className="status-text connected">✓ Conectado</p>
            {phoneNumber && (
              <p className="phone-mini">{formatPhoneMini(phoneNumber)}</p>
            )}
          </>
        )}

        {status === 'disconnected' && (
          <>
            <p className="status-text disconnected">⚠ Desconectado</p>
            <button 
              className="btn-reconnect"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenQRCode) onOpenQRCode();
              }}
            >
              Conectar
            </button>
          </>
        )}

        {status === 'checking' && (
          <p className="status-text checking">Verificando...</p>
        )}

        {status === 'error' && (
          <>
            <p className="status-text error">✗ Erro</p>
            <p className="error-hint">Servidor offline</p>
          </>
        )}

        {lastCheck && isOnline && (
          <p className="last-update">
            Atualizado há {getTimeSince(lastCheck)}
          </p>
        )}
      </div>

      {/* CONNECTION INDICATOR */}
      <div className={`connection-indicator ${status}`}></div>
    </div>
  );
};

// =============================================================
// COMPONENTE: Status Icon
// =============================================================
const StatusIcon = ({ status }) => {
  const icons = {
    connected: '✅',
    disconnected: '⚠️',
    checking: '🔄',
    error: '❌'
  };

  return (
    <div className={`status-icon icon-${status}`}>
      {icons[status] || icons.error}
    </div>
  );
};

// =============================================================
// HELPERS
// =============================================================
function formatPhoneMini(phone) {
  if (!phone) return '';
  
  phone = phone.replace(/@.*/, '');
  
  if (phone.startsWith('55') && phone.length >= 12) {
    const ddd = phone.substring(2, 4);
    const part = phone.substring(4, 9);
    return `(${ddd}) ${part}...`;
  }
  
  return phone.substring(0, 12) + '...';
}

function getTimeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 10) return 'poucos segundos';
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

export default WhatsAppStatusCard;

// =============================================================
// FIM DO ARQUIVO
// =============================================================

