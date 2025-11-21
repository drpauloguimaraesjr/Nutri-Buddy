'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Lock, LogIn, MailCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export default function LoginPage() {
  const MAGIC_EMAIL_STORAGE_KEY = 'nutribuddy-magic-link-email';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [magicLinkInfo, setMagicLinkInfo] = useState('');
  const [magicLinkError, setMagicLinkError] = useState('');
  const [isMagicLinkSending, setIsMagicLinkSending] = useState(false);
  const [isConfirmingMagicLink, setIsConfirmingMagicLink] = useState(false);
  const [requiresMagicEmailConfirmation, setRequiresMagicEmailConfirmation] = useState(false);
  const [magicEmailInput, setMagicEmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    login,
    loginWithGoogle,
    resetPassword,
    sendMagicLink,
    completeMagicLinkSignIn,
    checkIsMagicLink,
  } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      const destination = loggedUser?.role === 'patient' ? '/meu-plano' : '/dashboard';
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const loggedUser = await loginWithGoogle();
      const destination = loggedUser?.role === 'patient' ? '/meu-plano' : '/dashboard';
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email);
    setResetError('');
    setResetSuccess('');
    setIsResetModalOpen(true);
  };

  const handleResetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');
    setIsResetLoading(true);

    try {
      if (!resetEmail) {
        throw new Error('Informe um email válido para recuperar sua senha.');
      }

      await resetPassword(resetEmail);
      setResetSuccess('Enviamos as instruções de recuperação para o seu email. Verifique também a caixa de spam.');
    } catch (resetErr) {
      setResetError(
        resetErr instanceof Error
          ? resetErr.message
          : 'Não foi possível enviar o email de recuperação. Tente novamente.'
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  const finalizeMagicLink = async (emailToUse: string, link: string) => {
    setRequiresMagicEmailConfirmation(false);
    setIsConfirmingMagicLink(true);
    setMagicLinkError('');
    setMagicLinkInfo('Confirmando seu acesso...');

    try {
      const loggedUser = await completeMagicLinkSignIn(emailToUse, link);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(MAGIC_EMAIL_STORAGE_KEY);
      }
      const destination = loggedUser?.role === 'patient' ? '/meu-plano' : '/dashboard';
      router.push(destination);
    } catch (magicError) {
      setMagicLinkError(
        magicError instanceof Error
          ? magicError.message
          : 'Não foi possível validar o link. Solicite um novo acesso.'
      );
      setMagicLinkInfo('');
      setRequiresMagicEmailConfirmation(true);
    } finally {
      setIsConfirmingMagicLink(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentLink = window.location.href;

    if (!checkIsMagicLink(currentLink)) {
      return;
    }

    setMagicLinkError('');
    const storedEmail = window.localStorage.getItem(MAGIC_EMAIL_STORAGE_KEY);

    if (storedEmail) {
      setMagicEmailInput(storedEmail);
      setRequiresMagicEmailConfirmation(false);
      finalizeMagicLink(storedEmail, currentLink);
    } else {
      setMagicLinkInfo(
        'Detectamos um link de acesso. Informe o email utilizado para recebê-lo e finalize seu login.'
      );
      setRequiresMagicEmailConfirmation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMagicLink = async () => {
    setMagicLinkError('');
    setMagicLinkInfo('');

    if (!email) {
      setMagicLinkError('Informe um email válido para receber o link de acesso.');
      return;
    }

    try {
      setIsMagicLinkSending(true);
      await sendMagicLink(email);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MAGIC_EMAIL_STORAGE_KEY, email);
      }
      setMagicLinkInfo(
        'Enviamos um link de acesso para o seu email. Abra o link no mesmo dispositivo e navegador para entrar rapidamente.'
      );
      setRequiresMagicEmailConfirmation(false);
    } catch (magicErr) {
      setMagicLinkError(
        magicErr instanceof Error
          ? magicErr.message
          : 'Não foi possível enviar o link. Verifique o email informado e tente novamente.'
      );
    } finally {
      setIsMagicLinkSending(false);
    }
  };

  const handleConfirmMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    if (typeof window === 'undefined') return;

    const link = window.location.href;
    const emailToUse = magicEmailInput || email;

    if (!emailToUse) {
      setMagicLinkError('Informe o email utilizado para solicitar o link.');
      return;
    }

    await finalizeMagicLink(emailToUse, link);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-1">
            <Image
              src="/logos/nutribuddy-icon-white.svg"
              alt="NutriBuddy Logo"
              width={240}
              height={240}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NutriBuddy</h1>
          <p className="text-slate-300 text-lg">Sistema de Acompanhamento Médico Nutricional</p>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white">Entrar</h2>
            <p className="text-sm text-slate-300">Acesse sua conta</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                isLoading={isLoading}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Button>
            </form>

            <div className="mt-4 space-y-3">
              <div className="text-center">
                <button
                  type="button"
                  onClick={openResetModal}
                  className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleSendMagicLink}
                isLoading={isMagicLinkSending}
              >
                <MailCheck className="w-4 h-4" />
                <span>Receber link de acesso por e-mail</span>
              </Button>

              {(magicLinkInfo || magicLinkError) && (
                <div
                  className={`rounded-lg border p-3 text-sm ${magicLinkError
                    ? 'border-red-500/30 bg-red-900/20 text-red-400'
                    : 'border-sky-500/30 bg-sky-900/20 text-sky-400'
                    }`}
                >
                  {magicLinkError || magicLinkInfo}
                </div>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continuar com Google</span>
            </Button>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>Crie uma conta ou faça login com Google</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {requiresMagicEmailConfirmation && (
        <Modal
          isOpen={requiresMagicEmailConfirmation}
          onClose={() => setRequiresMagicEmailConfirmation(false)}
          title="Finalizar login por e-mail"
          size="sm"
        >
          <form className="space-y-4" onSubmit={handleConfirmMagicLink}>
            <p className="text-sm text-slate-300">
              Informe o email utilizado para receber o link de acesso. Isso garante que apenas você possa concluir o
              login neste dispositivo.
            </p>
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={magicEmailInput}
              onChange={(event) => setMagicEmailInput(event.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            {magicLinkError && (
              <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
                {magicLinkError}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setRequiresMagicEmailConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" isLoading={isConfirmingMagicLink}>
                Concluir acesso
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Recuperar senha"
        size="sm"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <p className="text-sm text-slate-300">
            Informe o email utilizado no cadastro. Enviaremos um link para você criar uma nova senha.
          </p>

          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={resetEmail}
            onChange={(event) => setResetEmail(event.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          {resetError && (
            <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
              {resetError}
            </div>
          )}

          {resetSuccess && (
            <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-3 text-sm text-green-400">
              {resetSuccess}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isResetLoading}>
              Enviar instruções
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

