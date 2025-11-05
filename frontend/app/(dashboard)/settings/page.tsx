'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  Activity, 
  Link2, 
  Unlink, 
  RefreshCw, 
  CheckCircle2, 
  User,
  Mail,
  Bell,
  Lock,
  Globe,
  Workflow,
  Play,
  Clock,
  AlertCircle
} from 'lucide-react';
import { n8nAPI } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stravaStatus, setStravaStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<any>(null);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nWorkflows, setN8nWorkflows] = useState<any[]>([]);
  const [n8nExecutions, setN8nExecutions] = useState<any[]>([]);

  // Carregar status do Strava e N8N
  useEffect(() => {
    loadStravaStatus();
    loadN8nStatus();
  }, []);

  const loadStravaStatus = async () => {
    try {
      const response = await api.get('/strava/status');
      setStravaStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status Strava:', error);
    }
  };

  const handleConnectStrava = async () => {
    try {
      setLoading(true);
      const response = await api.get('/strava/connect');
      
      if (response.data.authUrl) {
        // Abrir popup de autorização
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          response.data.authUrl,
          'Strava Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Escutar mensagem de callback
        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'strava-callback') {
            popup?.close();
            
            // Processar código
            const callbackResponse = await api.post('/strava/callback', {
              code: event.data.code,
              state: event.data.state
            });

            if (callbackResponse.data.success) {
              alert('✅ Conectado ao Strava com sucesso!');
              loadStravaStatus();
            }
          }
        };

        window.addEventListener('message', handleMessage);
        
        // Remover listener após 5 minutos
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
        }, 300000);
      }
    } catch (error: any) {
      console.error('Erro ao conectar Strava:', error);
      alert(error.response?.data?.error || 'Erro ao conectar com Strava');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStrava = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/strava/sync', { limit: 50 });
      
      alert(`✅ ${response.data.synced} atividades sincronizadas!`);
      loadStravaStatus();
    } catch (error: any) {
      console.error('Erro ao sincronizar Strava:', error);
      alert(error.response?.data?.error || 'Erro ao sincronizar com Strava');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectStrava = async () => {
    if (!confirm('Deseja realmente desconectar do Strava?')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/strava/disconnect');
      
      alert('✅ Desconectado do Strava com sucesso!');
      loadStravaStatus();
    } catch (error: any) {
      console.error('Erro ao desconectar Strava:', error);
      alert(error.response?.data?.error || 'Erro ao desconectar do Strava');
    } finally {
      setLoading(false);
    }
  };

  // N8N Functions
  const loadN8nStatus = async () => {
    try {
      setN8nLoading(true);
      const response = await n8nAPI.getStatus();
      setN8nStatus(response.data);
      
      // Load workflows and executions if available
      if (response.data.config?.hasApiKey) {
        try {
          const workflowsResponse = await n8nAPI.getWorkflows();
          setN8nWorkflows(workflowsResponse.data.workflows || []);
        } catch (error) {
          console.error('Erro ao carregar workflows:', error);
        }
        
        try {
          const executionsResponse = await n8nAPI.getExecutions({ limit: 5 });
          setN8nExecutions(executionsResponse.data.executions || []);
        } catch (error) {
          console.error('Erro ao carregar execuções:', error);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar status N8N:', error);
    } finally {
      setN8nLoading(false);
    }
  };

  const handleTestN8n = async () => {
    try {
      setN8nLoading(true);
      const response = await n8nAPI.testConnection();
      alert(`✅ Teste concluído!\n\n${JSON.stringify(response.data.tests, null, 2)}`);
      loadN8nStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao testar conexão N8N');
    } finally {
      setN8nLoading(false);
    }
  };

  const handleTriggerWorkflow = async (workflowId?: string) => {
    if (!confirm('Deseja realmente disparar este workflow?')) {
      return;
    }

    try {
      setN8nLoading(true);
      const response = await n8nAPI.triggerWorkflow({ 
        workflowId,
        data: { 
          triggeredBy: user?.uid,
          timestamp: new Date().toISOString(),
        }
      });
      alert(`✅ Workflow disparado com sucesso!\n\n${response.data.message}`);
      loadN8nStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao disparar workflow');
    } finally {
      setN8nLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie suas preferências e integrações</p>
      </div>

      {/* Perfil */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-mail
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={user?.displayName || 'Usuário'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Integração Strava */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Integração com Strava</h2>
          </div>

          {stravaStatus?.enabled === false ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ {stravaStatus.message}
              </p>
            </div>
          ) : stravaStatus?.connected ? (
            <div className="space-y-4">
              {/* Status Conectado */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Conectado ao Strava
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Atleta: <strong>{stravaStatus.athleteName}</strong>
                </p>
                {stravaStatus.lastSync && (
                  <p className="text-sm text-green-700 mt-1">
                    Última sincronização: {new Date(stravaStatus.lastSync).toLocaleString('pt-BR')}
                    {' '}({stravaStatus.lastSyncCount || 0} atividades)
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSyncStrava}
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>

                <Button
                  onClick={handleDisconnectStrava}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Unlink className="w-4 h-4" />
                  Desconectar
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Como funciona:</strong> Suas atividades do Strava serão sincronizadas automaticamente para o módulo de Exercícios. Você pode sincronizar manualmente a qualquer momento.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Conecte sua conta do Strava para importar automaticamente suas atividades físicas.
              </p>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                  🏃‍♂️ Sincronize suas atividades
                </h3>
                <ul className="space-y-2 text-sm mb-4">
                  <li>✅ Corridas, ciclismo, natação e muito mais</li>
                  <li>✅ Importação automática de calorias queimadas</li>
                  <li>✅ Distância, ritmo e frequência cardíaca</li>
                  <li>✅ Sincronização em tempo real</li>
                </ul>

                <Button
                  onClick={handleConnectStrava}
                  disabled={loading}
                  className="bg-white text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  {loading ? 'Conectando...' : 'Conectar com Strava'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  🔒 Suas credenciais são seguras e criptografadas. O NutriBuddy nunca terá acesso à sua senha do Strava.
                </p>
                <p>
                  📊 Apenas permissões de leitura de atividades serão solicitadas.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notificações */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Notificações</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" defaultChecked />
              <span className="text-gray-700">Lembrete de refeições</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" defaultChecked />
              <span className="text-gray-700">Lembrete de água</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-gray-700">Notificações de jejum</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-gray-700">Resumo diário</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Privacidade */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Privacidade</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" defaultChecked />
              <span className="text-gray-700">Permitir análise de dados para melhorar a IA</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-gray-700">Perfil público</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Integração N8N */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Workflow className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Integração com N8N</h2>
          </div>

          {n8nLoading && !n8nStatus ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Carregando status...</p>
            </div>
          ) : n8nStatus?.config?.status === 'online' ? (
            <div className="space-y-4">
              {/* Status Conectado */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    N8N Conectado
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  URL: <strong>{n8nStatus.config.n8nUrl}</strong>
                </p>
                {n8nStatus.config.version && (
                  <p className="text-sm text-green-700 mt-1">
                    Versão: <strong>{n8nStatus.config.version}</strong>
                  </p>
                )}
                {n8nStatus.lastWebhook && (
                  <p className="text-sm text-green-700 mt-1">
                    Último webhook: {new Date(n8nStatus.lastWebhook.receivedAt?.toDate?.() || n8nStatus.lastWebhook.receivedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Workflows */}
              {n8nWorkflows.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Workflows Disponíveis ({n8nWorkflows.length})
                  </h3>
                  <div className="space-y-2">
                    {n8nWorkflows.slice(0, 3).map((wf) => (
                      <div
                        key={wf.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${wf.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm font-medium">{wf.name}</span>
                          {!wf.active && (
                            <span className="text-xs text-gray-500">(Inativo)</span>
                          )}
                        </div>
                        {wf.active && (
                          <Button
                            size="sm"
                            onClick={() => handleTriggerWorkflow(wf.id)}
                            disabled={n8nLoading}
                            className="flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Disparar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execuções Recentes */}
              {n8nExecutions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Execuções Recentes
                  </h3>
                  <div className="space-y-2">
                    {n8nExecutions.map((exec) => (
                      <div
                        key={exec.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{exec.workflowName || 'Workflow'}</p>
                            <p className="text-xs text-gray-500">
                              {exec.startedAt ? new Date(exec.startedAt).toLocaleString('pt-BR') : 'Aguardando'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          exec.status === 'finished' ? 'bg-green-100 text-green-700' :
                          exec.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {exec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={handleTestN8n}
                  disabled={n8nLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${n8nLoading ? 'animate-spin' : ''}`} />
                  Testar Conexão
                </Button>
                <Button
                  onClick={loadN8nStatus}
                  disabled={n8nLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${n8nLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Como funciona:</strong> O N8N permite criar automações e workflows para processar dados nutricionais, enviar notificações e muito mais.
                </p>
              </div>
            </div>
          ) : n8nStatus?.config?.status === 'offline' ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">
                    N8N Offline
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  {n8nStatus.config.error || 'Não foi possível conectar ao N8N'}
                </p>
              </div>

              <Button
                onClick={loadN8nStatus}
                disabled={n8nLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${n8nLoading ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Configure o N8N para automações e workflows avançados.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Configuração necessária:</strong> Configure <code className="bg-yellow-100 px-1 rounded">N8N_URL</code> e <code className="bg-yellow-100 px-1 rounded">N8N_API_KEY</code> no arquivo <code className="bg-yellow-100 px-1 rounded">.env</code> do backend para habilitar a integração completa.
                </p>
              </div>

              <Button
                onClick={loadN8nStatus}
                disabled={n8nLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${n8nLoading ? 'animate-spin' : ''}`} />
                Verificar Status
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Idioma */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Idioma</h2>
          </div>

          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </Card>
    </div>
  );
}

