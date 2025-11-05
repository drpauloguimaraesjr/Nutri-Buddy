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
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PatientDashboardPage() {
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

  const [prescriberInfo] = useState({
    name: 'Dra. Ana Nutricionista',
    specialty: 'Nutrição Clínica',
    hasActivePlan: true,
  });

  const [todayMeals] = useState([
    {
      time: '08:00',
      name: 'Café da Manhã',
      status: 'completed',
      foods: ['2 fatias de pão integral', '1 ovo mexido', '1 copo de leite'],
      calories: 350,
    },
    {
      time: '12:00',
      name: 'Almoço',
      status: 'pending',
      foods: ['150g peito de frango', 'Salada verde', '4 colheres de arroz integral'],
      calories: 480,
    },
    {
      time: '15:00',
      name: 'Lanche',
      status: 'pending',
      foods: ['1 banana', '1 punhado de castanhas'],
      calories: 200,
    },
    {
      time: '19:00',
      name: 'Jantar',
      status: 'pending',
      foods: ['Filé de peixe grelhado', 'Legumes no vapor', 'Batata doce'],
      calories: 420,
    },
  ]);

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
  
  const completedMeals = todayMeals.filter(m => m.status === 'completed').length;
  const totalMeals = todayMeals.length;

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

      {/* Prescriber Info */}
      {prescriberInfo.hasActivePlan && (
        <motion.div variants={itemVariants}>
          <Card hover={false} className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-full">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Seu nutricionista</p>
                    <h3 className="text-xl font-bold">{prescriberInfo.name}</h3>
                    <p className="text-sm opacity-80">{prescriberInfo.specialty}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/goals')}
                  variant="secondary" 
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  Ver Plano Completo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Button 
          onClick={() => router.push('/meals')}
          className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
        >
          <Utensils className="w-6 h-6" />
          <span className="text-sm font-medium">Registrar Refeição</span>
        </Button>
        <Button 
          onClick={() => router.push('/water')}
          className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
        >
          <Droplets className="w-6 h-6" />
          <span className="text-sm font-medium">Beber Água</span>
        </Button>
        <Button 
          onClick={() => router.push('/exercises')}
          className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-sm font-medium">Exercício</span>
        </Button>
        <Button 
          onClick={() => router.push('/reports')}
          className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-sm font-medium">Relatórios</span>
        </Button>
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

      {/* Meals Plan for Today */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-lg">
                <Utensils className="w-5 h-5 mr-2 text-orange-600" />
                Plano Alimentar de Hoje
              </span>
              <span className="text-sm px-3 py-1 glass-subtle rounded-full">
                {completedMeals}/{totalMeals} concluídas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayMeals.map((meal, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    meal.status === 'completed'
                      ? 'glass-strong border-2 border-emerald-500/30'
                      : 'glass-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        meal.status === 'completed'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {meal.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{meal.name}</p>
                          <span className="text-sm text-gray-600">{meal.time}</span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {meal.foods.map((food, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                              {food}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-gray-500 mt-2">
                          {meal.calories} kcal
                        </p>
                      </div>
                    </div>
                    {meal.status === 'pending' && (
                      <Button 
                        onClick={() => router.push('/meals')}
                        size="sm" 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                      >
                        Marcar como feito
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
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
                <Button 
                  onClick={() => router.push('/water')}
                  size="sm" 
                  className="mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  250ml
                </Button>
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
              <Button 
                onClick={() => router.push('/exercises')}
                variant="outline" 
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Button>
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
              <Button 
                onClick={() => router.push('/reports')}
                variant="secondary" 
                className="bg-white text-gray-900 hover:bg-white/90"
              >
                Ver Conquistas
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

