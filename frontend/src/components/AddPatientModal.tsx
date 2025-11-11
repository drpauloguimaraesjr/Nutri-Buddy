'use client';

import { useState, FormEvent } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { User, Mail, Phone, Calendar, Ruler, Weight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import type { UserRole } from '@/types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (baseUrl) {
    return baseUrl;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

const createInitialFormState = () => ({
  name: '',
  email: '',
  phone: '',
  age: '',
  height: '',
  weight: '',
  gender: 'other' as 'male' | 'female' | 'other',
  goals: '',
  role: 'patient' as UserRole,
});

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const { user, firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState(createInitialFormState());

  const resetForm = () => {
    setFormData(createInitialFormState());
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const allowedRoles: UserRole[] = ['prescriber', 'admin'];
      if (!user || !allowedRoles.includes(user.role)) {
        throw new Error('Apenas prescritores ou administradores podem adicionar pacientes');
      }

      if (!firebaseUser) {
        throw new Error('Não foi possível autenticar o usuário atual. Recarregue a página e tente novamente.');
      }

      const selectedRole: UserRole = user.role === 'admin' ? formData.role : 'patient';
      const apiBaseUrl = getApiBaseUrl();
      const endpoint = `${apiBaseUrl}/api/prescriber/patients/create`;
      const token = await firebaseUser.getIdToken();

      // Normalizar telefone (apenas números)
      const normalizedPhone = formData.phone 
        ? formData.phone.replace(/\D/g, '') 
        : undefined;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: normalizedPhone,
        age: formData.age ? Number(formData.age) : null,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        gender: formData.gender,
        goals: formData.goals,
        role: selectedRole,
      };

      console.log('[AddPatientModal] submit', {
        endpoint,
        tokenInfo: {
          length: token.length,
          start: token.slice(0, 25),
          end: token.slice(-25),
        },
        payload,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error ||
            result?.message ||
            'Não foi possível criar o usuário. Verifique os dados e tente novamente.'
        );
      }

      setSuccess(
        selectedRole === 'patient'
          ? 'Paciente criado com sucesso. O paciente já pode usar a opção "Esqueci minha senha" para definir o acesso.'
          : 'Usuário criado com sucesso.'
      );
      showToast({
        title: 'Paciente criado com sucesso!',
        description:
          selectedRole === 'patient'
            ? 'As credenciais já podem ser enviadas ou o paciente pode recuperar a senha.'
            : 'Novo prescritor disponível na plataforma.',
        variant: 'success',
      });

      resetForm();

      onSuccess();
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar paciente');
      showToast({
        title: 'Erro ao criar paciente',
        description:
          err instanceof Error
            ? err.message
            : 'Tente novamente em instantes ou confira os dados informados.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Novo Paciente" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo *"
            placeholder="João Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email *"
            type="email"
            placeholder="joao@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Telefone (WhatsApp)"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => {
              // Permitir apenas números enquanto digita
              const formatted = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, phone: formatted });
            }}
            icon={<Phone className="w-4 h-4" />}
            helperText="Apenas números. Ex: 5511999998888"
          />

          <Input
            label="Idade"
            type="number"
            placeholder="30"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            icon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Altura (cm)"
            type="number"
            step="0.1"
            placeholder="170"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            icon={<Ruler className="w-4 h-4" />}
          />

          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            placeholder="70"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            icon={<Weight className="w-4 h-4" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gênero
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivos (separados por vírgula)
          </label>
          <textarea
            placeholder="Perda de peso, Ganho de massa muscular, Melhora da saúde"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {user?.role === 'admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de usuário
            </label>
            <select
              value={formData.role}
              onChange={(event) =>
                setFormData({ ...formData, role: event.target.value as UserRole })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="patient">Paciente</option>
              <option value="prescriber">Prescritor</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            Adicionar Paciente
          </Button>
        </div>
      </form>
    </Modal>
  );
}

