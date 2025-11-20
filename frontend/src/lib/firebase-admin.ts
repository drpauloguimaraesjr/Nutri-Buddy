```typescript
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log('🔥 Initializing Firebase Admin...');
  console.log('   - Project ID:', projectId ? '✅ Found' : '❌ MISSING');
  console.log('   - Client Email:', clientEmail ? '✅ Found' : '❌ MISSING');
  console.log('   - Private Key:', privateKey ? '✅ Found' : '❌ MISSING');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin environment variables');
  } else {
    try {
      // Handle both literal \n and actual newlines
      const formattedKey = privateKey.includes('\\n') 
        ? privateKey.replace(/\\n/g, '\n') 
        : privateKey;

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
```
