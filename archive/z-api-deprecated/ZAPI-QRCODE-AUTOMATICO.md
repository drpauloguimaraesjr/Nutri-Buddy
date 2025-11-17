# 📱 ZAPI - QR CODE AUTOMÁTICO NO SEU SISTEMA

## 🎯 **OBJETIVO**

Integrar o QR Code do WhatsApp diretamente no seu sistema NutriBuddy, permitindo:
- ✅ Ver status da conexão em tempo real
- ✅ Gerar QR Code automaticamente quando desconectar
- ✅ Escanear direto pelo sistema (sem acessar Z-API)
- ✅ Notificações automáticas quando desconectar
- ✅ Integração com Kanban

---

## 📋 **ARQUITETURA DA SOLUÇÃO**

```
┌─────────────────────────────────────────────────────┐
│               FRONTEND (React/Next.js)              │
│  ┌──────────────────┐    ┌───────────────────────┐ │
│  │ Componente QR    │    │  Kanban Status Card   │ │
│  │ Code             │    │  (WhatsApp Status)    │ │
│  └──────────────────┘    └───────────────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP Requests
┌───────────────────────▼─────────────────────────────┐
│              BACKEND (Node.js/Railway)              │
│  ┌──────────────────────────────────────────────┐   │
│  │ Endpoints:                                   │   │
│  │ - GET /api/whatsapp/qrcode                  │   │
│  │ - GET /api/whatsapp/status                  │   │
│  │ - POST /api/whatsapp/disconnect             │   │
│  │ - POST /api/webhooks/zapi-status            │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS Requests
┌───────────────────────▼─────────────────────────────┐
│                   Z-API SERVICE                     │
│  - Gerenciar instância WhatsApp                    │
│  - Gerar QR Code                                   │
│  - Monitorar status de conexão                     │
│  - Enviar/receber mensagens                        │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **PASSO 1: CONFIGURAR Z-API PARA QR CODE**

### **1.1. Criar instância Z-API**

Se ainda não criou, siga: `ZAPI-SETUP-COMPLETO.md`

### **1.2. Anotar credenciais**

```bash
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io
```

### **1.3. Configurar webhook de status (IMPORTANTE!)**

No Dashboard Z-API:
```
1. Sua instância → Webhooks
2. Ativar "Status de Conexão"
3. URL: https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-status
4. Eventos:
   ✅ connection.update (quando conecta/desconecta)
   ✅ qrcode.updated (quando QR Code muda)
5. Salvar
```

---

## 💻 **PASSO 2: BACKEND - ENDPOINTS COMPLETOS**

Adicione estes endpoints no seu backend Railway.

### **2.1. Arquivo: `whatsapp-service.js`**

Crie um novo arquivo com todas as funções Z-API:

```javascript
// =============================================================
// WHATSAPP SERVICE - Z-API INTEGRATION
// =============================================================
const axios = require('axios');

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_BASE_URL = process.env.ZAPI_BASE_URL || 'https://api.z-api.io';

const ZAPI_URL = `${ZAPI_BASE_URL}/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;

// =============================================================
// 1. OBTER QR CODE (IMAGE)
// =============================================================
async function getQRCodeImage() {
  try {
    const response = await axios.get(`${ZAPI_URL}/qr-code/image`, {
      headers: { 'Client-Token': ZAPI_TOKEN },
      responseType: 'arraybuffer'
    });

    return {
      success: true,
      image: Buffer.from(response.data, 'binary')
    };
  } catch (error) {
    console.error('Erro ao obter QR Code:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// =============================================================
// 2. OBTER QR CODE (BASE64)
// =============================================================
async function getQRCodeBase64() {
  try {
    const response = await axios.get(`${ZAPI_URL}/qr-code/image`, {
      headers: { 'Client-Token': ZAPI_TOKEN },
      responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    return {
      success: true,
      qrCode: `data:image/png;base64,${base64}`,
      expiresIn: 60 // segundos
    };
  } catch (error) {
    console.error('Erro ao obter QR Code:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      needsReconnect: error.response?.status === 401
    };
  }
}

// =============================================================
// 3. VERIFICAR STATUS DA CONEXÃO
// =============================================================
async function getConnectionStatus() {
  try {
    const response = await axios.get(`${ZAPI_URL}/status`, {
      headers: { 'Client-Token': ZAPI_TOKEN }
    });

    const data = response.data;

    return {
      success: true,
      connected: data.connected || false,
      phone: data.phone || null,
      status: data.state || data.status,
      instanceId: ZAPI_INSTANCE_ID
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error.message);
    return {
      success: false,
      connected: false,
      error: error.message
    };
  }
}

// =============================================================
// 4. DESCONECTAR WHATSAPP
// =============================================================
async function disconnectWhatsApp() {
  try {
    const response = await axios.delete(`${ZAPI_URL}/logout`, {
      headers: { 'Client-Token': ZAPI_TOKEN }
    });

    return {
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao desconectar:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================
// 5. REINICIAR INSTÂNCIA (para reconectar)
// =============================================================
async function restartInstance() {
  try {
    const response = await axios.post(`${ZAPI_URL}/restart`, {}, {
      headers: { 'Client-Token': ZAPI_TOKEN }
    });

    return {
      success: true,
      message: 'Instância reiniciada. QR Code disponível em ~10 segundos.'
    };
  } catch (error) {
    console.error('Erro ao reiniciar instância:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getQRCodeImage,
  getQRCodeBase64,
  getConnectionStatus,
  disconnectWhatsApp,
  restartInstance
};
```

### **2.2. Arquivo: `whatsapp-routes.js`**

Rotas Express para o frontend chamar:

```javascript
// =============================================================
// WHATSAPP ROUTES - ENDPOINTS
// =============================================================
const express = require('express');
const router = express.Router();
const whatsappService = require('./whatsapp-service');
const admin = require('./firebase-admin'); // seu firebase existente
const db = admin.firestore();

// =============================================================
// GET /api/whatsapp/qrcode - Retornar QR Code como imagem
// =============================================================
router.get('/qrcode', async (req, res) => {
  try {
    const result = await whatsappService.getQRCodeImage();

    if (result.success) {
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'no-cache');
      res.send(result.image);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro no endpoint /qrcode:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// GET /api/whatsapp/qrcode-base64 - Retornar QR Code como base64
// =============================================================
router.get('/qrcode-base64', async (req, res) => {
  try {
    const result = await whatsappService.getQRCodeBase64();

    res.json(result);
  } catch (error) {
    console.error('Erro no endpoint /qrcode-base64:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// GET /api/whatsapp/status - Status da conexão WhatsApp
// =============================================================
router.get('/status', async (req, res) => {
  try {
    const result = await whatsappService.getConnectionStatus();

    res.json(result);
  } catch (error) {
    console.error('Erro no endpoint /status:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/disconnect - Desconectar WhatsApp
// =============================================================
router.post('/disconnect', async (req, res) => {
  try {
    // Verificar autenticação (opcional)
    // const userId = req.user?.id;
    // const user = await getUserById(userId);
    // if (user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Não autorizado' });
    // }

    const result = await whatsappService.disconnectWhatsApp();

    res.json(result);
  } catch (error) {
    console.error('Erro no endpoint /disconnect:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/restart - Reiniciar instância
// =============================================================
router.post('/restart', async (req, res) => {
  try {
    const result = await whatsappService.restartInstance();

    res.json(result);
  } catch (error) {
    console.error('Erro no endpoint /restart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/webhooks/zapi-status - Webhook de status Z-API
// =============================================================
router.post('/webhooks/zapi-status', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API Status:', JSON.stringify(req.body, null, 2));

    const { event, state, status, phone, qrcode } = req.body;

    // Salvar evento no Firestore para histórico
    await db.collection('whatsappEvents').add({
      event,
      state,
      status,
      phone,
      hasQrCode: !!qrcode,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Atualizar status geral no Firestore
    await db.collection('systemConfig').doc('whatsapp').set({
      connected: state === 'CONNECTED' || status === 'open',
      phone: phone || null,
      lastEvent: event,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // TODO: Enviar notificação para frontend via WebSocket/Firebase
    // notifyAdmin({ type: 'whatsapp_status', connected: state === 'CONNECTED' });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook zapi-status:', error);
    res.status(200).json({ received: true, error: error.message });
  }
});

module.exports = router;
```

### **2.3. Integrar no `server.js` ou `index.js`**

```javascript
// server.js (seu arquivo principal)
const express = require('express');
const app = express();

// ... seus middlewares existentes ...

// Adicionar rotas WhatsApp
const whatsappRoutes = require('./whatsapp-routes');
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/webhooks', whatsappRoutes); // para o webhook

// ... resto do código ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
```

---

## 🎨 **PASSO 3: FRONTEND - COMPONENTE QR CODE**

### **3.1. Componente React: `WhatsAppQRCode.jsx`**

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import './WhatsAppQRCode.css';

const WhatsAppQRCode = () => {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('checking'); // checking, connected, disconnected
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://web-production-c9eaf.up.railway.app';

  // =======================================================
  // Verificar status da conexão
  // =======================================================
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      const data = await response.json();

      if (data.success) {
        setStatus(data.connected ? 'connected' : 'disconnected');
        setPhoneNumber(data.phone);
        setLastCheck(new Date());

        // Se conectou, limpar QR Code
        if (data.connected) {
          setQrCode(null);
          setError(null);
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

  // =======================================================
  // Buscar QR Code
  // =======================================================
  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/qrcode-base64`);
      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        
        // QR Code expira em 60 segundos, buscar novamente após esse tempo
        setTimeout(() => {
          if (status !== 'connected') {
            fetchQRCode();
          }
        }, 60000);
      } else {
        setError(data.error || 'Erro ao gerar QR Code');
        
        // Se precisa reconectar, oferecer botão
        if (data.needsReconnect) {
          setError('Instância precisa ser reiniciada');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // Reiniciar instância
  // =======================================================
  const restartInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/restart`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        // Aguardar 10 segundos e buscar QR Code
        setTimeout(() => {
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

  // =======================================================
  // Desconectar WhatsApp
  // =======================================================
  const disconnectWhatsApp = async () => {
    if (!window.confirm('Deseja realmente desconectar o WhatsApp?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/disconnect`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setStatus('disconnected');
        setPhoneNumber(null);
        setQrCode(null);
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

  // =======================================================
  // Verificar status automaticamente a cada 10 segundos
  // =======================================================
  useEffect(() => {
    checkStatus(); // Primeira verificação

    const interval = setInterval(checkStatus, 10000); // A cada 10s

    return () => clearInterval(interval);
  }, [checkStatus]);

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <div className="whatsapp-qrcode-container">
      <div className="whatsapp-header">
        <h3>📱 WhatsApp Connection</h3>
        <StatusBadge status={status} />
      </div>

      <div className="whatsapp-content">
        {status === 'checking' && (
          <div className="status-checking">
            <div className="spinner"></div>
            <p>Verificando conexão...</p>
          </div>
        )}

        {status === 'connected' && (
          <div className="status-connected">
            <div className="success-icon">✅</div>
            <h4>WhatsApp Conectado</h4>
            {phoneNumber && (
              <p className="phone-number">📞 {phoneNumber}</p>
            )}
            {lastCheck && (
              <p className="last-check">
                Última verificação: {lastCheck.toLocaleTimeString()}
              </p>
            )}
            <button 
              onClick={disconnectWhatsApp} 
              disabled={loading}
              className="btn btn-danger"
            >
              Desconectar
            </button>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="status-disconnected">
            <div className="warning-icon">⚠️</div>
            <h4>WhatsApp Desconectado</h4>
            <p>Escaneie o QR Code para conectar</p>

            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
                {error.includes('reiniciada') && (
                  <button 
                    onClick={restartInstance} 
                    disabled={loading}
                    className="btn btn-warning"
                  >
                    Reiniciar Instância
                  </button>
                )}
              </div>
            )}

            {qrCode ? (
              <div className="qrcode-display">
                <img src={qrCode} alt="QR Code WhatsApp" />
                <div className="qrcode-instructions">
                  <h5>Como escanear:</h5>
                  <ol>
                    <li>Abra o WhatsApp no celular</li>
                    <li>Toque em Menu ⋮ ou Configurações</li>
                    <li>Toque em "Aparelhos conectados"</li>
                    <li>Toque em "Conectar um aparelho"</li>
                    <li>Aponte para o QR Code acima</li>
                  </ol>
                </div>
                <p className="qrcode-expiry">
                  ⏱️ QR Code expira em 60 segundos
                </p>
              </div>
            ) : (
              <button 
                onClick={fetchQRCode} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Gerando...' : 'Gerar QR Code'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =======================================================
// Componente auxiliar: Badge de status
// =======================================================
const StatusBadge = ({ status }) => {
  const badges = {
    checking: { label: 'Verificando...', color: 'gray', icon: '🔄' },
    connected: { label: 'Conectado', color: 'green', icon: '✅' },
    disconnected: { label: 'Desconectado', color: 'red', icon: '⚠️' }
  };

  const badge = badges[status] || badges.disconnected;

  return (
    <span className={`status-badge status-${badge.color}`}>
      <span className="status-icon">{badge.icon}</span>
      <span className="status-label">{badge.label}</span>
    </span>
  );
};

export default WhatsAppQRCode;
```

### **3.2. CSS: `WhatsAppQRCode.css`**

```css
/* WhatsApp QR Code Component Styles */

.whatsapp-qrcode-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 500px;
  margin: 20px auto;
}

.whatsapp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.whatsapp-header h3 {
  margin: 0;
  font-size: 20px;
  color: #25D366; /* WhatsApp green */
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.status-green {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.status-red {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.status-gray {
  background-color: #e2e3e5;
  color: #383d41;
}

/* Content */
.whatsapp-content {
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Checking State */
.status-checking {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #25D366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Connected State */
.status-connected {
  padding: 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.status-connected h4 {
  color: #155724;
  margin: 16px 0 8px 0;
  font-size: 24px;
}

.phone-number {
  font-size: 18px;
  color: #666;
  margin: 8px 0;
  font-weight: 500;
}

.last-check {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* Disconnected State */
.status-disconnected {
  padding: 20px;
}

.warning-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.status-disconnected h4 {
  color: #721c24;
  margin: 16px 0 8px 0;
  font-size: 24px;
}

.status-disconnected p {
  color: #666;
  margin: 8px 0;
}

/* QR Code Display */
.qrcode-display {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.qrcode-display img {
  max-width: 300px;
  width: 100%;
  height: auto;
  border: 4px solid white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-instructions {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  text-align: left;
}

.qrcode-instructions h5 {
  margin: 0 0 12px 0;
  color: #25D366;
  font-size: 16px;
}

.qrcode-instructions ol {
  margin: 0;
  padding-left: 20px;
}

.qrcode-instructions li {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.qrcode-expiry {
  margin-top: 12px;
  font-size: 13px;
  color: #ff6b6b;
  font-weight: 600;
}

/* Error Message */
.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
}

.error-message p {
  color: #721c24;
  margin: 0 0 12px 0;
  font-size: 14px;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #25D366;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1da851;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .whatsapp-qrcode-container {
    margin: 10px;
    padding: 16px;
  }

  .whatsapp-header h3 {
    font-size: 18px;
  }

  .qrcode-display img {
    max-width: 250px;
  }

  .success-icon,
  .warning-icon {
    font-size: 48px;
  }
}
```

---

## 📊 **PASSO 4: INTEGRAÇÃO COM KANBAN**

### **4.1. Card de Status no Kanban: `WhatsAppStatusCard.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import './WhatsAppStatusCard.css';

const WhatsAppStatusCard = ({ onOpenQRCode }) => {
  const [status, setStatus] = useState('checking');
  const [phoneNumber, setPhoneNumber] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://web-production-c9eaf.up.railway.app';

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/whatsapp/status`);
        const data = await response.json();

        setStatus(data.connected ? 'connected' : 'disconnected');
        setPhoneNumber(data.phone);
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setStatus('disconnected');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // A cada 30s

    return () => clearInterval(interval);
  }, [API_BASE]);

  return (
    <div className={`kanban-card whatsapp-status-card status-${status}`}>
      <div className="card-icon">
        {status === 'connected' ? '✅' : '⚠️'}
      </div>
      
      <div className="card-content">
        <h4>WhatsApp</h4>
        {status === 'connected' ? (
          <>
            <p className="status-text connected">Conectado</p>
            {phoneNumber && (
              <p className="phone-mini">{phoneNumber}</p>
            )}
          </>
        ) : (
          <>
            <p className="status-text disconnected">Desconectado</p>
            <button 
              onClick={onOpenQRCode}
              className="btn-reconnect"
            >
              Conectar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppStatusCard;
```

### **4.2. CSS: `WhatsAppStatusCard.css`**

```css
.whatsapp-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #25D366;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.whatsapp-status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.whatsapp-status-card.status-disconnected {
  border-left-color: #dc3545;
}

.card-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0;
}

.status-text.connected {
  color: #155724;
}

.status-text.disconnected {
  color: #721c24;
}

.phone-mini {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
}

.btn-reconnect {
  margin-top: 8px;
  padding: 6px 12px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reconnect:hover {
  background: #1da851;
}
```

### **4.3. Integrar no Kanban**

```jsx
// No seu componente Kanban principal
import React, { useState } from 'react';
import WhatsAppStatusCard from './WhatsAppStatusCard';
import WhatsAppQRCode from './WhatsAppQRCode';
import Modal from './Modal';

const KanbanBoard = () => {
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  return (
    <div className="kanban-board">
      {/* Sidebar ou Header com status */}
      <div className="kanban-sidebar">
        <WhatsAppStatusCard 
          onOpenQRCode={() => setShowQRCodeModal(true)}
        />
        
        {/* Outros cards do Kanban */}
      </div>

      {/* Colunas do Kanban */}
      <div className="kanban-columns">
        {/* Suas colunas aqui */}
      </div>

      {/* Modal QR Code */}
      {showQRCodeModal && (
        <Modal onClose={() => setShowQRCodeModal(false)}>
          <WhatsAppQRCode />
        </Modal>
      )}
    </div>
  );
};

export default KanbanBoard;
```

---

## ⚙️ **PASSO 5: CONFIGURAR RAILWAY**

### **5.1. Variáveis de ambiente**

No Railway, adicionar:

```bash
# Z-API Credentials
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io

# Frontend URL (para CORS)
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### **5.2. Instalar dependências**

```bash
npm install axios
```

### **5.3. Deploy**

```bash
git add .
git commit -m "feat: Adicionar integração Z-API com QR Code automático"
git push
```

---

## 🧪 **PASSO 6: TESTAR**

### **6.1. Testar status**

```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status
```

Resposta esperada:
```json
{
  "success": true,
  "connected": false,
  "phone": null,
  "status": "close",
  "instanceId": "12345"
}
```

### **6.2. Testar QR Code**

Abrir no navegador:
```
https://web-production-c9eaf.up.railway.app/api/whatsapp/qrcode
```

Deve aparecer imagem do QR Code.

### **6.3. Testar frontend**

1. Abrir seu sistema
2. Ver card de status do WhatsApp
3. Clicar em "Conectar"
4. Ver modal com QR Code
5. Escanear com WhatsApp
6. Ver status mudar para "Conectado" ✅

---

## ✅ **CHECKLIST COMPLETO**

### **Backend:**
- [ ] Criar arquivo `whatsapp-service.js`
- [ ] Criar arquivo `whatsapp-routes.js`
- [ ] Integrar rotas no `server.js`
- [ ] Adicionar variáveis no Railway
- [ ] Instalar `axios`
- [ ] Deploy no Railway
- [ ] Testar endpoint `/api/whatsapp/status`
- [ ] Testar endpoint `/api/whatsapp/qrcode`

### **Frontend:**
- [ ] Criar componente `WhatsAppQRCode.jsx`
- [ ] Criar CSS `WhatsAppQRCode.css`
- [ ] Criar componente `WhatsAppStatusCard.jsx`
- [ ] Criar CSS `WhatsAppStatusCard.css`
- [ ] Integrar no Kanban
- [ ] Testar abertura do modal
- [ ] Testar geração do QR Code
- [ ] Testar conexão do WhatsApp

### **Z-API:**
- [ ] Configurar webhook de status
- [ ] URL: `https://seu-backend/api/webhooks/zapi-status`
- [ ] Ativar evento `connection.update`
- [ ] Testar recebimento do webhook

### **Testes finais:**
- [ ] QR Code aparece automaticamente
- [ ] Escanear QR Code funciona
- [ ] Status atualiza para "Conectado"
- [ ] Card do Kanban atualiza
- [ ] Desconectar funciona
- [ ] Reconectar funciona

---

## 🎉 **PRONTO!**

Agora você tem:
- ✅ QR Code automático no seu sistema
- ✅ Status em tempo real
- ✅ Integração com Kanban
- ✅ Notificações de desconexão
- ✅ Controle completo do WhatsApp

**Qualquer dúvida, me chame! 🚀**

