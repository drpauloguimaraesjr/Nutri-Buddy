const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Criar diretório para armazenar auth state
const authFolder = path.join(__dirname, '../whatsapp_auth');
if (!fs.existsSync(authFolder)) {
  fs.mkdirSync(authFolder, { recursive: true });
}

/**
 * Serviço de Integração WhatsApp usando Baileys
 * Gerencia conexão, envio e recebimento de mensagens
 */
class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.qrCode = null;
    this.connectionStatus = 'disconnected';
    this.messageHandlers = [];
    this.baileys = null; // Cache do módulo Baileys importado dinamicamente
  }

  /**
   * Carrega o módulo Baileys dinamicamente (ESM)
   */
  async loadBaileys() {
    if (!this.baileys) {
      this.baileys = await import('@whiskeysockets/baileys');
    }
    return this.baileys;
  }

  /**
   * Inicializa conexão com WhatsApp
   */
  async connect() {
    try {
      console.log('🔄 Iniciando conexão WhatsApp...');

      // Carregar módulo Baileys dinamicamente
      const baileys = await this.loadBaileys();
      const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = baileys;

      // Obter versão mais recente do Baileys
      const { version } = await fetchLatestBaileysVersion();
      console.log(`📱 Usando versão WhatsApp: ${version.join('.')}`);

      // Carregar estado de autenticação
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);

      // Criar socket WhatsApp
      this.sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Silenciar logs do Baileys
        printQRInTerminal: true,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
      });

      // Eventos de conexão
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // QR Code gerado
        if (qr) {
          console.log('📱 QR Code gerado! Escaneie com seu WhatsApp');
          this.qrCode = qr;
        }

        // Status da conexão
        if (connection) {
          console.log(`🔗 Status da conexão: ${connection}`);
          this.connectionStatus = connection;
          
          if (connection === 'open') {
            console.log('✅ WhatsApp conectado com sucesso!');
            this.isConnected = true;
          } else if (connection === 'close') {
            console.log('❌ WhatsApp desconectado');
            this.isConnected = false;
          }
        }

        // Reconexão automática em caso de desconexão
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
          console.log('🔄 Sessão expirada, apagando credenciais...');
          this.cleanAuth();
          this.connect();
        } else if (lastDisconnect?.error) {
          console.log('🔄 Reconectando...');
          setTimeout(() => this.connect(), 3000);
        }
      });

      // Salvar credenciais automaticamente
      this.sock.ev.on('creds.update', saveCreds);

      // Mensagens recebidas
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
          for (const message of messages) {
            await this.handleIncomingMessage(message);
          }
        }
      });

      console.log('✅ WhatsApp Service inicializado!');
      return { success: true, qr: this.qrCode };

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Processa mensagens recebidas
   */
  async handleIncomingMessage(message) {
    try {
      // Ignorar mensagens de status
      if (message.key.fromMe || !message.message) {
        return;
      }

      const messageContent = this.extractMessageContent(message.message);
      const from = message.key.remoteJid;
      const timestamp = message.messageTimestamp;

      console.log(`📩 Mensagem recebida de ${from}: ${messageContent}`);

      // Chamar handlers registrados
      for (const handler of this.messageHandlers) {
        try {
          await handler({ from, message: messageContent, timestamp, raw: message });
        } catch (error) {
          console.error('❌ Erro no handler:', error);
        }
      }

      // Salvar mensagens recebidas no Firebase
      try {
        const { db, admin } = require('../config/firebase');
        await db.collection('whatsapp_messages').add({
          type: 'received',
          from,
          message: messageContent,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          success: true
        });
      } catch (error) {
        console.error('Erro ao salvar mensagem no Firebase:', error);
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  /**
   * Extrai conteúdo de uma mensagem
   */
  extractMessageContent(message) {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.audioMessage) return '[AUDIO]';
    if (message.documentMessage) return '[DOCUMENTO]';
    if (message.stickerMessage) return '[FIGURINHA]';
    return '[MENSAGEM SEM TEXTO]';
  }

  /**
   * Envia mensagem de texto
   */
  async sendTextMessage(to, text) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      console.log(`📤 Enviando mensagem para ${to}`);
      
      await this.sock.sendMessage(to, { text });
      
      console.log('✅ Mensagem enviada com sucesso');
      return { success: true, to, message: text };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem com imagem
   */
  async sendImageMessage(to, imageUrl, caption = '') {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      console.log(`📤 Enviando imagem para ${to}`);
      
      await this.sock.sendMessage(to, {
        image: { url: imageUrl },
        caption: caption
      });
      
      console.log('✅ Imagem enviada com sucesso');
      return { success: true, to, type: 'image' };

    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      throw error;
    }
  }

  /**
   * Baixa mídia de uma mensagem (imagem, vídeo, áudio, etc)
   */
  async downloadMediaMessage(message) {
    try {
      if (!this.sock) {
        throw new Error('WhatsApp não está conectado');
      }

      const baileys = await this.loadBaileys();
      const { downloadMediaMessage } = baileys;

      // Extrair informações da mídia
      let mediaMessage = null;
      if (message.message?.imageMessage) {
        mediaMessage = message.message.imageMessage;
      } else if (message.message?.videoMessage) {
        mediaMessage = message.message.videoMessage;
      } else if (message.message?.audioMessage) {
        mediaMessage = message.message.audioMessage;
      } else if (message.message?.documentMessage) {
        mediaMessage = message.message.documentMessage;
      }

      if (!mediaMessage) {
        throw new Error('Mensagem não contém mídia');
      }

      // Baixar mídia
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {},
        {
          logger: pino({ level: 'silent' }),
          reuploadRequest: this.sock.updateMediaMessage
        }
      );

      return buffer;

    } catch (error) {
      console.error('❌ Erro ao baixar mídia:', error);
      throw error;
    }
  }

  /**
   * Verifica status da conexão
   */
  getStatus() {
    return {
      connected: this.isConnected,
      status: this.connectionStatus,
      hasQr: !!this.qrCode
    };
  }

  /**
   * Obtém QR Code atual
   */
  getQrCode() {
    return this.qrCode;
  }

  /**
   * Registra handler para mensagens recebidas
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * Limpa autenticação salva
   */
  cleanAuth() {
    try {
      if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
        console.log('🗑️ Credenciais removidas');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar auth:', error);
    }
  }

  /**
   * Desconecta WhatsApp
   */
  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.end(undefined);
        this.sock = null;
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        console.log('👋 WhatsApp desconectado');
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }
}

// Singleton instance
let whatsappInstance = null;

/**
 * Obtém instância única do serviço WhatsApp
 */
function getWhatsAppService() {
  if (!whatsappInstance) {
    whatsappInstance = new WhatsAppService();
  }
  return whatsappInstance;
}

module.exports = {
  WhatsAppService,
  getWhatsAppService
};
