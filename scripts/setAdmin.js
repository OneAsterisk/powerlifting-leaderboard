// scripts/setAdmin.js

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get service account key path from environment variable or use default
const serviceAccountPath =
	process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
	path.resolve(__dirname, 'serviceAccountKey.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
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

// Get user UID from environment variable or command line argument
const userUid = process.env.ADMIN_USER_UID || process.argv[2];

if (!userUid) {
	console.error(
		'Error: No user UID provided. Set ADMIN_USER_UID environment variable or pass as command line argument.'
	);
	console.error('Usage: node setAdmin.js <USER_UID>');
	process.exit(1);
}

// Execute the function
setAdminClaim(userUid).then(() => process.exit());
