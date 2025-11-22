
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';

async function checkUser() {
    const phone = '5547992567770';
    const phonePlus = '+5547992567770';

    console.log('Checking for phone:', phone);
    const snapshot1 = await adminDb.collection('users').where('phone', '==', phone).get();
    console.log('Query 1 (raw) found:', snapshot1.size);
    snapshot1.docs.forEach(doc => console.log(doc.id, doc.data()));

    console.log('Checking for phone:', phonePlus);
    const snapshot2 = await adminDb.collection('users').where('phone', '==', phonePlus).get();
    console.log('Query 2 (+) found:', snapshot2.size);
    snapshot2.docs.forEach(doc => console.log(doc.id, doc.data()));

    // Also check by role just to see
    console.log('Checking all patients...');
    const snapshot3 = await adminDb.collection('users').where('role', '==', 'patient').get();
    console.log('Total patients found:', snapshot3.size);
    snapshot3.docs.forEach(doc => console.log(doc.id, doc.data().phone, doc.data().name));
}

checkUser().then(() => process.exit(0)).catch(console.error);
