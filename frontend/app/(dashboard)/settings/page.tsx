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
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stravaStatus, setStravaStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  // Carregar status do Strava
  useEffect(() => {
    loadStravaStatus();
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

