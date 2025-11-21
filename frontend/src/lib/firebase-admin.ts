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

// Safe exports that won't crash build if initialization failed
const getAdminDb = () => {
    if (!admin.apps.length) {
        console.warn('⚠️ Warning: Attempting to access Firestore without initialized app');
        return null as unknown as admin.firestore.Firestore;
    }
    return admin.firestore();
};

const getAdminAuth = () => {
    if (!admin.apps.length) {
        console.warn('⚠️ Warning: Attempting to access Auth without initialized app');
        return null as unknown as admin.auth.Auth;
    }
    return admin.auth();
};

const getAdminStorage = () => {
    if (!admin.apps.length) {
        console.warn('⚠️ Warning: Attempting to access Storage without initialized app');
        return null as unknown as admin.storage.Storage;
    }
    return admin.storage();
};

// Export instances directly if app is initialized, otherwise proxies/nulls would be better
// but for now let's try to initialize if possible, otherwise these will throw at runtime
// which is better than build time if we can avoid top-level access.
// However, to fix the build error specifically:

export const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
export const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
export const adminStorage = admin.apps.length ? admin.storage() : {} as admin.storage.Storage;
