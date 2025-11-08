'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, 
  Plus, 
  User, 
  Mail, 
  Phone,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddPatientModal } from '@/components/AddPatientModal';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  lastConsultation?: Date;
  createdAt: Date;
}

export default function PatientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPatients = async () => {
    if (!user || user.role !== 'prescriber') return;

    try {
      setIsLoading(true);
      const patientsRef = collection(db, 'users');
      const q = query(
        patientsRef,
        where('role', '==', 'patient'),
        where('prescriberId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastConsultation: doc.data().lastConsultation?.toDate(),
      })) as Patient[];

      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' || patient.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie seus pacientes e acompanhamentos</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('all')}
                  size="sm"
                >
                  Todos ({patients.length})
                </Button>
                <Button
                  variant={selectedFilter === 'active' ? 'success' : 'outline'}
                  onClick={() => setSelectedFilter('active')}
                  size="sm"
                >
                  Ativos ({patients.filter(p => p.status === 'active').length})
                </Button>
                <Button
                  variant={selectedFilter === 'inactive' ? 'outline' : 'outline'}
                  onClick={() => setSelectedFilter('inactive')}
                  size="sm"
                >
                  Inativos ({patients.filter(p => p.status === 'inactive').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients List */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando pacientes...</p>
        </motion.div>
      ) : filteredPatients.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Comece adicionando seu primeiro paciente'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Paciente</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              variants={itemVariants}
              custom={index}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/patients/${patient.id}`)}
                role="button"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              patient.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{patient.email}</span>
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {patient.lastConsultation
                                ? `Última consulta: ${patient.lastConsultation.toLocaleDateString('pt-BR')}`
                                : 'Sem consultas'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadPatients}
      />
    </motion.div>
  );
}

