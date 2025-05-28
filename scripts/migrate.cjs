const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://powerlifting-leaderboard-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function migrateToNewStructure() {
	console.log('🚀 Starting migration to new database structure...');

	try {
		// Step 1: Get all data from old 'lifters' collection
		const liftersSnapshot = await db.collection('lifters').get();
		console.log(`📊 Found ${liftersSnapshot.size} lifter documents to migrate`);

		let processedUsers = 0;
		let processedLifts = 0;

		// Step 2: Process each lifter one by one
		for (const lifterDoc of liftersSnapshot.docs) {
			const lifterData = lifterDoc.data();
			const userId = lifterData.userId;

			if (!userId) {
				console.warn(`⚠️  Skipping lifter document ${lifterDoc.id} - no userId`);
				continue;
			}

			console.log(`👤 Processing user: ${lifterData.displayName} (${userId})`);

			// Create new user document
			const userDocRef = db.collection('users').doc(userId);

			// Check if user document already exists
			const existingUser = await userDocRef.get();
			if (existingUser.exists) {
				console.log(`✅ User ${userId} already exists, skipping user creation`);
			} else {
				// Calculate user stats from their lifts
				let bestDots = 0;
				let bestTotal = 0;
				let lastLiftDate = null;
				let totalLifts = 0;

				if (lifterData.lifts) {
					const userLifts = Object.values(lifterData.lifts);
					totalLifts = userLifts.length;

					userLifts.forEach((lift) => {
						if (lift.dotsScore > bestDots) bestDots = lift.dotsScore;
						if (lift.total > bestTotal) bestTotal = lift.total;
						if (
							!lastLiftDate ||
							(lift.timestamp && lift.timestamp.toMillis() > lastLiftDate?.toMillis())
						) {
							lastLiftDate = lift.timestamp;
						}
					});
				}

				// Create user document
				await userDocRef.set({
					displayName: lifterData.displayName || '',
					email: '', // Will need to be filled in later
					gender: lifterData.gender || 'Male',
					university: lifterData.selectedUniversity || '',
					userName: lifterData.displayName || '',
					stats: {
						bestDots,
						bestTotal,
						lastLiftDate,
						totalLifts
					},
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				});

				console.log(`✅ Created user document for ${lifterData.displayName}`);
				processedUsers++;
			}

			// Migrate lifts from lifter document to subcollection
			if (lifterData.lifts) {
				for (const [liftKey, liftData] of Object.entries(lifterData.lifts)) {
					const liftDocRef = userDocRef.collection('lifts').doc(liftKey);

					// Check if lift already exists
					const existingLift = await liftDocRef.get();
					if (existingLift.exists) {
						console.log(`⏭️  Lift ${liftKey} for user ${userId} already exists, skipping`);
						continue;
					}

					// Create lift document
					await liftDocRef.set({
						...liftData,
						displayName: lifterData.displayName
					});

					processedLifts++;

					// Progress update
					if (processedLifts % 10 === 0) {
						console.log(`📈 Processed ${processedLifts} lifts so far...`);
					}
				}
			}
		}

		// Step 3: Process standalone lifts from 'lifts' collection
		console.log('📋 Processing standalone lifts...');
		const liftsSnapshot = await db.collection('lifts').get();
		console.log(`📊 Found ${liftsSnapshot.size} standalone lift documents`);

		for (const liftDoc of liftsSnapshot.docs) {
			const liftData = liftDoc.data();
			const userId = liftData.userId;

			if (!userId) {
				console.warn(`⚠️  Skipping lift document ${liftDoc.id} - no userId`);
				continue;
			}

			// Check if this lift already exists in the new structure
			const liftDocRef = db.collection('users').doc(userId).collection('lifts').doc(liftDoc.id);
			const existingLift = await liftDocRef.get();

			if (existingLift.exists) {
				console.log(`⏭️  Lift ${liftDoc.id} already exists in new structure, skipping`);
				continue;
			}

			// Create user document if it doesn't exist
			const userDocRef = db.collection('users').doc(userId);
			const existingUser = await userDocRef.get();

			if (!existingUser.exists) {
				await userDocRef.set({
					displayName: liftData.displayName || '',
					email: '',
					gender: liftData.gender || 'Male',
					university: liftData.selectedUniversity || '',
					userName: liftData.displayName || '',
					stats: {
						bestDots: liftData.dotsScore || 0,
						bestTotal: liftData.total || 0,
						lastLiftDate: liftData.timestamp,
						totalLifts: 1
					},
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				});
				processedUsers++;
			}

			// Add lift to subcollection
			await liftDocRef.set(liftData);
			processedLifts++;

			// Progress update
			if (processedLifts % 10 === 0) {
				console.log(`📈 Processed ${processedLifts} total lifts...`);
			}
		}

		console.log('🎉 Migration completed successfully!');
		console.log(`📊 Final Stats:`);
		console.log(`   👥 Users processed: ${processedUsers}`);
		console.log(`   🏋️  Lifts processed: ${processedLifts}`);
		console.log('');
		console.log('📋 Next steps:');
		console.log('1. Run verification script to check data integrity');
		console.log('2. Test your application with the new structure');
		console.log('3. Update any remaining references to old collections');
		console.log('4. Consider backing up and then deleting old collections');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	}
}

async function verifyMigration() {
	console.log('🔍 Verifying migration...');

	try {
		// Count documents in new structure
		const usersSnapshot = await db.collection('users').get();
		console.log(`👥 Users in new structure: ${usersSnapshot.size}`);

		let totalLiftsInNewStructure = 0;
		for (const userDoc of usersSnapshot.docs) {
			const liftsSnapshot = await userDoc.ref.collection('lifts').get();
			totalLiftsInNewStructure += liftsSnapshot.size;
		}
		console.log(`🏋️  Total lifts in new structure: ${totalLiftsInNewStructure}`);

		// Count documents in old structure
		const liftersSnapshot = await db.collection('lifters').get();
		const liftsSnapshot = await db.collection('lifts').get();

		console.log(`📊 Lifters in old structure: ${liftersSnapshot.size}`);
		console.log(`📊 Lifts in old structure: ${liftsSnapshot.size}`);

		// Calculate total lifts in old lifters collection
		let totalLiftsInOldLifters = 0;
		for (const lifterDoc of liftersSnapshot.docs) {
			const lifterData = lifterDoc.data();
			if (lifterData.lifts) {
				totalLiftsInOldLifters += Object.keys(lifterData.lifts).length;
			}
		}
		console.log(`📊 Total lifts in old lifters collection: ${totalLiftsInOldLifters}`);

		// Summary
		console.log('');
		console.log('📋 Verification Summary:');
		console.log(`   Expected lifts to migrate: ${totalLiftsInOldLifters + liftsSnapshot.size}`);
		console.log(`   Actually migrated: ${totalLiftsInNewStructure}`);

		if (totalLiftsInNewStructure >= totalLiftsInOldLifters) {
			console.log('✅ Migration appears successful!');
		} else {
			console.log('⚠️  Some lifts may not have been migrated. Check the logs above.');
		}
	} catch (error) {
		console.error('❌ Verification failed:', error);
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--verify')) {
		await verifyMigration();
	} else if (args.includes('--migrate')) {
		await migrateToNewStructure();
	} else {
		console.log('🔧 Firebase Migration Tool');
		console.log('');
		console.log('Usage:');
		console.log('  node migrate.js --migrate   Run the migration');
		console.log('  node migrate.js --verify    Verify the migration');
		console.log('');
		console.log('⚠️  Make sure to backup your database before running migration!');
	}

	process.exit(0);
}

main().catch(console.error);
