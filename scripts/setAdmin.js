// scripts/setAdmin.js

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(path.resolve(__dirname, 'serviceAccountKey.json'))
});

// Function to set admin claim
async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Success! ${uid} has been granted admin privileges.`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

// Replace 'USER_UID_HERE' with your actual user UID
const userUid = 'QFhSeWBMYQXZi9Z33CbYD5sgKKp1';

// Execute the function
setAdminClaim(userUid).then(() => process.exit());
