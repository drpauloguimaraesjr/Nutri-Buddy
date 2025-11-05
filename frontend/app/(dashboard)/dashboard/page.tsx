'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from '@/components/ui/Card';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import {
  Utensils,
  Dumbbell,
  Droplets,
  Target,
  Plus,
  Clock,
  TrendingUp,
  Calendar,
  Flame,
  BarChart3,
  Zap,
  Award,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { waterIntakeToday, fastingActive, fastingStartTime } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  // Mock data - será substituído por dados reais da API
  const [dailyStats, setDailyStats] = useState({
    calories: {
      consumed: 1450,
      goal: 2000,
    },
    protein: {
      consumed: 85,
      goal: 150,
    },
    carbs: {
      consumed: 180,
      goal: 250,
    },
    fats: {
      consumed: 45,
      goal: 65,
    },
    water: {
      consumed: waterIntakeToday || 1200,
      goal: 2500,
    },
    exercise: {
      burned: 320,
      goal: 400,
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateFastingTime = () => {
    if (!fastingActive || !fastingStartTime) return '0h 0m';
    const diff = currentTime.getTime() - new Date(fastingStartTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calorieBalance = dailyStats.calories.consumed - dailyStats.exercise.burned;
  const netCalories = Math.max(0, calorieBalance);
  const caloriePercentage = (netCalories / dailyStats.calories.goal) * 100;

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Olá, {user?.displayName || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-600">
              {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Continue assim! Você está arrasando! 🔥
            </p>
          </div>
          
          {/* Quick streak info */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mt-4 md:mt-0 glass-subtle p-4 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">7 dias</p>
                <p className="text-sm text-gray-600">Sequência atual</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link 
          href="/dashboard/meals"
          className="h-auto py-6 flex-col space-y-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 cursor-pointer"
        >
          <Utensils className="w-6 h-6" />
          <span className="text-sm font-medium">Adicionar Refeição</span>
        </Link>
        <Link 
          href="/dashboard/water"
          className="h-auto py-6 flex-col space-y-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 cursor-pointer"
        >
          <Droplets className="w-6 h-6" />
          <span className="text-sm font-medium">Registrar Água</span>
        </Link>
        <Link 
          href="/dashboard/exercises"
          className="h-auto py-6 flex-col space-y-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 cursor-pointer"
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-sm font-medium">Adicionar Exercício</span>
        </Link>
        <Link 
          href="/dashboard"
          className="h-auto py-6 flex-col space-y-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 cursor-pointer"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Mais</span>
        </Link>
      </motion.div>

      {/* Main Stats - Featured Calorie Card */}
      <motion.div variants={itemVariants}>
        <Card hover={false} className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Flame className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Calorias Hoje</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-5xl font-bold">{netCalories}</span>
                      <span className="text-2xl opacity-80">/ {dailyStats.calories.goal}</span>
                    </div>
                    <p className="text-white/80">
                      Restante: {dailyStats.calories.goal - netCalories} kcal
                    </p>
                  </div>
                  
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-white/70 text-sm">Consumidas</p>
                      <p className="text-xl font-bold">{dailyStats.calories.consumed}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Queimadas</p>
                      <p className="text-xl font-bold">{dailyStats.exercise.burned}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Líquidas</p>
                      <p className="text-xl font-bold">{netCalories}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <CircularProgress
                  value={netCalories}
                  max={dailyStats.calories.goal}
                  size={160}
                  strokeWidth={12}
                  color="#ffffff"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Macros Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Macronutrientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar
                value={dailyStats.protein.consumed}
                max={dailyStats.protein.goal}
                label="Proteína"
                color="blue"
              />
              <ProgressBar
                value={dailyStats.carbs.consumed}
                max={dailyStats.carbs.goal}
                label="Carboidratos"
                color="yellow"
              />
              <ProgressBar
                value={dailyStats.fats.consumed}
                max={dailyStats.fats.goal}
                label="Gorduras"
                color="red"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hydration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Droplets className="w-5 h-5 mr-2 text-blue-600" />
              Hidratação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CircularProgress
                value={dailyStats.water.consumed}
                max={dailyStats.water.goal}
                size={120}
                strokeWidth={10}
                color="#3b82f6"
                showPercentage={true}
              />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {dailyStats.water.consumed}ml
                </p>
                <p className="text-sm text-gray-600">
                  Meta: {dailyStats.water.goal}ml
                </p>
                <Link 
                  href="/dashboard/water"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-9 px-3 mt-3 bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  250ml
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Dumbbell className="w-5 h-5 mr-2 text-emerald-600" />
              Exercícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {dailyStats.exercise.burned}
                </p>
                <p className="text-sm text-gray-600">calorias queimadas</p>
              </div>
              <ProgressBar
                value={dailyStats.exercise.burned}
                max={dailyStats.exercise.goal}
                label="Meta diária"
                color="emerald"
              />
              <Link 
                href="/dashboard/exercises"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 w-full border border-border text-foreground hover:bg-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Fasting Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Jejum Intermitente
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  fastingActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'glass-subtle text-gray-700'
                }`}
              >
                {fastingActive ? '● Ativo' : 'Inativo'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fastingActive ? (
              <div className="space-y-4">
                <div className="text-center p-6 glass-subtle rounded-xl">
                  <p className="text-5xl font-bold text-gradient-emerald mb-2">
                    {calculateFastingTime()}
                  </p>
                  <p className="text-gray-600">Tempo de jejum</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 glass-subtle rounded-lg">
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-xl font-bold text-gray-900">16h</p>
                  </div>
                  <div className="text-center p-3 glass-subtle rounded-lg">
                    <p className="text-sm text-gray-600">Restante</p>
                    <p className="text-xl font-bold text-purple-600">8h 30m</p>
                  </div>
                </div>
                <Link 
                  href="/dashboard/fasting"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 w-full border border-border text-foreground hover:bg-secondary"
                >
                  Terminar Jejum
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="inline-block p-4 rounded-full glass-subtle">
                  <Clock className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhum jejum ativo</p>
                <Link 
                  href="/dashboard/fasting"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-10 px-4 py-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Iniciar Jejum
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-lg">
                <Utensils className="w-5 h-5 mr-2 text-orange-600" />
                Últimas Refeições
              </span>
              <Link 
                href="/dashboard/meals"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-9 px-3 text-foreground hover:bg-secondary"
              >
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Café da Manhã', time: '08:30', cal: 450, macros: '25g P | 50g C | 15g G' },
                { name: 'Almoço', time: '12:45', cal: 680, macros: '45g P | 80g C | 20g G' },
                { name: 'Lanche', time: '16:00', cal: 320, macros: '15g P | 50g C | 10g G' },
              ].map((meal, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-4 glass-subtle rounded-xl cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{meal.name}</p>
                      <p className="text-sm text-gray-600">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{meal.cal} kcal</p>
                    <p className="text-xs text-gray-600">{meal.macros}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Banner */}
      <motion.div variants={itemVariants}>
        <Card hover={false} className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white rounded-2xl">
                <Award className="h-10 w-10 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  Parabéns! 🎉
                </h3>
                <p className="text-white/90">
                  Você completou 7 dias seguidos registrando suas refeições!
                </p>
              </div>
              <Button variant="secondary" className="bg-white text-gray-900 hover:bg-white/90">
                Ver Conquistas
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
