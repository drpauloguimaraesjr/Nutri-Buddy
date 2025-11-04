// 📄 EXEMPLO DE PÁGINA COMPLETA COM A NOVA ESTÉTICA OPENAI
// Este arquivo demonstra como criar uma página do zero usando o novo design system

'use client';

import { useState } from 'react';
import { Plus, Users, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  TableBadge,
} from '@/components/ui/Table';
import { motion } from 'framer-motion';

// Mock data
const mockPatients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    status: 'active',
    lastConsult: '15/03/2024',
    nextConsult: '22/03/2024',
    plan: 'Premium',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 91234-5678',
    status: 'active',
    lastConsult: '12/03/2024',
    nextConsult: '19/03/2024',
    plan: 'Basic',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 99876-5432',
    status: 'inactive',
    lastConsult: '10/01/2024',
    nextConsult: '-',
    plan: 'Premium',
  },
];

export default function ExemploPageCompleta() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 
        ========================================
        HEADER SECTION - OpenAI Style
        ========================================
      */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          {/* Title & Description */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Pacientes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus pacientes e acompanhe o progresso de cada um
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 
        ========================================
        STATS CARDS - OpenAI Style
        ========================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total de Pacientes', value: '156', change: '+12%', positive: true },
          { label: 'Ativos Este Mês', value: '89', change: '+8%', positive: true },
          { label: 'Consultas Agendadas', value: '24', change: '-3%', positive: false },
          { label: 'Taxa de Retenção', value: '94%', change: '+2%', positive: true },
        ].map((stat, index) => (
          <div key={index} className="card-dark p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${
                  stat.positive ? 'text-primary' : 'text-destructive'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* 
        ========================================
        FILTERS & SEARCH - OpenAI Style
        ========================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="card-dark p-4"
      >
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters Panel (collapsa quando showFilters = false) */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select className="input-dark">
                  <option>Todos</option>
                  <option>Ativos</option>
                  <option>Inativos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Plano
                </label>
                <select className="input-dark">
                  <option>Todos</option>
                  <option>Basic</option>
                  <option>Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Período
                </label>
                <select className="input-dark">
                  <option>Último mês</option>
                  <option>Últimos 3 meses</option>
                  <option>Último ano</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 
        ========================================
        TABLE OR EMPTY STATE - OpenAI Style
        ========================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {filteredPatients.length === 0 ? (
          // Empty State
          <div className="card-dark">
            <EmptyState
              icon={Users}
              title={searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum paciente cadastrado'}
              description={
                searchTerm
                  ? `Não encontramos pacientes com "${searchTerm}". Tente outro termo.`
                  : 'Você ainda não tem pacientes cadastrados. Comece adicionando seu primeiro paciente.'
              }
              action={
                !searchTerm
                  ? {
                      label: 'Adicionar Primeiro Paciente',
                      onClick: () => console.log('Add patient'),
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          // Table with data
          <div className="card-dark overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Próxima Consulta</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient, index) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.phone}
                    </TableCell>
                    <TableCell>
                      <TableBadge
                        variant={patient.status === 'active' ? 'success' : 'default'}
                      >
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </TableBadge>
                    </TableCell>
                    <TableCell>
                      <TableBadge
                        variant={patient.plan === 'Premium' ? 'info' : 'default'}
                      >
                        {patient.plan}
                      </TableBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.lastConsult}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.nextConsult}
                    </TableCell>
                    <TableCell>
                      <TableActions
                        onEdit={() => console.log('Edit', patient.id)}
                        onDelete={() => console.log('Delete', patient.id)}
                        onMore={() => console.log('More', patient.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="border-t border-border p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium text-foreground">{filteredPatients.length}</span> de{' '}
                <span className="font-medium text-foreground">{patients.length}</span> pacientes
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 
        ========================================
        FOOTER NOTE - OpenAI Style
        ========================================
      */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          💡 Dica: Use atalhos de teclado para navegar mais rápido. Pressione{' '}
          <kbd className="px-2 py-1 text-xs bg-secondary border border-border rounded">
            Cmd+K
          </kbd>{' '}
          para buscar
        </p>
      </motion.div>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES (OPCIONAL)
// ========================================

// Loading Skeleton (para usar durante fetch de dados)
export function PatientsTableSkeleton() {
  return (
    <div className="card-dark p-6 space-y-4">
      <div className="h-4 bg-secondary rounded w-1/4 animate-pulse" />
      <div className="h-4 bg-secondary rounded w-1/3 animate-pulse" />
      <div className="h-4 bg-secondary rounded w-1/2 animate-pulse" />
    </div>
  );
}

// Error State (para usar em caso de erro)
export function PatientsTableError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="card-dark p-12">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          Erro ao carregar pacientes
        </p>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={onRetry}>Tentar Novamente</Button>
      </div>
    </div>
  );
}

