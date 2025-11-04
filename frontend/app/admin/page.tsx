'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
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
  Settings
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
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
    } catch (error: any) {
      console.error('Erro ao carregar dados admin:', error);
      setError(error.response?.data?.error || 'Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (error && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>Voltar para Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-10 h-10 text-emerald-600" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">Gerencie o sistema e monitore o status</p>
          </div>
          <Button onClick={loadData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* System Status */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-semibold">Status do Sistema</h2>
            </div>

            {status ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users Count */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-900">{status.users.total}</span>
                  </div>
                  <p className="text-sm text-emerald-700">Total de Usuários</p>
                  <div className="mt-2 text-xs text-emerald-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Pacientes:</span>
                      <span className="font-semibold">{status.users.patients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prescritores:</span>
                      <span className="font-semibold">{status.users.prescribers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admins:</span>
                      <span className="font-semibold">{status.users.admins}</span>
                    </div>
                  </div>
                </div>

                {/* N8N Status */}
                <div className={`rounded-lg p-4 border ${
                  status.integrations?.n8n?.online
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Workflow className={`w-5 h-5 ${
                      status.integrations?.n8n?.online ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    {status.integrations?.n8n?.online ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">N8N</p>
                  <p className={`text-xs ${
                    status.integrations?.n8n?.online ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    {status.integrations?.n8n?.online ? 'Conectado' : 'Desconectado'}
                  </p>
                  {status.integrations?.n8n?.url && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{status.integrations.n8n.url}</p>
                  )}
                </div>

                {/* WhatsApp Status */}
                <div className={`rounded-lg p-4 border ${
                  status.integrations?.whatsapp?.connected
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className={`w-5 h-5 ${
                      status.integrations?.whatsapp?.connected ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    {status.integrations?.whatsapp?.connected ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">WhatsApp</p>
                  <p className={`text-xs ${
                    status.integrations?.whatsapp?.connected ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {status.integrations?.whatsapp?.connected ? 'Conectado' : 'Desconectado'}
                  </p>
                </div>

                {/* Environment */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900 uppercase">
                      {status.environment?.nodeEnv || 'development'}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">Ambiente</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Porta:</span>
                      <span className="font-semibold">{status.environment?.port || '3000'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firebase:</span>
                      {status.environment?.firebaseConfigured ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 inline" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Carregando status...</p>
            )}
          </div>
        </Card>

        {/* Statistics */}
        {stats && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-semibold">Estatísticas (Últimos {stats.period?.days || 30} dias)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-900">{stats.activity?.nutritionRecords || 0}</span>
                  </div>
                  <p className="text-sm text-purple-700">Registros de Nutrição</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-900">{stats.activity?.meals || 0}</span>
                  </div>
                  <p className="text-sm text-orange-700">Refeições Registradas</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">{stats.activity?.webhooks || 0}</span>
                  </div>
                  <p className="text-sm text-blue-700">Webhooks Recebidos</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Create Prescriber */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-semibold">Criar Novo Prescritor</h2>
            </div>

            <form onSubmit={handleCreatePrescriber} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  required
                  value={prescriberForm.email}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, email: e.target.value })}
                  placeholder="prescritor@exemplo.com"
                />
                <Input
                  label="Senha *"
                  type="password"
                  required
                  value={prescriberForm.password}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <Input
                  label="Nome Completo"
                  type="text"
                  value={prescriberForm.displayName}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, displayName: e.target.value })}
                  placeholder="Dr. João Silva"
                />
                <Input
                  label="Especialidade"
                  type="text"
                  value={prescriberForm.specialty}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, specialty: e.target.value })}
                  placeholder="Nutricionista"
                />
                <Input
                  label="Número de Registro (CRN)"
                  type="text"
                  value={prescriberForm.registrationNumber}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, registrationNumber: e.target.value })}
                  placeholder="CRN-12345"
                />
                <Input
                  label="Nome da Clínica"
                  type="text"
                  value={prescriberForm.clinicName}
                  onChange={(e) => setPrescriberForm({ ...prescriberForm, clinicName: e.target.value })}
                  placeholder="Clínica Nutrição e Saúde"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Se o email já existe, o usuário será atualizado para prescritor</li>
                      <li>A senha será definida apenas se criar um novo usuário</li>
                      <li>O prescritor receberá um email para verificar a conta</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={creatingPrescriber}
                className="w-full md:w-auto"
              >
                {creatingPrescriber ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Prescritor
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Erro:</span>
                <span>{error}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

