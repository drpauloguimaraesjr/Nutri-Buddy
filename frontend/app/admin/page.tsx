'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, whatsappAPI } from '@/lib/api';
import {
  Shield,
  Users,
  UserPlus,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Server,
  Database,
  Workflow,
  MessageSquare,
  TrendingUp,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // WhatsApp state
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [whatsappQR, setWhatsappQR] = useState<string | null>(null);
  const [whatsappMessages, setWhatsappMessages] = useState<any[]>([]);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [showWhatsappSection, setShowWhatsappSection] = useState(true);
  const [testMessage, setTestMessage] = useState({ to: '', message: '' });
  
  // Prescriber creation form
  const [creatingPrescriber, setCreatingPrescriber] = useState(false);
  const [prescriberForm, setPrescriberForm] = useState({
    email: '',
    password: '',
    displayName: '',
    specialty: '',
    registrationNumber: '',
    clinicName: ''
  });

  // Check admin access
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        setError('Acesso negado. Apenas administradores podem acessar esta página.');
        setLoading(false);
        return;
      }
      loadData();
    }
  }, [user, isAdmin, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusResponse, statsResponse] = await Promise.all([
        adminAPI.getStatus(),
        adminAPI.getStats({ days: 30 })
      ]);
      setStatus(statusResponse.data.data);
      setStats(statsResponse.data.data);
      setError(null);
      // Load WhatsApp data
      loadWhatsAppData();
    } catch (error: any) {
      console.error('Erro ao carregar dados admin:', error);
      setError(error.response?.data?.error || 'Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppData = async () => {
    try {
      const [statusRes, messagesRes] = await Promise.all([
        whatsappAPI.getStatus(),
        whatsappAPI.getMessages({ limit: 10 })
      ]);
      setWhatsappStatus(statusRes.data);
      setWhatsappMessages(messagesRes.data.messages || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados WhatsApp:', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      setLoadingWhatsapp(true);
      await whatsappAPI.connect();
      alert('✅ Conectando WhatsApp... Aguarde o QR Code aparecer.');
      // Esperar 2 segundos e buscar QR
      setTimeout(async () => {
        try {
          const qrRes = await whatsappAPI.getQR();
          if (qrRes.data.qr) {
            setWhatsappQR(qrRes.data.qr);
            alert('📱 QR Code gerado! Escaneie com seu WhatsApp.');
          }
        } catch (err) {
          console.error('Erro ao obter QR:', err);
        }
      }, 2000);
      loadWhatsAppData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao conectar WhatsApp');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('⚠️ Tem certeza que deseja desconectar o WhatsApp?')) return;
    try {
      setLoadingWhatsapp(true);
      await whatsappAPI.disconnect();
      alert('✅ WhatsApp desconectado!');
      setWhatsappQR(null);
      loadWhatsAppData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao desconectar');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleGetQR = async () => {
    try {
      setLoadingWhatsapp(true);
      const res = await whatsappAPI.getQR();
      if (res.data.qr) {
        setWhatsappQR(res.data.qr);
        alert('📱 QR Code atualizado!');
      } else {
        alert('ℹ️ WhatsApp já está conectado ou QR não disponível.');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao obter QR');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.to || !testMessage.message) {
      alert('⚠️ Preencha o número e a mensagem');
      return;
    }
    try {
      setLoadingWhatsapp(true);
      await whatsappAPI.sendMessage(testMessage);
      alert('✅ Mensagem enviada!');
      setTestMessage({ to: '', message: '' });
      loadWhatsAppData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao enviar mensagem');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleCreatePrescriber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingPrescriber(true);
      await adminAPI.createPrescriber(prescriberForm);
      alert('✅ Prescritor criado com sucesso!');
      setPrescriberForm({
        email: '',
        password: '',
        displayName: '',
        specialty: '',
        registrationNumber: '',
        clinicName: ''
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao criar prescritor');
    } finally {
      setCreatingPrescriber(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="text-center">
          <div className="relative">
            <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-pulse" />
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin absolute top-3 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-slate-600 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (error && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-red-50/30">
        <Card className="max-w-md w-full border-2 border-red-200 shadow-xl">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Acesso Negado</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar para Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-slate-600 mt-1 font-medium">Gerencie o sistema e monitore o status em tempo real</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={loadData} 
            variant="outline" 
            className="flex items-center gap-2 border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* System Status */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Server className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Status do Sistema</h2>
            </div>

            {status ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Users Count */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-bold">{status.users.total}</span>
                    </div>
                    <p className="text-emerald-50 font-semibold mb-3">Total de Usuários</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-emerald-50">Pacientes</span>
                        <span className="font-bold text-lg">{status.users.patients}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-emerald-50">Prescritores</span>
                        <span className="font-bold text-lg">{status.users.prescribers}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-emerald-50">Admins</span>
                        <span className="font-bold text-lg">{status.users.admins}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* N8N Status */}
                <div className="relative">
                  <StatusCard
                    title="N8N"
                    icon={Workflow}
                    isOnline={status.integrations?.n8n?.online}
                    url={status.integrations?.n8n?.url}
                    color="purple"
                  />
                  {!status.integrations?.n8n?.online && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        OFFLINE
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Status */}
                <div className="relative">
                  <StatusCard
                    title="WhatsApp"
                    icon={MessageSquare}
                    isOnline={status.integrations?.whatsapp?.connected}
                    color="green"
                  />
                  {!status.integrations?.whatsapp?.connected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        DESCONECTADO
                      </div>
                    </div>
                  )}
                </div>

                {/* Environment */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Settings className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded uppercase tracking-wider">
                        {status.environment?.nodeEnv || 'development'}
                      </span>
                    </div>
                    <p className="text-blue-50 font-semibold mb-3">Ambiente</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-blue-50">Porta</span>
                        <span className="font-bold">{status.environment?.port || '3000'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-blue-50">Firebase</span>
                        {status.environment?.firebaseConfigured ? (
                          <CheckCircle2 className="w-5 h-5 text-green-300" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-300" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Carregando status...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        {stats && (
          <Card className="bg-white/80 backdrop-blur-sm border-2 shadow-xl">
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-purple-100">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Estatísticas
                  <span className="text-lg font-normal text-slate-600 ml-2">
                    (Últimos {stats.period?.days || 30} dias)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <StatCard
                  icon={Activity}
                  value={stats.activity?.nutritionRecords || 0}
                  label="Registros de Nutrição"
                  color="purple"
                />
                <StatCard
                  icon={Database}
                  value={stats.activity?.meals || 0}
                  label="Refeições Registradas"
                  color="orange"
                />
                <StatCard
                  icon={Workflow}
                  value={stats.activity?.webhooks || 0}
                  label="Webhooks Recebidos"
                  color="blue"
                />
              </div>
            </div>
          </Card>
        )}

        {/* WhatsApp Management */}
        {showWhatsappSection && (
          <Card className="bg-white/80 backdrop-blur-sm border-2 shadow-xl">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    Gerenciar WhatsApp
                  </h2>
                </div>
                <Button
                  onClick={loadWhatsAppData}
                  variant="outline"
                  size="sm"
                  className="border-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>

              {/* Status Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg ${
                  whatsappStatus?.connected
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-gray-500 to-slate-600'
                }`}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      {whatsappStatus?.connected ? (
                        <CheckCircle2 className="w-8 h-8 text-green-200" />
                      ) : (
                        <XCircle className="w-8 h-8 text-gray-200" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {whatsappStatus?.connected ? 'Conectado' : 'Desconectado'}
                    </h3>
                    <p className="text-sm opacity-90">
                      Status: {whatsappStatus?.status || 'N/A'}
                    </p>
                    {whatsappStatus?.hasQr && !whatsappStatus?.connected && (
                      <p className="text-sm opacity-90 mt-1">
                        QR Code disponível - Clique em "Obter QR Code"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 space-y-3">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Ações</h3>
                  
                  {!whatsappStatus?.connected ? (
                    <>
                      <Button
                        onClick={handleConnectWhatsApp}
                        disabled={loadingWhatsapp}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loadingWhatsapp ? (
                          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Conectando...</>
                        ) : (
                          <><MessageSquare className="w-4 h-4 mr-2" />Conectar WhatsApp</>
                        )}
                      </Button>
                      <Button
                        onClick={handleGetQR}
                        disabled={loadingWhatsapp}
                        variant="outline"
                        className="w-full"
                      >
                        Obter QR Code
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleDisconnectWhatsApp}
                      disabled={loadingWhatsapp}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {loadingWhatsapp ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Desconectando...</>
                      ) : (
                        <><XCircle className="w-4 h-4 mr-2" />Desconectar</>
                      )}
                    </Button>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-600">
                      💡 Use o WhatsApp conectado para receber mensagens de pacientes e enviar análises automáticas de alimentos via IA.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              {whatsappQR && !whatsappStatus?.connected && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      📱 Escaneie o QR Code com seu WhatsApp
                    </h3>
                    <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappQR)}`}
                        alt="QR Code WhatsApp"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="space-y-2 text-sm text-slate-700 max-w-md mx-auto">
                      <p className="font-semibold">Como escanear:</p>
                      <ol className="text-left space-y-1">
                        <li>1. Abra o WhatsApp no celular</li>
                        <li>2. Menu → Aparelhos Conectados</li>
                        <li>3. Conectar um Aparelho</li>
                        <li>4. Escaneie este QR Code</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Test Message */}
              {whatsappStatus?.connected && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Enviar Mensagem de Teste
                  </h3>
                  <form onSubmit={handleSendTestMessage} className="space-y-4">
                    <Input
                      label="Número (formato: 5511999999999@s.whatsapp.net)"
                      type="text"
                      value={testMessage.to}
                      onChange={(e) => setTestMessage({ ...testMessage, to: e.target.value })}
                      placeholder="5511999999999@s.whatsapp.net"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Mensagem
                      </label>
                      <textarea
                        value={testMessage.message}
                        onChange={(e) => setTestMessage({ ...testMessage, message: e.target.value })}
                        placeholder="Digite sua mensagem..."
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loadingWhatsapp}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loadingWhatsapp ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                      ) : (
                        <>Enviar Mensagem</>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Recent Messages */}
              {whatsappMessages.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    📨 Mensagens Recentes (Últimas 10)
                  </h3>
                  <div className="space-y-3">
                    {whatsappMessages.map((msg: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          msg.type === 'sent'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-600">
                            {msg.type === 'sent' ? '📤 Enviada' : '📥 Recebida'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-1">
                          <strong>{msg.type === 'sent' ? 'Para:' : 'De:'}</strong>{' '}
                          {msg.type === 'sent' ? msg.to : msg.from}
                        </p>
                        <p className="text-sm text-slate-900">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 mt-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-emerald-900">
                    <p className="font-bold text-base mb-2">💡 Sobre o WhatsApp Bot</p>
                    <ul className="space-y-2 list-none">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>Pacientes podem enviar fotos de alimentos e a IA analisa automaticamente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>Comandos: "menu", "resumo", "Bebi 500ml", "Fiz 30min corrida"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>Integração com Strava para importar atividades</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>Vincule pacientes adicionando campo "whatsapp" no Firestore</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Create Prescriber */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-emerald-100">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Criar Novo Prescritor</h2>
            </div>

            <form onSubmit={handleCreatePrescriber} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Email *"
                  type="email"
                  required
                  value={prescriberForm.email}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, email: e.target.value })}
                  placeholder="prescritor@exemplo.com"
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Input
                  label="Senha *"
                  type="password"
                  required
                  value={prescriberForm.password}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Input
                  label="Nome Completo"
                  type="text"
                  value={prescriberForm.displayName}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, displayName: e.target.value })}
                  placeholder="Dr. João Silva"
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Input
                  label="Especialidade"
                  type="text"
                  value={prescriberForm.specialty}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, specialty: e.target.value })}
                  placeholder="Nutricionista"
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Input
                  label="Número de Registro (CRN)"
                  type="text"
                  value={prescriberForm.registrationNumber}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, registrationNumber: e.target.value })}
                  placeholder="CRN-12345"
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Input
                  label="Nome da Clínica"
                  type="text"
                  value={prescriberForm.clinicName}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, clinicName: e.target.value })}
                  placeholder="Clínica Nutrição e Saúde"
                  className="bg-white border-2 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-bold text-base mb-2">📋 Informações Importantes</p>
                    <ul className="space-y-2 list-none">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Se o email já existe, o usuário será atualizado para prescritor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>A senha será definida apenas se criar um novo usuário</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>O prescritor receberá um email para verificar a conta</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={creatingPrescriber}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                {creatingPrescriber ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Criando Prescritor...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Prescritor
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Error message */}
        {error && (
          <Card className="border-2 border-red-300 bg-red-50/80 backdrop-blur-sm shadow-xl">
            <div className="p-5">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <span className="font-bold">Erro: </span>
                  <span>{error}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({ title, icon: Icon, isOnline, url, color }: {
  title: string;
  icon: any;
  isOnline?: boolean;
  url?: string;
  color: 'purple' | 'green' | 'blue';
}) {
  const colorClasses = {
    purple: {
      bg: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-white/20',
      text: 'text-purple-50',
      status: isOnline ? 'text-green-300' : 'text-red-300'
    },
    green: {
      bg: 'from-green-500 to-emerald-600',
      iconBg: 'bg-white/20',
      text: 'text-green-50',
      status: isOnline ? 'text-green-300' : 'text-red-300'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-white/20',
      text: 'text-blue-50',
      status: isOnline ? 'text-green-300' : 'text-red-300'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.bg} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.iconBg} backdrop-blur-sm`}>
            <Icon className="w-6 h-6" />
          </div>
          {isOnline ? (
            <CheckCircle2 className={`w-6 h-6 ${colors.status}`} />
          ) : (
            <XCircle className={`w-6 h-6 ${colors.status}`} />
          )}
        </div>
        <p className={`${colors.text} font-semibold mb-2 text-lg`}>{title}</p>
        <p className={`text-sm ${colors.text} opacity-90`}>
          {isOnline ? 'Conectado' : 'Desconectado'}
        </p>
        {url && (
          <p className="text-xs mt-2 opacity-75 truncate">{url}</p>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, value, label, color }: {
  icon: any;
  value: number;
  label: string;
  color: 'purple' | 'orange' | 'blue';
}) {
  const colorClasses = {
    purple: {
      bg: 'from-purple-500 to-pink-600',
      iconBg: 'bg-white/20',
      text: 'text-purple-50'
    },
    orange: {
      bg: 'from-orange-500 to-red-600',
      iconBg: 'bg-white/20',
      text: 'text-orange-50'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-white/20',
      text: 'text-blue-50'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.bg} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.iconBg} backdrop-blur-sm`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-4xl font-bold">{value}</span>
        </div>
        <p className={`${colors.text} font-semibold`}>{label}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
