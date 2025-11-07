'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PlansPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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
          <h1 className="text-3xl font-bold text-gray-900">Planos Nutricionais</h1>
          <p className="text-gray-600">Crie e gerencie planos alimentares para seus pacientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Novo Plano</span>
        </Button>
      </motion.div>

      {/* Empty State */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum plano criado ainda
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece criando planos nutricionais personalizados para seus pacientes.
              Você pode definir refeições, objetivos e acompanhamento.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Plano</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

