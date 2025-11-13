'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Bot, CheckCircle2, Download, FileText, Loader2, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import type { UserRole } from '@/types';

type PatientTab = 'profile' | 'goals' | 'body' | 'config' | 'diet' | 'notes';

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  weight?: number;
  height?: number;
  lastConsultation?: Date;
  createdAt?: Date;
  status?: 'active' | 'inactive';
  dietPlanText?: string;
  trainingPlanText?: string;
  planPdfUrl?: string | null;
  planPdfName?: string | null;
  planPdfStoragePath?: string | null;
  planTranscriptionStatus?: 'idle' | 'processing' | 'completed';
  planUpdatedAt?: Date | null;
  role: UserRole;
  prescriberId?: string | null;
}

interface UploadedPlanFile {
  name: string;
  url: string;
  storagePath?: string | null;
}

export default function PatientDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const patientId = useMemo(() => {
    const value = params?.patientId;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [activeTab, setActiveTab] = useState<PatientTab>('diet');
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [dietPlanText, setDietPlanText] = useState('');
  const [trainingPlanText, setTrainingPlanText] = useState('');
  const [planFile, setPlanFile] = useState<UploadedPlanFile | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        setIsFetching(true);
        const docRef = doc(db, 'users', patientId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setFeedback({
            type: 'error',
            message: 'Paciente não encontrado. Verifique se ele foi cadastrado corretamente.',
          });
          setPatient(null);
          return;
        }

        const data = docSnap.data();
        const mappedPatient: PatientDetail = {
          id: docSnap.id,
          name: data.name ?? 'Paciente sem nome',
          email: data.email ?? '',
          phone: data.phone,
          gender: data.gender,
          age: data.age,
          weight: data.weight,
          height: data.height,
          status: data.status,
          createdAt: data.createdAt?.toDate?.() ?? null,
          lastConsultation: data.lastConsultation?.toDate?.() ?? null,
          dietPlanText: data.dietPlanText ?? '',
          trainingPlanText: data.trainingPlanText ?? '',
          planPdfUrl: data.planPdfUrl ?? null,
          planPdfName: data.planPdfName ?? null,
          planPdfStoragePath: data.planPdfStoragePath ?? null,
          planTranscriptionStatus: data.planTranscriptionStatus ?? 'idle',
          planUpdatedAt: data.planUpdatedAt?.toDate?.() ?? null,
          role: data.role ?? 'patient',
          prescriberId: data.prescriberId ?? null,
        };

        setPatient(mappedPatient);
        setSelectedRole(mappedPatient.role);
        setDietPlanText(mappedPatient.dietPlanText ?? '');
        setTrainingPlanText(mappedPatient.trainingPlanText ?? '');
        if (mappedPatient.planPdfUrl && mappedPatient.planPdfName) {
          setPlanFile({
            name: mappedPatient.planPdfName,
            url: mappedPatient.planPdfUrl,
            storagePath: mappedPatient.planPdfStoragePath,
          });
        } else {
          setPlanFile(null);
        }
        setTranscriptionStatus(mappedPatient.planTranscriptionStatus ?? 'idle');
      } catch (error) {
        console.error('Erro ao carregar paciente:', error);
        setFeedback({
          type: 'error',
          message: 'Não foi possível carregar os dados do paciente.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !patientId) return;

    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      setFeedback({
        type: 'error',
        message: 'Por favor, selecione um arquivo PDF.',
      });
      return;
    }

    const storagePath = `prescribers/${user?.uid ?? 'unknown'}/patients/${patientId}/plans/${Date.now()}-${file.name}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setIsUploading(true);
    setUploadProgress(0);
    setTranscriptionStatus('processing');
    setFeedback(null);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Erro no upload do PDF:', error);
        setIsUploading(false);
        setUploadProgress(null);
        setTranscriptionStatus('idle');
        setFeedback({
          type: 'error',
          message: 'Não foi possível enviar o PDF. Tente novamente.',
        });
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setPlanFile({
            name: file.name,
            url,
            storagePath,
          });
          setFeedback({
            type: 'success',
            message: 'PDF enviado com sucesso! A transcrição será iniciada na próxima etapa.',
          });
          setUploadProgress(null);
          // Simula encerramento da transcrição automática após 2 segundos
          setTimeout(() => setTranscriptionStatus('completed'), 2000);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const handleRemoveFile = async () => {
    if (!planFile) return;

    try {
      if (planFile.storagePath) {
        const fileRef = ref(storage, planFile.storagePath);
        await deleteObject(fileRef);
      }
      setPlanFile(null);
      setTranscriptionStatus('idle');
      setFeedback({
        type: 'success',
        message: 'PDF removido. Você pode enviar outro arquivo quando quiser.',
      });
    } catch (error) {
      console.error('Erro ao remover PDF:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível remover o PDF.',
      });
    }
  };

  const handleSavePlans = async () => {
    if (!patientId) return;

    try {
      setIsSaving(true);
      setFeedback(null);

      const docRef = doc(db, 'users', patientId);
      await updateDoc(docRef, {
        dietPlanText,
        trainingPlanText,
        planPdfUrl: planFile?.url ?? null,
        planPdfName: planFile?.name ?? null,
        planPdfStoragePath: planFile?.storagePath ?? null,
        planTranscriptionStatus: transcriptionStatus,
        planUpdatedAt: serverTimestamp(),
      });

      setFeedback({
        type: 'success',
        message: 'Plano alimentar e treino salvos com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao salvar planos:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível salvar. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canManageRole = user?.role === 'admin' || user?.role === 'prescriber';

  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!patientId || !patient || newRole === selectedRole || !canManageRole) {
      setSelectedRole(newRole);
      return;
    }

    try {
      setIsUpdatingRole(true);
      setFeedback(null);

      const docRef = doc(db, 'users', patientId);
      const newPrescriberId = newRole === 'patient' ? (patient.prescriberId ?? user?.uid ?? null) : null;

      await updateDoc(docRef, {
        role: newRole,
        prescriberId: newPrescriberId,
        updatedAt: serverTimestamp(),
      });

      setPatient((prev) =>
        prev
          ? {
              ...prev,
              role: newRole,
              prescriberId: newPrescriberId,
            }
          : prev
      );
      setSelectedRole(newRole);
      setFeedback({
        type: 'success',
        message: 'Função do usuário atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar função do usuário:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível atualizar a função do usuário.',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const renderTabContent = () => {
    if (!patient) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nenhum paciente selecionado</h2>
            <p className="text-gray-600">Volte para a lista de pacientes e tente novamente.</p>
          </div>
        </div>
      );
    }

    // Renderizar conteúdo por aba
    switch (activeTab) {
      case 'goals':
        return renderGoalsTab();
      case 'body':
        return renderBodyTab();
      case 'profile':
        return renderProfileTab();
      case 'config':
        return renderConfigTab();
      case 'notes':
        return renderNotesTab();
      case 'diet':
        return renderDietTab();
      default:
      return (
        <div className="py-12 text-center text-gray-500">
          Conteúdo da aba <span className="font-semibold">{activeTab}</span> ainda em desenvolvimento.
        </div>
      );
    }
  };

  const renderGoalsTab = () => {
    return (
      <div className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Peso Atual */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peso Atual</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {patient?.weight ? `${patient.weight}kg` : '--'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl">⚖️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peso Meta */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peso Meta</p>
                  <p className="text-3xl font-bold text-gray-900">75kg</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Falta Perder */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Falta Perder</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {patient?.weight ? `${(patient.weight - 75).toFixed(1)}kg` : '--'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-2xl">📉</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Progresso da Meta</h3>
                <span className="text-sm font-medium text-purple-600">
                  {patient?.weight ? Math.round(((85 - patient.weight) / (85 - 75)) * 100) : 0}% concluído
                </span>
              </div>
              <div className="h-4 rounded-full bg-gray-200">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{
                    width: `${patient?.weight ? Math.min(((85 - patient.weight) / (85 - 75)) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-600">Peso Inicial</p>
                <p className="text-lg font-semibold text-gray-900">85kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Progresso</p>
                <p className="text-lg font-semibold text-purple-600">
                  {patient?.weight ? `-${(85 - patient.weight).toFixed(1)}kg` : '--'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Meta Final</p>
                <p className="text-lg font-semibold text-gray-900">75kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivo Principal */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Objetivo Principal</h3>
            <select className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
              <option value="lose_weight">Perder peso</option>
              <option value="gain_muscle">Ganhar massa muscular</option>
              <option value="maintain">Manter peso atual</option>
              <option value="performance">Melhorar performance esportiva</option>
              <option value="health">Melhorar saúde geral</option>
              <option value="gain_weight">Ganhar peso</option>
              <option value="recomp">Recomposição corporal</option>
            </select>
          </CardContent>
        </Card>

        {/* Metas Semanais */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Metas Semanais</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {['Beber 2L de água por dia', 'Fazer 4 refeições', 'Treinar 3x na semana'].map(
                (goal, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="flex-1 text-sm text-gray-700">{goal}</span>
                  </label>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas/Badges */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Conquistas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '🔥', title: '7 dias seguidos', achieved: true },
                { emoji: '⭐', title: 'Primeira semana', achieved: true },
                { emoji: '🏆', title: 'Meta atingida', achieved: false },
                { emoji: '💪', title: '30 dias', achieved: false },
              ].map((badge, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 ${
                    badge.achieved
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <p className="text-center text-xs font-medium text-gray-700">{badge.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBodyTab = () => {
    return (
      <div className="space-y-6">
        {/* Resumo Principal */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Peso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patient?.weight ? `${patient.weight}kg` : '--'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Altura</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patient?.height ? `${patient.height}cm` : '--'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">IMC</p>
                <p className="text-2xl font-bold text-purple-600">
                  {patient?.weight && patient?.height
                    ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
                    : '--'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Gordura</p>
                <p className="text-2xl font-bold text-blue-600">18%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medidas Corporais */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Medidas Corporais</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Medição
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Cintura', value: '85cm', icon: '⭕' },
                { label: 'Quadril', value: '95cm', icon: '⭕' },
                { label: 'Peito', value: '100cm', icon: '💪' },
                { label: 'Braço D', value: '35cm', icon: '💪' },
                { label: 'Braço E', value: '34cm', icon: '💪' },
                { label: 'Coxa D', value: '58cm', icon: '🦵' },
                { label: 'Coxa E', value: '57cm', icon: '🦵' },
                { label: 'Panturrilha', value: '38cm', icon: '🦵' },
              ].map((measure, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <span className="text-2xl">{measure.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">{measure.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{measure.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Composição Corporal */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Composição Corporal</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                <p className="text-sm text-blue-700">% de Gordura</p>
                <p className="text-3xl font-bold text-blue-900">18%</p>
                <p className="text-xs text-blue-600">Meta: 15%</p>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                <p className="text-sm text-green-700">Massa Magra</p>
                <p className="text-3xl font-bold text-green-900">65kg</p>
                <p className="text-xs text-green-600">82% do peso total</p>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                <p className="text-sm text-purple-700">Massa Gorda</p>
                <p className="text-3xl font-bold text-purple-900">14kg</p>
                <p className="text-xs text-purple-600">18% do peso total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fotos de Progresso */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Fotos de Progresso</h3>
              <Button variant="outline" size="sm">
                <Upload className="mr-1 h-4 w-4" />
                Adicionar Fotos
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Período 1 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Antes - 10/01/2025</p>
                    <p className="text-sm text-gray-600">80kg</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Frente', 'Lado', 'Costas'].map((view, index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white"
                    >
                      <div className="text-center">
                        <p className="text-4xl">📷</p>
                        <p className="mt-1 text-xs text-gray-500">{view}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Período 2 */}
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Atual - 10/02/2025</p>
                    <p className="text-sm text-purple-600">75kg (-5kg)</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Frente', 'Lado', 'Costas'].map((view, index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-white"
                    >
                      <div className="text-center">
                        <p className="text-4xl">📷</p>
                        <p className="mt-1 text-xs text-gray-500">{view}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <p>
                <strong>Dica:</strong> Tire fotos no mesmo horário, com a mesma iluminação e nas
                mesmas posições para melhor comparação.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Medidas */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Medições</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left font-semibold text-gray-700">Data</th>
                    <th className="pb-2 text-center font-semibold text-gray-700">Peso</th>
                    <th className="pb-2 text-center font-semibold text-gray-700">Gordura</th>
                    <th className="pb-2 text-center font-semibold text-gray-700">Cintura</th>
                    <th className="pb-2 text-center font-semibold text-gray-700">Quadril</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '10/02/25', weight: '75kg', fat: '18%', waist: '85cm', hip: '95cm' },
                    { date: '03/02/25', weight: '77kg', fat: '19%', waist: '87cm', hip: '96cm' },
                    { date: '27/01/25', weight: '78kg', fat: '20%', waist: '88cm', hip: '97cm' },
                    { date: '20/01/25', weight: '79kg', fat: '21%', waist: '89cm', hip: '98cm' },
                    { date: '10/01/25', weight: '80kg', fat: '22%', waist: '90cm', hip: '100cm' },
                  ].map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{entry.date}</td>
                      <td className="py-3 text-center text-gray-700">{entry.weight}</td>
                      <td className="py-3 text-center text-gray-700">{entry.fat}</td>
                      <td className="py-3 text-center text-gray-700">{entry.waist}</td>
                      <td className="py-3 text-center text-gray-700">{entry.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfileTab = () => {
    return (
      <div className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input
                  type="text"
                  defaultValue={patient?.name}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  defaultValue={patient?.email}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  defaultValue={patient?.phone || ''}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gênero</label>
                <select
                  defaultValue={patient?.gender || ''}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Selecione...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Profissão</label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alergias e Restrições */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Alergias e Restrições Alimentares</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Alergias Alimentares</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Lactose', 'Glúten', 'Amendoim', 'Frutos do mar', 'Ovo', 'Soja'].map((allergy) => (
                    <label
                      key={allergy}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outras Alergias (descreva)
                </label>
                <textarea
                  placeholder="Ex: Alergia a corantes artificiais..."
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condições de Saúde */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Condições de Saúde</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Condições Médicas Existentes
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Colesterol Alto', 'Gastrite'].map(
                    (condition) => (
                      <label
                        key={condition}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Medicamentos em Uso</label>
                <textarea
                  placeholder="Liste os medicamentos que o paciente toma regularmente..."
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferências Alimentares */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferências Alimentares</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estilo Alimentar</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="">Nenhum</option>
                  <option value="vegetarian">Vegetariano</option>
                  <option value="vegan">Vegano</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="paleo">Paleo</option>
                  <option value="keto">Cetogênica (Keto)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alimentos que NÃO Gosta
                </label>
                <textarea
                  placeholder="Ex: Brócolis, berinjela, fígado..."
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Alimentos Favoritos</label>
                <textarea
                  placeholder="Ex: Frango, batata doce, abacate..."
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estilo de Vida */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estilo de Vida</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nível de Atividade Física
                </label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                  <option value="light">Leve (1-2x por semana)</option>
                  <option value="moderate">Moderado (3-4x por semana)</option>
                  <option value="active">Ativo (5-6x por semana)</option>
                  <option value="very_active">Muito Ativo (diariamente ou 2x ao dia)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Qualidade do Sono</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="poor">Ruim (menos de 5h)</option>
                  <option value="fair">Regular (5-6h)</option>
                  <option value="good">Bom (7-8h)</option>
                  <option value="excellent">Excelente (8h+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nível de Estresse</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="low">Baixo</option>
                  <option value="moderate">Moderado</option>
                  <option value="high">Alto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consumo de Água/Dia</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="low">Menos de 1L</option>
                  <option value="moderate">1-2L</option>
                  <option value="good">2-3L</option>
                  <option value="excellent">Mais de 3L</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button size="lg">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Salvar Perfil
          </Button>
        </div>
      </div>
    );
  };

  const renderConfigTab = () => {
    return (
      <div className="space-y-6">
        {/* Header Explicativo */}
        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  Personalidade da IA para este Paciente
                </h3>
                <p className="mt-1 text-sm text-purple-700">
                  Configure como a IA deve conversar especificamente com {patient?.name}. Cada paciente
                  pode ter uma abordagem diferente: firme, leve, motivacional, com zoeira, etc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tom de Voz */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Tom de Voz</h3>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  value: 'firm',
                  label: 'Firme e Direto',
                  description: 'Para pacientes que precisam de limites claros',
                  emoji: '💪',
                },
                {
                  value: 'light',
                  label: 'Leve e Acolhedor',
                  description: 'Para pacientes ansiosos ou sensíveis',
                  emoji: '🤗',
                },
                {
                  value: 'motivational',
                  label: 'Motivacional e Energético',
                  description: 'Para pacientes desmotivados',
                  emoji: '🔥',
                },
                {
                  value: 'playful',
                  label: 'Descontraído e Zoeira',
                  description: 'Para pacientes que gostam de humor',
                  emoji: '😄',
                },
              ].map((tone) => (
                <label
                  key={tone.value}
                  className="flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <input
                    type="radio"
                    name="tone"
                    value={tone.value}
                    defaultChecked={tone.value === 'light'}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tone.emoji}</span>
                      <span className="font-semibold text-gray-900">{tone.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{tone.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estilo de Comunicação */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estilo de Comunicação</h3>

            <div className="space-y-3">
              {[
                { label: 'Usar emojis', description: 'Deixar conversas mais leves' },
                { label: 'Mensagens curtas', description: 'Respostas objetivas e diretas' },
                { label: 'Fazer perguntas', description: 'Engajar o paciente na conversa' },
                { label: 'Usar gírias/informal', description: 'Linguagem mais próxima' },
                { label: 'Citar ciência', description: 'Basear respostas em estudos' },
              ].map((style, index) => (
                <label
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <span className="font-medium text-gray-900">{style.label}</span>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={index < 2}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frases Personalizadas */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Frases Personalizadas</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Frase
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quando paciente acerta
                </label>
                <textarea
                  defaultValue="Isso aí, {nome}! Você está arrasando! Continue assim que os resultados vêm! 💪"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quando paciente erra/desliza
                </label>
                <textarea
                  defaultValue="Relaxa, {nome}. Um dia não define sua jornada. O importante é voltar no próximo dia. Vamos juntos?"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quando paciente está desmotivado
                </label>
                <textarea
                  defaultValue="Eu sei que tá difícil, {nome}. Mas lembra por que você começou? Você é capaz, eu acredito em você!"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <p>
                <strong>Dica:</strong> Use <code className="rounded bg-blue-100 px-1">{`{nome}`}</code> para
                inserir o nome do paciente automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gatilhos Específicos */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Gatilhos Específicos</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Gatilho
              </Button>
            </div>

            <p className="text-sm text-gray-600">
              Configure respostas automáticas quando o paciente mencionar palavras/frases específicas.
            </p>

            <div className="space-y-3">
              {[
                {
                  trigger: 'com fome',
                  response: 'Beber água ajuda! E que tal um lanche leve? Tenho sugestões aqui.',
                  alert: false,
                },
                {
                  trigger: 'quero desistir',
                  response: 'Calma! Vamos conversar. Me conta o que está acontecendo?',
                  alert: true,
                },
              ].map((gatilho, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    gatilho.alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <code className="rounded bg-white px-2 py-1 text-sm font-medium text-gray-900">
                      &quot;{gatilho.trigger}&quot;
                    </code>
                    {gatilho.alert && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Alertar Prescritor
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">→ {gatilho.response}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tópicos Importantes para Este Paciente */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tópicos Importantes para Este Paciente
            </h3>

            <div className="flex flex-wrap gap-2">
              {[
                'Hidratação',
                'Mastigar devagar',
                'Preparar marmitas',
                'Evitar beliscar',
                'Fazer exercícios',
                'Dormir bem',
              ].map((topic) => (
                <label
                  key={topic}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                >
                  <input
                    type="checkbox"
                    defaultChecked={['Hidratação', 'Mastigar devagar'].includes(topic)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{topic}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tópico personalizado
              </label>
              <input
                type="text"
                placeholder="Ex: Evitar doces à noite"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teste da IA */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Testar Personalidade</h3>
            </div>

            <textarea
              placeholder="Digite uma mensagem de teste (ex: 'Oi, comi muito hoje')"
              className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
              rows={2}
            />

            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
              <Sparkles className="mr-2 h-4 w-4" />
              Ver como a IA responderia
            </Button>

            <div className="rounded-lg border border-purple-300 bg-white p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Resposta da IA:</p>
              <p className="text-sm text-gray-600 italic">
                (Clique no botão acima para ver como a IA responderia com as configurações atuais)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Restaurar Padrões</Button>
          <Button size="lg">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    );
  };

  const renderNotesTab = () => {
    return (
      <div className="space-y-6">
        {/* Adicionar Nova Nota */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adicionar Nota</h3>

            <textarea
              placeholder="Escreva uma anotação sobre este paciente..."
              className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              rows={4}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="consultation">📋 Consulta</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="alert">⚠️ Alerta</option>
                  <option value="goal_change">🎯 Mudança de meta</option>
                  <option value="plan_change">🍽️ Ajuste no plano</option>
                  <option value="progress">💪 Progresso</option>
                  <option value="assessment">📊 Avaliação</option>
                  <option value="achievement">🎉 Conquista</option>
                </select>

                <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600" />
                  <span className="text-sm text-gray-700">Marcar como importante</span>
                </label>
              </div>

              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Nota
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Notas */}
        <div className="relative">
          {/* Linha Vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {/* Nota 1 - Importante */}
            <div className="relative">
              <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-4 border-white bg-red-500" />
              
              <Card className="ml-16 border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">⚠️</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          IMPORTANTE
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dr. Paulo Guimarães</span> • 10/02/2025 14:30
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed">
                    Paciente relatou dificuldade em seguir o plano nos finais de semana devido a
                    compromissos sociais. Ajustamos para incluir opções mais flexíveis no sábado e
                    domingo, mantendo a meta de 80/20.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Alerta
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nota 2 - Normal */}
            <div className="relative">
              <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-4 border-white bg-blue-500" />
              
              <Card className="ml-16">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dr. Paulo Guimarães</span> • 08/02/2025 09:15
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed">
                    Plano alimentar atualizado. Calorias ajustadas de 2000 para 1800 kcal/dia devido
                    ao bom progresso inicial. Paciente demonstrou boa adesão na primeira semana.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Ajuste no plano
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nota 3 - Sistema */}
            <div className="relative">
              <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-4 border-white bg-purple-500" />
              
              <Card className="ml-16 border-l-4 border-l-purple-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Sistema</span> • 07/02/2025 08:00
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed">
                    Paciente conquistou o badge &quot;7 dias seguidos&quot;! Manteve 100% de aderência ao plano
                    durante toda a semana.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      Conquista
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nota 4 - WhatsApp */}
            <div className="relative">
              <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-4 border-white bg-green-500" />
              
              <Card className="ml-16">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💬</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dr. Paulo Guimarães</span> • 03/02/2025 16:45
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed">
                    Conversa no WhatsApp: Paciente perguntou sobre substituições para o jantar.
                    Orientado sobre opções de proteínas magras e indicado receitas alternativas.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      WhatsApp
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nota 5 - Primeira Consulta */}
            <div className="relative">
              <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-4 border-white bg-gray-400" />
              
              <Card className="ml-16">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dr. Paulo Guimarães</span> • 10/01/2025 10:00
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed">
                    Primeira consulta realizada. Paciente apresenta objetivo de perder 10kg em 3 meses.
                    Peso inicial: 85kg. IMC: 27.8 (sobrepeso). Plano alimentar de 2000 kcal/dia iniciado.
                    Solicitado exames de rotina.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Consulta
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Estatísticas de Acompanhamento</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">15</p>
                <p className="text-sm text-gray-600">Total de notas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">5</p>
                <p className="text-sm text-gray-600">Consultas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">Interações WhatsApp</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">2</p>
                <p className="text-sm text-gray-600">Alertas importantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDietTab = () => {

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Plano alimentar</h3>
              <p className="text-sm text-gray-600">
                Faça upload do PDF do plano alimentar ou descreva manualmente abaixo. O arquivo será armazenado no
                Firebase Storage do projeto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label
                htmlFor="plan-pdf"
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
              >
                <Upload className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Selecione ou arraste o PDF do plano</p>
                  <p className="text-sm text-gray-500">Arquivos .pdf de até 10MB</p>
                </div>
                <input
                  id="plan-pdf"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4" />
                  PDF carregado
                </h4>

                {planFile ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{planFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {transcriptionStatus === 'processing' ? 'Aguardando transcrição' : 'Pronto para uso'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {planFile.url && (
                          <a
                            href={planFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg border-2 border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Visualizar
                          </a>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleRemoveFile}
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {transcriptionStatus !== 'completed' && (
                      <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
                        {transcriptionStatus === 'processing' ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span>Transcrevendo dieta... isso pode levar até 2 minutos.</span>
                          </div>
                        ) : (
                          <span>Aguardando envio.</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum PDF selecionado.</p>
                )}

                {isUploading && uploadProgress !== null && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Enviando...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="dietPlanText">
                  Plano alimentar do paciente
                </label>
                <textarea
                  id="dietPlanText"
                  value={dietPlanText}
                  onChange={(event) => setDietPlanText(event.target.value)}
                  placeholder="Descreva o plano alimentar do paciente ou aguarde a transcrição do PDF."
                  className="min-h-[220px] rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="trainingPlanText">
                  Plano de treino do paciente
                </label>
                <textarea
                  id="trainingPlanText"
                  value={trainingPlanText}
                  onChange={(event) => setTrainingPlanText(event.target.value)}
                  placeholder="Descreva o plano de treino do paciente."
                  className="min-h-[220px] rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Notificar paciente sobre o plano</p>
                <p className="text-xs text-gray-500">
                  (Em breve) Assim que a transcrição for concluída, enviaremos um aviso automatizado.
                </p>
              </div>
              <Button onClick={handleSavePlans} isLoading={isSaving}>
                Salvar planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHeader = () => {
    if (isFetching) {
      return (
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-gray-600">Carregando informações do paciente...</p>
          </CardContent>
        </Card>
      );
    }

    if (!patient) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            Não encontramos este paciente. Volte para a lista e tente novamente.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-600">{patient.email}</p>
            {patient.phone && <p className="text-sm text-gray-600">{patient.phone}</p>}
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  patient.status === 'inactive'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {patient.status === 'inactive' ? 'Inativo' : 'Ativo'}
              </span>
              {patient.planUpdatedAt && (
                <span className="text-xs text-gray-500">
                  Última atualização: {patient.planUpdatedAt.toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {canManageRole && (
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Função do usuário</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRole}
                    onChange={(event) => handleRoleUpdate(event.target.value as UserRole)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="patient">Paciente</option>
                    <option value="prescriber">Prescritor</option>
                    {user?.role === 'admin' && <option value="admin">Administrador</option>}
                  </select>
                  {isUpdatingRole && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {renderHeader()}

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'profile', label: 'Perfil' },
              { key: 'goals', label: 'Metas' },
              { key: 'body', label: 'Físico' },
              { key: 'config', label: 'Config' },
              { key: 'diet', label: 'Dieta & Treino' },
              { key: 'notes', label: 'Notas' },
            ].map((tab) => (
              <Button
                key={tab.key}
                type="button"
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key as PatientTab)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{feedback.message}</span>
        </div>
      )}

      {renderTabContent()}
    </motion.div>
  );
}


