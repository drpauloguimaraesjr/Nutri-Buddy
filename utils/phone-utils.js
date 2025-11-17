// ================================================================
// NUTRIBUDDY - PHONE UTILITIES
// ================================================================
// Funções para normalizar e formatar números de telefone
// ================================================================

/**
 * Normaliza número de telefone brasileiro para formato internacional
 * @param {string} phone - Número em qualquer formato
 * @returns {string} Número formatado (+5547999999999)
 * 
 * Exemplos:
 * - "47992567770" -> "5547992567770"
 * - "(47) 99256-7770" -> "5547992567770"
 * - "+55 47 99256-7770" -> "5547992567770"
 * - "5547992567770" -> "5547992567770"
 */
function normalizePhoneBR(phone) {
  if (!phone) return '';
  
  // Remover todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Se começar com 0, remover (alguns podem digitar 047...)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Casos possíveis:
  // 1. Já tem +55 ou 55 no início
  // 2. Só tem DDD + número (10 ou 11 dígitos)
  
  // Se já tem 55 no início e tem 12-13 dígitos, está OK
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned;
  }
  
  // Se não tem 55 e tem 10-11 dígitos (DDD + número), adicionar 55
  if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
    return '55' + cleaned;
  }
  
  // Se já tem 55 mas número está incompleto, retornar como está
  if (cleaned.startsWith('55')) {
    return cleaned;
  }
  
  // Caso padrão: retornar como está
  return cleaned;
}

/**
 * Formata número para exibição (+55 47 99256-7770)
 * @param {string} phone - Número normalizado
 * @returns {string} Número formatado para exibição
 */
function formatPhoneDisplay(phone) {
  if (!phone) return '';
  
  const normalized = normalizePhoneBR(phone);
  
  // Extrair partes: +55 (DDD) XXXXX-XXXX
  if (normalized.length === 13) {
    // +55 47 99256-7770 (celular com 9)
    return `+${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 9)}-${normalized.substring(9, 13)}`;
  } else if (normalized.length === 12) {
    // +55 47 3256-7770 (fixo)
    return `+${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 8)}-${normalized.substring(8, 12)}`;
  }
  
  return phone;
}

/**
 * Formata número para WhatsApp (+5547999999999)
 * @param {string} phone - Número em qualquer formato
 * @returns {string} Número no formato internacional com +
 */
function formatPhoneForWhatsApp(phone) {
  const normalized = normalizePhoneBR(phone);
  return '+' + normalized;
}

/**
 * Valida se é um número de telefone brasileiro válido
 * @param {string} phone - Número a validar
 * @returns {boolean} true se válido
 */
function isValidBRPhone(phone) {
  if (!phone) return false;
  
  const normalized = normalizePhoneBR(phone);
  
  // Deve ter 12 (fixo) ou 13 (celular) dígitos com código do país
  if (normalized.length !== 12 && normalized.length !== 13) {
    return false;
  }
  
  // Deve começar com 55 (Brasil)
  if (!normalized.startsWith('55')) {
    return false;
  }
  
  // DDD deve ser válido (11-99)
  const ddd = parseInt(normalized.substring(2, 4));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Se for celular (13 dígitos), deve começar com 9
  if (normalized.length === 13) {
    const firstDigit = normalized.charAt(4);
    if (firstDigit !== '9') {
      return false;
    }
  }
  
  return true;
}

/**
 * Normaliza número para busca no banco (sem + e sem espaços)
 * Tenta múltiplos formatos para maximizar chance de encontrar
 * @param {string} phone - Número em qualquer formato
 * @returns {Array<string>} Array com possíveis variações do número
 */
function getPhoneVariations(phone) {
  if (!phone) return [];
  
  const normalized = normalizePhoneBR(phone);
  const variations = [normalized];
  
  // Adicionar com +
  variations.push('+' + normalized);
  
  // Se tem 55 no início, adicionar versão sem
  if (normalized.startsWith('55')) {
    variations.push(normalized.substring(2));
  }
  
  // Remover duplicatas
  return [...new Set(variations)];
}

/**
 * Remove código do país para exibição local
 * @param {string} phone - Número com código do país
 * @returns {string} Número sem código do país
 */
function removeCountryCode(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Se começa com 55 e tem 12-13 dígitos, remover 55
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned.substring(2);
  }
  
  return cleaned;
}

module.exports = {
  normalizePhoneBR,
  formatPhoneDisplay,
  formatPhoneForWhatsApp,
  isValidBRPhone,
  getPhoneVariations,
  removeCountryCode
};

