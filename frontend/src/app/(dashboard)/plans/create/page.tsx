'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { ArrowLeft, Loader2, Plus, Save, Target, Trash2, Upload, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { processDietPDF } from '@/lib/n8n';
interface PatientSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other';
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  status?: 'active' | 'inactive';
  prescriberId?: string;
  createdAt?: Date | null;
  lastConsultation?: Date | null;
}

interface PlanMeal {
  id: string;
  title: string;
  time?: string;
  description: string;
}

interface PlanMealForm extends PlanMeal {
  energy?: string;
}

const createEmptyMeal = (): PlanMealForm => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  title: '',
  time: '',
  description: '',
  energy: '',
});

export default function CreatePlanPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [planName, setPlanName] = useState('');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');

  const [macros, setMacros] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const [meals, setMeals] = useState<PlanMealForm[]>([createEmptyMeal()]);

  const [planFile, setPlanFile] = useState<{
    name: string;
    url: string;
    storagePath: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiTranscription, setAiTranscription] = useState<{
    totalCalorias: number;
    totalRefeicoes: number;
    totalAlimentos: number;
    objetivo: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);
        const patientsRef = collection(db, 'users');
        const q = query(
          patientsRef,
          where('role', '==', 'patient'),
          where('prescriberId', '==', user.uid)
        );
        const snapshot = await getDocs(q);

        const patientsData: PatientSummary[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name ?? 'Paciente sem nome',
            email: data.email ?? '',
            phone: data.phone ?? null,
            gender: data.gender,
            age: data.age ?? null,
            weight: data.weight ?? null,
            height: data.height ?? null,
            status: data.status ?? 'active',
            prescriberId: data.prescriberId,
            createdAt: data.createdAt?.toDate?.() ?? null,
            lastConsultation: data.lastConsultation?.toDate?.() ?? null,
          };
        });

        setPatients(patientsData);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setFeedback({
          type: 'error',
          message: 'Não foi possível carregar a lista de pacientes.',
        });
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [user]);

  const handleAddMeal = () => {
    setMeals((prev) => [...prev, createEmptyMeal()]);
  };

  const handleRemoveMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  const handleMealChange = (mealId: string, field: keyof PlanMealForm, value: string) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === mealId ? { ...meal, [field]: value } : meal))
    );
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      setFeedback({
        type: 'error',
        message: 'Envie arquivos no formato PDF.',
      });
      return;
    }

    const storagePath = `prescribers/${user.uid}/plans/${Date.now()}-${file.name}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setIsUploading(true);
    setUploadProgress(0);
    setFeedback(null);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Erro no upload do plano:', error);
        setIsUploading(false);
        setUploadProgress(null);
        setFeedback({
          type: 'error',
          message: 'Erro ao enviar o PDF. Tente novamente.',
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
            message: 'PDF enviado com sucesso!',
          });

          // 🤖 PROCESSAR PDF COM IA (n8n + GPT-4o)
          if (selectedPatientId) {
            setIsProcessingAI(true);
            setFeedback({
              type: 'success',
              message: '🤖 Processando dieta com IA... Isso pode levar alguns segundos.',
            });

            try {
              const result = await processDietPDF(url, selectedPatientId);
              
              if (result.success) {
                const detalhes = result.detalhes || result.resumo;
                
                setAiTranscription(detalhes || null);
                
                setFeedback({
                  type: 'success',
                  message: `✅ Dieta transcrita com precisão! ${detalhes?.totalCalorias || 0} kcal, ${detalhes?.totalRefeicoes || 0} refeições.`,
                });

                console.log('✅ Transcrição salva no Firestore:', result);
              } else {
                throw new Error('Erro ao processar dieta com IA');
              }
            } catch (aiError) {
              console.error('⚠️ Erro no processamento com IA:', aiError);
              setFeedback({
                type: 'error',
                message: '⚠️ PDF enviado, mas houve erro ao processar com IA. Você pode criar o plano manualmente.',
              });
            } finally {
              setIsProcessingAI(false);
            }
          }
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
        }
      }
    );
  };

  const handleRemoveFile = async () => {
    if (!planFile) return;

    try {
      const fileRef = ref(storage, planFile.storagePath);
      await deleteObject(fileRef);
      setPlanFile(null);
      setFeedback({
        type: 'success',
        message: 'PDF removido. Você pode enviar outro quando quiser.',
      });
    } catch (error) {
      console.error('Erro ao remover PDF:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível remover o PDF.',
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (!selectedPatientId) {
      setFeedback({
        type: 'error',
        message: 'Selecione um paciente para criar o plano.',
      });
      return;
    }

    if (!planName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Informe um nome para o plano.',
      });
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const payload = {
        name: planName.trim(),
        objective: objective.trim(),
        duration: duration.trim(),
        startDate: startDate ? new Date(startDate) : null,
        notes: notes.trim(),
        patientId: selectedPatientId,
        patientName: selectedPatient?.name ?? '',
        prescriberId: user.uid,
        macros: {
          calories: macros.calories ? Number(macros.calories) : null,
          protein: macros.protein ? Number(macros.protein) : null,
          carbs: macros.carbs ? Number(macros.carbs) : null,
          fats: macros.fats ? Number(macros.fats) : null,
        },
        meals: meals.map((meal) => ({
          id: meal.id,
          title: meal.title,
          time: meal.time,
          description: meal.description,
          energy: meal.energy ? Number(meal.energy) : null,
        })),
        planPdfUrl: planFile?.url ?? null,
        planPdfName: planFile?.name ?? null,
        planPdfStoragePath: planFile?.storagePath ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'plans'), payload);

      setFeedback({
        type: 'success',
        message: 'Plano criado com sucesso!',
      });

      router.push('/plans');
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível salvar o plano. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormDisabled = isSaving || isUploading || isProcessingAI;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="w-fit gap-2 px-0 text-gray-600 hover:text-gray-900"
          onClick={() => router.push('/plans')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo plano nutricional</h1>
          <p className="text-gray-600">
            Configure o plano alimentar, metas nutricionais e anexe materiais para o paciente.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <Save className="h-4 w-4" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Paciente
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                  disabled={isFormDisabled || isLoadingPatients}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {isLoadingPatients ? 'Carregando pacientes...' : 'Selecione um paciente'}
                  </option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} • {patient.email}
                    </option>
                  ))}
                </select>
                {!isLoadingPatients && patients.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Você ainda não possui pacientes cadastrados. Adicione pacientes para criar planos.
                  </p>
                )}
              </div>

              <Input
                label="Nome do plano"
                placeholder="Plano Alimentar - Janeiro 2026"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                disabled={isFormDisabled}
                required
              />

              <Input
                label="Objetivo do plano"
                placeholder="Perda de peso, Reeducação alimentar, etc."
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                disabled={isFormDisabled}
              />

              <Input
                label="Duração"
                placeholder="4 semanas"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                disabled={isFormDisabled}
              />

              <Input
                label="Data de início"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isFormDisabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Observações gerais para o paciente
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Instruções adicionais, recomendações e observações importantes."
                disabled={isFormDisabled}
                rows={4}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Metas nutricionais</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Input
                label="Calorias (kcal)"
                type="number"
                value={macros.calories}
                onChange={(event) => setMacros((prev) => ({ ...prev, calories: event.target.value }))}
                disabled={isFormDisabled}
                min="0"
              />
              <Input
                label="Proteínas (g)"
                type="number"
                value={macros.protein}
                onChange={(event) => setMacros((prev) => ({ ...prev, protein: event.target.value }))}
                disabled={isFormDisabled}
                min="0"
              />
              <Input
                label="Carboidratos (g)"
                type="number"
                value={macros.carbs}
                onChange={(event) => setMacros((prev) => ({ ...prev, carbs: event.target.value }))}
                disabled={isFormDisabled}
                min="0"
              />
              <Input
                label="Gorduras (g)"
                type="number"
                value={macros.fats}
                onChange={(event) => setMacros((prev) => ({ ...prev, fats: event.target.value }))}
                disabled={isFormDisabled}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Plano de refeições</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAddMeal}
                disabled={isFormDisabled}
              >
                <Plus className="h-4 w-4" />
                Adicionar refeição
              </Button>
            </div>

            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={meal.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Refeição {index + 1}
                    </h3>
                    {meals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveMeal(meal.id)}
                        disabled={isFormDisabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <Input
                      label="Nome da refeição"
                      placeholder="Café da manhã"
                      value={meal.title}
                      onChange={(event) => handleMealChange(meal.id, 'title', event.target.value)}
                      disabled={isFormDisabled}
                      required
                    />
                    <Input
                      label="Horário"
                      type="time"
                      value={meal.time}
                      onChange={(event) => handleMealChange(meal.id, 'time', event.target.value)}
                      disabled={isFormDisabled}
                    />
                    <Input
                      label="Energia (kcal)"
                      type="number"
                      value={meal.energy ?? ''}
                      onChange={(event) => handleMealChange(meal.id, 'energy', event.target.value)}
                      disabled={isFormDisabled}
                      min="0"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Descrição / Alimentos
                    </label>
                    <textarea
                      value={meal.description}
                      onChange={(event) => handleMealChange(meal.id, 'description', event.target.value)}
                      placeholder="Descreva os alimentos, porções e orientações específicas."
                      disabled={isFormDisabled}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <Upload className="mx-auto h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Upload do plano em PDF (opcional)
                </p>
                <p className="text-xs text-gray-500">
                  Use o PDF como referência. Ele ficará disponível para o paciente.
                </p>
              </div>
              <label className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                <Upload className="h-4 w-4" />
                Selecionar PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isFormDisabled}
                />
              </label>
              {isUploading && uploadProgress !== null && (
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-gray-500">
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
              {isProcessingAI && (
                <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Processando dieta com IA...
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-600">
                    GPT-4o está analisando o PDF com precisão cirúrgica. Aguarde...
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700">Arquivo selecionado</h3>
              {planFile ? (
                <div className="mt-3 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-medium text-gray-900">{planFile.name}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={planFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Abrir
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={handleRemoveFile}
                        disabled={isFormDisabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    O arquivo ficará disponível para consulta do paciente após a publicação do plano.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  Nenhum PDF enviado ainda.
                </p>
              )}
              
              {aiTranscription && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h4 className="text-sm font-semibold text-green-900">
                    ✅ Transcrição Automática (IA)
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-green-700">
                    <div>
                      <span className="font-medium">📊 Calorias:</span>{' '}
                      {aiTranscription.totalCalorias} kcal
                    </div>
                    <div>
                      <span className="font-medium">🍽️ Refeições:</span>{' '}
                      {aiTranscription.totalRefeicoes}
                    </div>
                    <div>
                      <span className="font-medium">🥗 Alimentos:</span>{' '}
                      {aiTranscription.totalAlimentos}
                    </div>
                    <div>
                      <span className="font-medium">🎯 Objetivo:</span>{' '}
                      {aiTranscription.objetivo}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-green-600">
                    Os dados foram salvos automaticamente no perfil do paciente!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/plans')}
            disabled={isFormDisabled}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" isLoading={isSaving} disabled={isFormDisabled}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando plano
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar plano
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

