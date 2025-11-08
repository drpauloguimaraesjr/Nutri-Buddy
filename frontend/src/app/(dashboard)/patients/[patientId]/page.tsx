'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';

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
        };

        setPatient(mappedPatient);
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

    if (activeTab !== 'diet') {
      return (
        <div className="py-12 text-center text-gray-500">
          Conteúdo da aba <span className="font-semibold">{activeTab}</span> ainda em desenvolvimento.
        </div>
      );
    }

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


