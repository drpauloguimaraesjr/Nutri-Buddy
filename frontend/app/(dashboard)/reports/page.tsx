'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Calendar, Activity, Droplet, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const userId = 'user123'; // Mock

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch all data
  const { data: mealsData } = useQuery({
    queryKey: ['meals-report', userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/meals?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch meals');
      const data = await res.json();
      return data.meals || [];
    }
  });

  const { data: waterData } = useQuery({
    queryKey: ['water-report', userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/water?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch water');
      const data = await res.json();
      return data.logs || [];
    }
  });

  const { data: exercisesData } = useQuery({
    queryKey: ['exercises-report', userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/exercises?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();
      return data.exercises || [];
    }
  });

  const { data: measurementsData } = useQuery({
    queryKey: ['measurements-report', userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/measurements?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch measurements');
      const data = await res.json();
      return data.measurements || [];
    }
  });

  // Process data for charts
  const processWeightData = () => {
    if (!measurementsData || measurementsData.length === 0) return [];
    
    return measurementsData
      .slice(0, 30)
      .reverse()
      .map((m: any) => ({
        date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: m.weight,
        imc: m.bmi || null
      }));
  };

  const processCaloriesData = () => {
    if (!mealsData || mealsData.length === 0) return [];
    
    const dailyData = mealsData.reduce((acc: any, meal: any) => {
      if (!acc[meal.date]) {
        acc[meal.date] = { date: meal.date, calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
      }
      acc[meal.date].calorias += meal.totalCalories || 0;
      acc[meal.date].proteinas += meal.protein || 0;
      acc[meal.date].carboidratos += meal.carbs || 0;
      acc[meal.date].gorduras += meal.fat || 0;
      return acc;
    }, {});

    return Object.values(dailyData)
      .slice(0, 30)
      .reverse()
      .map((d: any) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }));
  };

  const processMacrosDistribution = () => {
    if (!mealsData || mealsData.length === 0) return [];
    
    const totals = mealsData.reduce((acc: any, meal: any) => {
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    return [
      { name: 'Proteínas', value: Math.round(totals.protein) },
      { name: 'Carboidratos', value: Math.round(totals.carbs) },
      { name: 'Gorduras', value: Math.round(totals.fat) }
    ];
  };

  const processWaterData = () => {
    if (!waterData || waterData.length === 0) return [];
    
    const dailyData = waterData.reduce((acc: any, log: any) => {
      if (!acc[log.date]) {
        acc[log.date] = { date: log.date, agua: 0 };
      }
      acc[log.date].agua += log.amount || 0;
      return acc;
    }, {});

    return Object.values(dailyData)
      .slice(0, 14)
      .reverse()
      .map((d: any) => ({
        ...d,
        agua: Math.round(d.agua),
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }));
  };

  const weightData = processWeightData();
  const caloriesData = processCaloriesData();
  const macrosData = processMacrosDistribution();
  const waterChartData = processWaterData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Visualize sua evolução e progresso
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition ${
                  period === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
          
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Weight Evolution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Evolução do Peso e IMC</h2>
        </div>
        
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="peso" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Peso (kg)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="imc" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="IMC"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Sem dados de peso registrados
          </div>
        )}
      </Card>

      {/* Calories and Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Calorias Diárias</h2>
          </div>
          
          {caloriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calorias" fill="#f59e0b" name="Calorias (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Sem dados de refeições
            </div>
          )}
        </Card>

        {/* Macros Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Distribuição de Macros</h2>
          </div>
          
          {macrosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macrosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macrosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Sem dados de macronutrientes
            </div>
          )}
        </Card>
      </div>

      {/* Water Intake */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Consumo de Água</h2>
        </div>
        
        {waterChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={waterChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="agua" fill="#3b82f6" name="Água (ml)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Sem dados de hidratação
          </div>
        )}
      </Card>

      {/* Macronutrients Over Time */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Macronutrientes ao Longo do Tempo</h2>
        </div>
        
        {caloriesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="proteinas" stroke="#10b981" strokeWidth={2} name="Proteínas (g)" />
              <Line type="monotone" dataKey="carboidratos" stroke="#f59e0b" strokeWidth={2} name="Carboidratos (g)" />
              <Line type="monotone" dataKey="gorduras" stroke="#ef4444" strokeWidth={2} name="Gorduras (g)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Sem dados de macronutrientes
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="text-3xl font-bold text-emerald-600">
            {mealsData?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Refeições Registradas</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">
            {exercisesData?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Exercícios Realizados</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-3xl font-bold text-purple-600">
            {measurementsData?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Medições Registradas</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-3xl font-bold text-orange-600">
            {waterData?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Registros de Água</div>
        </Card>
      </div>
    </div>
  );
}

