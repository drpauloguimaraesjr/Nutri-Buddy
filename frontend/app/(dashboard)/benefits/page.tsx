'use client';

import { useState } from 'react';
import { Gift, Tag, ShoppingCart, TrendingUp, Star, ExternalLink, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Mock data - em produção viria de uma API
const BENEFITS = [
  {
    id: '1',
    brand: 'Growth Supplements',
    category: 'Suplementos',
    discount: '15%',
    cashback: '5%',
    description: 'Whey Protein, Creatina, BCAA e mais',
    image: '🏋️',
    url: 'https://growth.com.br',
    featured: true
  },
  {
    id: '2',
    brand: 'FitFood',
    category: 'Alimentação',
    discount: '20%',
    cashback: '3%',
    description: 'Refeições saudáveis congeladas',
    image: '🥗',
    url: 'https://fitfood.com.br',
    featured: true
  },
  {
    id: '3',
    brand: 'Drogasil',
    category: 'Farmácia',
    discount: '10%',
    cashback: '2%',
    description: 'Medicamentos e suplementos',
    image: '💊',
    url: 'https://drogasil.com.br',
    featured: false
  },
  {
    id: '4',
    brand: 'Nike',
    category: 'Roupas Fitness',
    discount: '25%',
    cashback: '5%',
    description: 'Roupas e tênis esportivos',
    image: '👟',
    url: 'https://nike.com.br',
    featured: true
  },
  {
    id: '5',
    brand: 'Netshoes',
    category: 'Esportes',
    discount: '15%',
    cashback: '4%',
    description: 'Equipamentos esportivos',
    image: '⚽',
    url: 'https://netshoes.com.br',
    featured: false
  },
  {
    id: '6',
    brand: 'iHerb',
    category: 'Suplementos',
    discount: '20%',
    cashback: '6%',
    description: 'Vitaminas e suplementos importados',
    image: '💪',
    url: 'https://iherb.com',
    featured: true
  },
  {
    id: '7',
    brand: 'Decathlon',
    category: 'Esportes',
    discount: '12%',
    cashback: '3%',
    description: 'Artigos esportivos variados',
    image: '🏃',
    url: 'https://decathlon.com.br',
    featured: false
  },
  {
    id: '8',
    brand: 'Centauro',
    category: 'Esportes',
    discount: '18%',
    cashback: '4%',
    description: 'Moda e equipamentos esportivos',
    image: '🎽',
    url: 'https://centauro.com.br',
    featured: false
  },
  {
    id: '9',
    brand: 'Probiótica',
    category: 'Suplementos',
    discount: '15%',
    cashback: '5%',
    description: 'Suplementos nacionais',
    image: '🌟',
    url: 'https://probiotica.com.br',
    featured: false
  },
  {
    id: '10',
    brand: 'Raia Drogasil',
    category: 'Farmácia',
    discount: '10%',
    cashback: '2%',
    description: 'Medicamentos e produtos de saúde',
    image: '🏥',
    url: 'https://rd.com.br',
    featured: false
  },
  {
    id: '11',
    brand: 'Adidas',
    category: 'Roupas Fitness',
    discount: '20%',
    cashback: '5%',
    description: 'Performance e lifestyle',
    image: '👕',
    url: 'https://adidas.com.br',
    featured: true
  },
  {
    id: '12',
    brand: 'Integral Médica',
    category: 'Suplementos',
    discount: '15%',
    cashback: '4%',
    description: 'Whey, albumina e mais',
    image: '🥛',
    url: 'https://integralmedica.com.br',
    featured: false
  }
];

const CATEGORIES = ['Todos', 'Suplementos', 'Alimentação', 'Farmácia', 'Roupas Fitness', 'Esportes'];

const MOCK_STATS = {
  totalSaved: 'R$ 1.247',
  totalCashback: 'R$ 89',
  totalPurchases: 12,
  favoriteCategory: 'Suplementos'
};

export default function BenefitsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Filter benefits
  const filteredBenefits = BENEFITS.filter(benefit => {
    const matchCategory = selectedCategory === 'Todos' || benefit.category === selectedCategory;
    const matchSearch = !searchTerm || 
      benefit.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      benefit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFeatured = !showFeaturedOnly || benefit.featured;
    
    return matchCategory && matchSearch && matchFeatured;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clube de Benefícios</h1>
        <p className="text-gray-600 mt-1">
          Descontos e cashback em mais de 30.000 marcas parceiras
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Economizado</span>
            <Tag className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {MOCK_STATS.totalSaved}
          </div>
          <div className="text-sm text-gray-600 mt-1">Este ano</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cashback Acumulado</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {MOCK_STATS.totalCashback}
          </div>
          <div className="text-sm text-gray-600 mt-1">Disponível para resgate</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Compras Realizadas</span>
            <ShoppingCart className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {MOCK_STATS.totalPurchases}
          </div>
          <div className="text-sm text-gray-600 mt-1">Com desconto</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Categoria Favorita</span>
            <Star className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {MOCK_STATS.favoriteCategory}
          </div>
          <div className="text-sm text-gray-600 mt-1">Mais usado</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition text-sm ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Toggle */}
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFeaturedOnly
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className={`w-4 h-4 ${showFeaturedOnly ? 'fill-white' : ''}`} />
            <span className="text-sm">Destaques</span>
          </button>
        </div>
      </Card>

      {/* Benefits Grid */}
      {filteredBenefits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>Nenhum benefício encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenefits.map((benefit) => (
            <Card key={benefit.id} className="p-6 hover:shadow-lg transition">
              {/* Badge */}
              {benefit.featured && (
                <div className="mb-4">
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                    <Star className="w-3 h-3 fill-yellow-700" />
                    Destaque
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl mb-4 text-center">{benefit.image}</div>

              {/* Content */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg mb-2">{benefit.brand}</h3>
                <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded">
                  {benefit.category}
                </span>
              </div>

              {/* Discounts */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">{benefit.discount}</div>
                  <div className="text-xs text-gray-600">Desconto</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{benefit.cashback}</div>
                  <div className="text-xs text-gray-600">Cashback</div>
                </div>
              </div>

              {/* Action */}
              <Button
                onClick={() => window.open(benefit.url, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Oferta
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-start gap-4">
          <Gift className="w-12 h-12 text-emerald-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Como Funciona?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <span>Escolha uma marca parceira acima</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                <span>Clique em "Acessar Oferta" para ir à loja</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">3.</span>
                <span>Faça sua compra normalmente no site da marca</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">4.</span>
                <span>O desconto é aplicado automaticamente e o cashback creditado em até 30 dias</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white rounded-lg text-sm">
              <p className="text-emerald-600 font-medium">💡 Dica:</p>
              <p className="text-gray-700 mt-1">
                Combine múltiplos benefícios! Use desconto + cashback + cupons da loja para maximizar sua economia.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

