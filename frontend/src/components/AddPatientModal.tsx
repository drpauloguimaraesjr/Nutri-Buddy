'use client';

import { useState, FormEvent } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { User, Mail, Phone, Calendar, Ruler, Weight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    gender: 'other' as 'male' | 'female' | 'other',
    goals: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const allowedRoles: UserRole[] = ['prescriber', 'admin'];
      if (!user || !allowedRoles.includes(user.role)) {
        throw new Error('Apenas prescritores ou administradores podem adicionar pacientes');
      }

      // Criar documento do paciente no Firestore
      await addDoc(collection(db, 'users'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender,
        goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : [],
        role: 'patient',
        prescriberId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        height: '',
        weight: '',
        gender: 'other',
        goals: '',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Paciente" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone className="w-4 h-4" />}
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

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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

