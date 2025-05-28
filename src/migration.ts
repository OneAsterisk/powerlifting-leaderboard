/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';

interface OldLifterData {
	userId: string;
	displayName: string;
	gender: string;
	selectedUniversity: string;
	age: number;
	lifts: { [key: string]: any };
}

interface OldLiftData {
	userId: string;
	displayName: string;
	squat: number;
	bench: number;
	deadlift: number;
	bodyWeight: number;
	gender: string;
	age: number;
	dotsScore: number;
	selectedUniversity: string;
	total: number;
	liftUID: string;
	liftType: string;
	timestamp: any;
}

export async function migrateToNewStructure(): Promise<void> {
	console.log('Starting migration to new database structure...');

	try {
		// Step 1: Get all data from old 'lifters' collection
		const liftersSnapshot = await getDocs(collection(db, 'lifters'));
		console.log(`Found ${liftersSnapshot.size} lifter documents to migrate`);

		let processedUsers = 0;
		let processedLifts = 0;

		// Step 2: Process each lifter one by one
		for (const lifterDoc of liftersSnapshot.docs) {
			const lifterData = lifterDoc.data() as OldLifterData;
			const userId = lifterData.userId;

			if (!userId) {
				console.warn(`Skipping lifter document ${lifterDoc.id} - no userId`);
				continue;
			}

			console.log(`Processing user: ${lifterData.displayName} (${userId})`);

			// Create new user document
			const userDocRef = doc(db, 'users', userId);

			// Check if user document already exists
			const existingUser = await getDoc(userDocRef);
			if (existingUser.exists()) {
				console.log(`User ${userId} already exists, skipping user creation`);
			} else {
				// Calculate user stats from their lifts
				let bestDots = 0;
				let bestTotal = 0;
				let lastLiftDate: any = null;
				let totalLifts = 0;

				if (lifterData.lifts) {
					const userLifts = Object.values(lifterData.lifts);
					totalLifts = userLifts.length;

					userLifts.forEach((lift: any) => {
						if (lift.dotsScore > bestDots) bestDots = lift.dotsScore;
						if (lift.total > bestTotal) bestTotal = lift.total;
						if (!lastLiftDate || (lift.timestamp && lift.timestamp > lastLiftDate)) {
							lastLiftDate = lift.timestamp;
						}
					});
				}

				// Create user document with individual setDoc call
				await setDoc(userDocRef, {
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
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});

				console.log(`Created user document for ${lifterData.displayName}`);
				processedUsers++;
			}

			// Migrate lifts from lifter document to subcollection
			if (lifterData.lifts) {
				for (const [liftKey, liftData] of Object.entries(lifterData.lifts)) {
					const liftDocRef = doc(db, 'users', userId, 'lifts', liftKey);

					// Check if lift already exists
					const existingLift = await getDoc(liftDocRef);
					if (existingLift.exists()) {
						console.log(`Lift ${liftKey} for user ${userId} already exists, skipping`);
						continue;
					}

					// Create lift document with individual setDoc call
					await setDoc(liftDocRef, {
						...liftData,
						displayName: lifterData.displayName
					});

					processedLifts++;

					// Add a small delay to avoid overwhelming the database
					if (processedLifts % 10 === 0) {
						console.log(`Processed ${processedLifts} lifts so far...`);
						await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
					}
				}
			}
		}

		// Step 3: Process standalone lifts from 'lifts' collection
		console.log('Processing standalone lifts...');
		const liftsSnapshot = await getDocs(collection(db, 'lifts'));
		console.log(`Found ${liftsSnapshot.size} standalone lift documents`);

		for (const liftDoc of liftsSnapshot.docs) {
			const liftData = liftDoc.data() as OldLiftData;
			const userId = liftData.userId;

			if (!userId) {
				console.warn(`Skipping lift document ${liftDoc.id} - no userId`);
				continue;
			}

			// Check if this lift already exists in the new structure
			const liftDocRef = doc(db, 'users', userId, 'lifts', liftDoc.id);
			const existingLift = await getDoc(liftDocRef);

			if (existingLift.exists()) {
				console.log(`Lift ${liftDoc.id} already exists in new structure, skipping`);
				continue;
			}

			// Create user document if it doesn't exist
			const userDocRef = doc(db, 'users', userId);
			const existingUser = await getDoc(userDocRef);

			if (!existingUser.exists()) {
				await setDoc(userDocRef, {
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
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
				processedUsers++;
			}

			// Add lift to subcollection
			await setDoc(liftDocRef, liftData);
			processedLifts++;

			// Add a small delay
			if (processedLifts % 10 === 0) {
				console.log(`Processed ${processedLifts} total lifts...`);
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		console.log('Migration completed successfully!');
		console.log(`Processed ${processedUsers} users and ${processedLifts} lifts`);
		console.log('Next steps:');
		console.log('1. Verify the data in the new structure');
		console.log('2. Update any remaining references to the old collections');
		console.log('3. Consider backing up and then deleting the old collections');
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	}
}

// Function to verify the migration
export async function verifyMigration(): Promise<void> {
	console.log('Verifying migration...');

	try {
		// Count documents in new structure
		const usersSnapshot = await getDocs(collection(db, 'users'));
		console.log(`Users in new structure: ${usersSnapshot.size}`);

		let totalLiftsInNewStructure = 0;
		for (const userDoc of usersSnapshot.docs) {
			const liftsSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'lifts'));
			totalLiftsInNewStructure += liftsSnapshot.size;
		}
		console.log(`Total lifts in new structure: ${totalLiftsInNewStructure}`);

		// Count documents in old structure
		const liftersSnapshot = await getDocs(collection(db, 'lifters'));
		const liftsSnapshot = await getDocs(collection(db, 'lifts'));

		console.log(`Lifters in old structure: ${liftersSnapshot.size}`);
		console.log(`Lifts in old structure: ${liftsSnapshot.size}`);

		// Calculate total lifts in old lifters collection
		let totalLiftsInOldLifters = 0;
		for (const lifterDoc of liftersSnapshot.docs) {
			const lifterData = lifterDoc.data();
			if (lifterData.lifts) {
				totalLiftsInOldLifters += Object.keys(lifterData.lifts).length;
			}
		}
		console.log(`Total lifts in old lifters collection: ${totalLiftsInOldLifters}`);

		console.log('Verification completed!');
	} catch (error) {
		console.error('Verification failed:', error);
	}
}

// Function to clean up old collections (use with caution!)
export async function cleanupOldCollections(): Promise<void> {
	console.warn(
		'⚠️  This will delete the old collections. Make sure you have verified the migration first!'
	);
	console.log('This function is intentionally not implemented for safety.');
	console.log(
		'If you want to clean up, manually delete the old collections from the Firebase console.'
	);
}
