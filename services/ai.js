/**
 * Serviço de IA para Análise Nutricional
 * Integração com OpenAI Vision para reconhecimento de alimentos e estimativa de peso
 */

const OpenAI = require('openai');

class AIService {
  constructor() {
    // Inicializar OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY não configurada. Funcionalidade de IA desabilitada.');
      this.enabled = false;
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.enabled = true;
    console.log('✅ Serviço de IA (OpenAI Vision) inicializado com sucesso!');
  }

  /**
   * Analisa uma imagem de alimento e retorna informações nutricionais COM PESO ESTIMADO
   * @param {Buffer|string} imageData - Buffer da imagem ou base64
   * @param {string} mimeType - Tipo MIME da imagem (ex: image/jpeg)
   * @returns {Promise<Object>} Análise nutricional com peso estimado
   */
  async analyzeFood(imageData, mimeType = 'image/jpeg') {
    if (!this.enabled) {
      throw new Error('Serviço de IA não está habilitado. Configure OPENAI_API_KEY.');
    }

    try {
      // Converter Buffer para base64 se necessário
      const base64Image = Buffer.isBuffer(imageData) 
        ? imageData.toString('base64')
        : imageData;

      const prompt = `Você é um nutricionista especializado em análise visual de alimentos.

Analise esta imagem e forneça informações nutricionais DETALHADAS.

IMPORTANTE: 
1. ESTIME O PESO de cada alimento baseado em referências visuais (tamanho do prato, comparação com objetos, porções típicas)
2. Seja específico nos pesos (ex: "150g", "200g", não use "1 porção")
3. Use sua expertise para estimar pesos realistas

Responda APENAS com JSON válido neste formato:

{
  "foods": [
    {
      "name": "nome do alimento em português",
      "estimatedWeight": "peso estimado em gramas (ex: 150g)",
      "weightConfidence": número entre 0 e 1 (confiança na estimativa),
      "visualReferences": "o que você usou para estimar o peso",
      "calories": número (kcal baseado no peso estimado),
      "protein": número (g),
      "carbs": número (g),
      "fat": número (g),
      "fiber": número (g),
      "confidence": número entre 0 e 1
    }
  ],
  "plateAnalysis": {
    "plateSize": "pequeno|médio|grande",
    "portionSize": "pequena|média|grande",
    "visualQuality": "descrição da qualidade da imagem"
  },
  "totalCalories": número,
  "totalProtein": número,
  "totalCarbs": número,
  "totalFat": número,
  "totalFiber": número,
  "analysis": "análise detalhada da refeição",
  "healthScore": número entre 0 e 10,
  "suggestions": ["sugestão 1", "sugestão 2"]
}

DICAS PARA ESTIMAR PESO:
- Prato padrão tem ~26cm de diâmetro
- Mão fechada = ~100g de proteína
- Punho = ~100g de carboidrato
- Polegar = ~15g de gordura
- Compare com utensílios visíveis
- Considere densidade do alimento`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // ou "gpt-4-vision-preview"
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const text = response.choices[0].message.content.trim();

      // Limpar resposta para obter apenas o JSON
      let jsonText = text;
      
      // Remover markdown code blocks se existir
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      // Parse do JSON
      const nutritionData = JSON.parse(jsonText);

      return {
        success: true,
        data: nutritionData,
        model: 'gpt-4-vision',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao analisar imagem com IA:', error);
      
      // Retornar resposta de fallback
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackResponse()
      };
    }
  }

  /**
   * Analisa texto descritivo de uma refeição
   * @param {string} description - Descrição da refeição
   * @returns {Promise<Object>} Análise nutricional
   */
  async analyzeTextDescription(description) {
    if (!this.enabled) {
      throw new Error('Serviço de IA não está habilitado. Configure OPENAI_API_KEY.');
    }

    try {
      const prompt = `Você é um nutricionista especializado.

Analise esta descrição de refeição e forneça informações nutricionais:

"${description}"

Responda APENAS com JSON válido neste formato:

{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade especificada ou estimada",
      "calories": número,
      "protein": número,
      "carbs": número,
      "fat": número,
      "fiber": número,
      "confidence": número entre 0 e 1
    }
  ],
  "totalCalories": número,
  "totalProtein": número,
  "totalCarbs": número,
  "totalFat": número,
  "totalFiber": número,
  "analysis": "análise geral",
  "healthScore": número entre 0 e 10,
  "suggestions": ["sugestão 1", "sugestão 2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const text = response.choices[0].message.content.trim();

      // Limpar resposta
      let jsonText = text;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const nutritionData = JSON.parse(jsonText);

      return {
        success: true,
        data: nutritionData,
        model: 'gpt-4-turbo',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao analisar texto com IA:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackResponse()
      };
    }
  }

  /**
   * Resposta de fallback quando a IA falha
   */
  getFallbackResponse() {
    return {
      foods: [{
        name: 'Refeição não identificada',
        quantity: 'N/A',
        estimatedWeight: '0g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        confidence: 0
      }],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      analysis: 'Não foi possível analisar automaticamente. Por favor, adicione as informações manualmente.',
      healthScore: 5,
      suggestions: ['Adicione as informações nutricionais manualmente']
    };
  }

  /**
   * Calcula estimativas avançadas (índice glicêmico, colesterol, etc)
   * @param {Array} foods - Lista de alimentos
   * @returns {Promise<Object>} Estimativas avançadas
   */
  async getAdvancedEstimates(foods) {
    if (!this.enabled) {
      return {
        glycemicIndex: 'N/A',
        glycemicLoad: 'N/A',
        cholesterol: 'N/A',
        sodium: 'N/A'
      };
    }

    try {
      const foodList = foods.map(f => {
        const weight = f.estimatedWeight || f.quantity;
        return `${f.name} (${weight})`;
      }).join(', ');
      
      const prompt = `Estime valores nutricionais avançados para: ${foodList}

Responda APENAS com JSON:
{
  "glycemicIndex": número (0-100),
  "glycemicLoad": "baixa|média|alta",
  "cholesterol": número (mg),
  "sodium": número (mg),
  "vitamins": {
    "A": "quantidade",
    "C": "quantidade",
    "D": "quantidade"
  }
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      let text = response.choices[0].message.content.trim();
      
      if (text.includes('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      return JSON.parse(text);

    } catch (error) {
      console.error('Erro ao calcular estimativas avançadas:', error);
      return {
        glycemicIndex: 'N/A',
        glycemicLoad: 'N/A',
        cholesterol: 'N/A',
        sodium: 'N/A'
      };
    }
  }
}

// Exportar instância única
module.exports = new AIService();
