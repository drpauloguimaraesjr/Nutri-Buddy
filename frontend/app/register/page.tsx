'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Sparkles, ArrowRight, Apple, CheckCircle2, UserCog, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, role);
      
      // Redirect based on role
      if (role === 'prescriber') {
        router.push('/prescriber/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle(role);
      
      // Redirect based on role
      if (role === 'prescriber') {
        router.push('/prescriber/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar com Google');
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Step
  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-2xl glass-card mb-4">
              <Sparkles className="h-12 w-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-2">NutriBuddy</h1>
            <p className="text-gray-700">Seu parceiro nutricional inteligente</p>
          </div>

          {/* Role selection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Como você deseja usar o NutriBuddy?
              </h2>
              <p className="text-gray-600">
                Selecione o tipo de conta que melhor se adequa a você
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient/User Option */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect('patient')}
                className="glass-card p-8 text-left hover:shadow-2xl transition-all group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Sou Paciente/Usuário
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Quero acompanhar minha nutrição e saúde
                    </p>
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Acompanhar refeições e dieta</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Receber plano do nutricionista</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Ver progresso e relatórios</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Chat com IA nutricional</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="inline-flex items-center space-x-2 text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Começar como Paciente</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Prescriber Option */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect('prescriber')}
                className="glass-card p-8 text-left hover:shadow-2xl transition-all group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 group-hover:scale-110 transition-transform">
                    <UserCog className="h-12 w-12 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Sou Prescritor
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Sou nutricionista e quero gerenciar meus pacientes
                    </p>
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Gerenciar múltiplos pacientes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Criar e prescrever dietas</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Acompanhar progresso em tempo real</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Dashboard profissional</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="inline-flex items-center space-x-2 text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Começar como Prescritor</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Faça login
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <motion.button
          onClick={() => setStep('role')}
          className="mb-4 text-gray-700 hover:text-gray-900 flex items-center space-x-2"
          whileHover={{ x: -4 }}
        >
          <span>←</span>
          <span>Voltar</span>
        </motion.button>

        {/* Logo for mobile */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-2xl glass-card mb-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mx-auto ${
              role === 'prescriber'
                ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}>
              {role === 'prescriber' ? (
                <UserCog className="h-6 w-6 text-white" />
              ) : (
                <Users className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastro de {role === 'prescriber' ? 'Prescritor' : 'Paciente'}
          </h1>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete seu cadastro
            </h2>
            <p className="text-gray-600">
              Preencha os dados para começar
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 glass-subtle border-2 border-red-500/30 rounded-xl"
            >
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              autoComplete="name"
              required
            />

            <Input
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <Input
              type="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              required
            />

            <Input
              type="password"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              required
            />

            <div className="flex items-start space-x-2 text-sm pt-2">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                required
              />
              <label className="text-gray-700">
                Eu concordo com os{' '}
                <Link href="/terms" className="text-purple-600 hover:underline font-medium">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline font-medium">
                  Política de Privacidade
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className={`w-full text-white border-0 ${
                role === 'prescriber'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }`}
              size="lg"
            >
              {!loading && (
                <>
                  Criar conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-subtle text-gray-600">
                Ou cadastre-se com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full"
            >
              <Apple className="w-5 h-5 mr-2" />
              Apple
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
