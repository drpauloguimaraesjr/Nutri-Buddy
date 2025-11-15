const { randomUUID } = require('crypto');
const path = require('path');
const { admin } = require('../config/firebase');

const getBucket = () => {
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET || admin.app().options.storageBucket;

  if (!bucketName) {
    throw new Error(
      'Firebase Storage bucket não configurado. Defina FIREBASE_STORAGE_BUCKET no .env'
    );
  }

  return admin.storage().bucket(bucketName);
};

const sanitizeFileName = (filename = '') => {
  const baseName = path.basename(filename).toLowerCase();
  return baseName.replace(/[^a-z0-9.\-_]/g, '-');
};

/**
 * Upload media file used in chat conversations
 */
async function uploadChatMedia({
  buffer,
  mimeType,
  originalName,
  conversationId,
  patientId,
  prescriberId,
  uploadedBy,
  mediaType = 'file',
}) {
  if (!buffer || !conversationId || !patientId) {
    throw new Error('Parâmetros obrigatórios ausentes para upload de mídia');
  }

  const bucket = getBucket();
  const safeName = sanitizeFileName(originalName || `${mediaType}.bin`);
  const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
  const storagePath = `patients/${patientId}/chat/${conversationId}/${fileName}`;
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        conversationId,
        patientId,
        prescriberId,
        uploadedBy,
        mediaType,
      },
    },
    resumable: false,
  });

  return {
    storagePath,
    contentType: mimeType,
    size: buffer.length,
    name: originalName || fileName,
    type: mediaType,
  };
}

/**
 * Generate a signed download URL for a file stored in Firebase Storage
 */
async function generateSignedUrl(storagePath, expiresInMinutes = 60) {
  if (!storagePath) {
    throw new Error('storagePath é obrigatório para gerar URL assinada');
  }

  const bucket = getBucket();
  const file = bucket.file(storagePath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
    responseDisposition: `inline; filename="${path.basename(storagePath)}"`,
  });

  return {
    url,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  };
}

module.exports = {
  uploadChatMedia,
  generateSignedUrl,
};


