// =============================================================
// NUTRIBUDDY - WHATSAPP QR CODE COMPONENT
// =============================================================
// Arquivo: WhatsAppQRCode.jsx
// Componente React para exibir QR Code e status do WhatsApp
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import './WhatsAppQRCode.css';

const WhatsAppQRCode = () => {
  // ==========================================================
  // STATES
  // ==========================================================
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('checking'); // checking, connected, disconnected
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [autoRefreshQR, setAutoRefreshQR] = useState(true);

  // URL do backend (ajuste conforme necessário)
  const API_BASE = process.env.REACT_APP_API_URL || 'https://web-production-c9eaf.up.railway.app';

  // ==========================================================
  // VERIFICAR STATUS DA CONEXÃO
  // ==========================================================
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      const data = await response.json();

      if (data.success) {
        const isConnected = data.connected;
        setStatus(isConnected ? 'connected' : 'disconnected');
        setPhoneNumber(data.phone);
        setLastCheck(new Date());

        // Se conectou, limpar QR Code e erro
        if (isConnected) {
          setQrCode(null);
          setError(null);
          console.log('✅ WhatsApp conectado:', data.phone);
        }
      } else {
        setStatus('disconnected');
        setError(data.error);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      setError('Erro ao conectar com servidor');
      setStatus('disconnected');
    }
  }, [API_BASE]);

  // ==========================================================
  // BUSCAR QR CODE
  // ==========================================================
  const fetchQRCode = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/qrcode-base64`);
      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        console.log('✅ QR Code gerado com sucesso');
        
        // QR Code expira em 60 segundos
        // Se auto-refresh ativado, buscar novamente após 55s
        if (autoRefreshQR && status !== 'connected') {
          setTimeout(() => {
            if (status !== 'connected') {
              console.log('🔄 QR Code expirado, gerando novo...');
              fetchQRCode();
            }
          }, 55000);
        }
      } else {
        setError(data.error || 'Erro ao gerar QR Code');
        
        // Se precisa reconectar, mostrar mensagem específica
        if (data.needsReconnect) {
          setError('Instância precisa ser reiniciada. Clique no botão abaixo.');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, status, autoRefreshQR]);

  // ==========================================================
  // REINICIAR INSTÂNCIA
  // ==========================================================
  const restartInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        console.log('✅ Instância reiniciada');
        setError('Instância reiniciada. Aguardando 10 segundos...');
        
        // Aguardar 10 segundos e buscar QR Code
        setTimeout(() => {
          setError(null);
          fetchQRCode();
        }, 10000);
      } else {
        setError(data.error || 'Erro ao reiniciar instância');
      }
    } catch (err) {
      console.error('Erro ao reiniciar:', err);
      setError('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DESCONECTAR WHATSAPP
  // ==========================================================
  const disconnectWhatsApp = async () => {
    if (!window.confirm('Deseja realmente desconectar o WhatsApp?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        console.log('✅ WhatsApp desconectado');
        setStatus('disconnected');
        setPhoneNumber(null);
        setQrCode(null);
        setError(null);
      } else {
        setError(data.error || 'Erro ao desconectar');
      }
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      setError('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // EFEITO: Verificar status automaticamente
  // ==========================================================
  useEffect(() => {
    checkStatus(); // Primeira verificação imediata

    // Intervalo: verificar a cada 10 segundos
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="whatsapp-qrcode-container">
      {/* HEADER */}
      <div className="whatsapp-header">
        <h3>📱 WhatsApp Connection</h3>
        <StatusBadge status={status} />
      </div>

      {/* CONTENT */}
      <div className="whatsapp-content">
        {/* ESTADO: VERIFICANDO */}
        {status === 'checking' && (
          <div className="status-checking">
            <div className="spinner"></div>
            <p>Verificando conexão...</p>
          </div>
        )}

        {/* ESTADO: CONECTADO */}
        {status === 'connected' && (
          <div className="status-connected">
            <div className="success-icon">✅</div>
            <h4>WhatsApp Conectado</h4>
            {phoneNumber && (
              <p className="phone-number">📞 {formatPhoneNumber(phoneNumber)}</p>
            )}
            {lastCheck && (
              <p className="last-check">
                Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
              </p>
            )}
            <button 
              onClick={disconnectWhatsApp} 
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        )}

        {/* ESTADO: DESCONECTADO */}
        {status === 'disconnected' && (
          <div className="status-disconnected">
            <div className="warning-icon">⚠️</div>
            <h4>WhatsApp Desconectado</h4>
            <p>Escaneie o QR Code para conectar</p>

            {/* ERRO */}
            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
                {error.includes('reiniciada') && (
                  <button 
                    onClick={restartInstance} 
                    disabled={loading}
                    className="btn btn-warning"
                  >
                    {loading ? 'Reiniciando...' : 'Reiniciar Instância'}
                  </button>
                )}
              </div>
            )}

            {/* QR CODE */}
            {qrCode ? (
              <div className="qrcode-display">
                <img src={qrCode} alt="QR Code WhatsApp" />
                
                <div className="qrcode-instructions">
                  <h5>Como escanear:</h5>
                  <ol>
                    <li>Abra o WhatsApp no celular</li>
                    <li>Toque em <strong>Menu ⋮</strong> ou <strong>Configurações ⚙️</strong></li>
                    <li>Toque em <strong>"Aparelhos conectados"</strong></li>
                    <li>Toque em <strong>"Conectar um aparelho"</strong></li>
                    <li>Aponte a câmera para o QR Code acima</li>
                  </ol>
                </div>

                <p className="qrcode-expiry">
                  ⏱️ QR Code expira em 60 segundos
                </p>

                {/* Auto-refresh toggle */}
                <div className="auto-refresh-toggle">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={autoRefreshQR}
                      onChange={(e) => setAutoRefreshQR(e.target.checked)}
                    />
                    <span>Renovar QR Code automaticamente</span>
                  </label>
                </div>
              </div>
            ) : (
              // BOTÃO PARA GERAR QR CODE
              <button 
                onClick={fetchQRCode} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Gerando...
                  </>
                ) : (
                  '🔄 Gerar QR Code'
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* FOOTER: Info adicional */}
      {lastCheck && (
        <div className="whatsapp-footer">
          <p className="footer-text">
            💡 O status é verificado automaticamente a cada 10 segundos
          </p>
        </div>
      )}
    </div>
  );
};

// =============================================================
// COMPONENTE: Status Badge
// =============================================================
const StatusBadge = ({ status }) => {
  const badges = {
    checking: { 
      label: 'Verificando...', 
      color: 'gray', 
      icon: '🔄' 
    },
    connected: { 
      label: 'Conectado', 
      color: 'green', 
      icon: '✅' 
    },
    disconnected: { 
      label: 'Desconectado', 
      color: 'red', 
      icon: '⚠️' 
    }
  };

  const badge = badges[status] || badges.disconnected;

  return (
    <span className={`status-badge status-${badge.color}`}>
      <span className="status-icon">{badge.icon}</span>
      <span className="status-label">{badge.label}</span>
    </span>
  );
};

// =============================================================
// HELPER: Formatar número de telefone
// =============================================================
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remover @ e domínios
  phone = phone.replace(/@.*/, '');
  
  // Formato: +55 11 99999-9999
  if (phone.startsWith('55') && phone.length >= 12) {
    const ddd = phone.substring(2, 4);
    const part1 = phone.substring(4, 9);
    const part2 = phone.substring(9);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }
  
  return phone;
}

export default WhatsAppQRCode;

// =============================================================
// FIM DO ARQUIVO
// =============================================================

