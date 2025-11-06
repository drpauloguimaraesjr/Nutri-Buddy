'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, whatsappAPI } from '@/lib/api';
import {
  Shield,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function PainelAdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

  // Debug do usuário
  useEffect(() => {
    if (user) {
      setDebugInfo({
        uid: user.uid,
        email: user.email,
        role: user.role,
        isAdmin: isAdmin,
        userObject: user
      });
    }
  }, [user, isAdmin]);

  // Carregar dados do WhatsApp
  useEffect(() => {
    if (isAdmin) {
      loadWhatsAppData();
    }
  }, [isAdmin]);

  const loadWhatsAppData = async () => {
    try {
      const statusRes = await whatsappAPI.getStatus();
      setWhatsappStatus(statusRes.data);
    } catch (error: any) {
      console.error('Erro ao carregar WhatsApp:', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      setLoadingWhatsapp(true);
      await whatsappAPI.connect();
      alert('✅ Conectando WhatsApp... Verifique o terminal do backend para o QR Code.');
      setTimeout(() => loadWhatsAppData(), 2000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao conectar WhatsApp');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Não Autenticado</h1>
            <p className="text-slate-600 mb-6">Você precisa fazer login primeiro.</p>
            <Button onClick={() => router.push('/login')}>Ir para Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-red-200">
          <div className="p-8">
            <div className="text-center mb-6">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Acesso Negado</h1>
              <p className="text-slate-600 mb-6">Apenas administradores podem acessar esta página.</p>
            </div>
            
            {/* Debug Info */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-sm mb-2">Debug Info:</h3>
              <pre className="text-xs text-slate-700 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/')}>Voltar para Home</Button>
              <Button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  router.push('/login');
                }}
                variant="outline"
              >
                Fazer Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Admin page content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                🛡️ Painel Administrativo
              </h1>
              <p className="text-slate-600 mt-1">Gerencie o sistema em tempo real</p>
            </div>
          </div>
          <Button onClick={loadWhatsAppData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Debug Info Card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">✅ Painel Admin Funcionando!</h2>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-2"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm text-slate-700 mb-2"><strong>Role:</strong> {user.role}</p>
              <p className="text-sm text-slate-700 mb-2"><strong>UID:</strong> {user.uid}</p>
              <p className="text-sm text-green-700 font-bold">✅ Você é ADMIN!</p>
            </div>
          </div>
        </Card>

        {/* WhatsApp Management */}
        <Card className="border-2 shadow-xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Gerenciar WhatsApp</h2>
            </div>

            {/* Status */}
            <div className={`rounded-xl p-6 mb-6 ${
              whatsappStatus?.connected
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-br from-gray-500 to-slate-600 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {whatsappStatus?.connected ? '✅ Conectado' : '❌ Desconectado'}
                  </h3>
                  <p className="text-sm opacity-90">Status: {whatsappStatus?.status || 'N/A'}</p>
                </div>
                {whatsappStatus?.connected ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!whatsappStatus?.connected ? (
                <>
                  <Button
                    onClick={handleConnectWhatsApp}
                    disabled={loadingWhatsapp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loadingWhatsapp ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Conectando...</>
                    ) : (
                      <><MessageSquare className="w-4 h-4 mr-2" />Conectar WhatsApp</>
                    )}
                  </Button>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Importante:</strong> Após clicar em "Conectar", verifique o terminal/logs do backend Railway para ver o QR Code.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    ✅ WhatsApp está conectado e funcionando! Pacientes podem enviar mensagens.
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-900">
                  <p className="font-bold mb-2">💡 Sobre o WhatsApp Bot</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Pacientes enviam fotos → IA analisa peso, calorias, macros</li>
                    <li>Comandos: "menu", "resumo", "Bebi 500ml", "Fiz 30min corrida"</li>
                    <li>Integração com Strava para importar atividades</li>
                    <li>Vincule pacientes adicionando campo "whatsapp" no Firestore</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card className="border-2">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Ações</h2>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  if (confirm('Tem certeza que deseja sair?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    router.push('/login');
                  }
                }}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Fazer Logout
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Ir para Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

