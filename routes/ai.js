/**
 * Rotas de IA - Análise Nutricional com Gemini
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiService = require('../services/ai');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

/**
 * POST /api/ai/analyze-image
 * Analisa uma imagem de alimento e retorna informações nutricionais
 */
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    console.log(`🤖 Analisando imagem: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await aiService.analyzeFood(
      req.file.buffer,
      req.file.mimetype
    );

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error,
        fallback: result.fallback,
        message: 'Não foi possível analisar a imagem. Use os valores de fallback ou adicione manualmente.'
      });
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao analisar imagem:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: aiService.getFallbackResponse()
    });
  }
});

/**
 * POST /api/ai/analyze-text
 * Analisa descrição textual de uma refeição
 */
router.post('/analyze-text', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Descrição da refeição é obrigatória'
      });
    }

    console.log(`🤖 Analisando texto: "${description.substring(0, 50)}..."`);

    const result = await aiService.analyzeTextDescription(description);

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error,
        fallback: result.fallback,
        message: 'Não foi possível analisar o texto. Use os valores de fallback ou adicione manualmente.'
      });
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao analisar texto:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: aiService.getFallbackResponse()
    });
  }
});

/**
 * POST /api/ai/advanced-estimates
 * Calcula estimativas avançadas (índice glicêmico, colesterol, etc)
 */
router.post('/advanced-estimates', async (req, res) => {
  try {
    const { foods } = req.body;

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de alimentos é obrigatória'
      });
    }

    console.log(`🤖 Calculando estimativas avançadas para ${foods.length} alimento(s)`);

    const estimates = await aiService.getAdvancedEstimates(foods);

    res.json({
      success: true,
      data: estimates
    });

  } catch (error) {
    console.error('❌ Erro ao calcular estimativas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai/status
 * Verifica se o serviço de IA está habilitado
 */
router.get('/status', (req, res) => {
  res.json({
    enabled: aiService.enabled,
    model: aiService.enabled ? 'gpt-4-vision' : null,
    message: aiService.enabled 
      ? 'Serviço de IA (OpenAI Vision) está funcionando!' 
      : 'Configure OPENAI_API_KEY para habilitar a IA'
  });
});

module.exports = router;

