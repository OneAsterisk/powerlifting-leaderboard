/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/firebase';
import {
	collection,
	doc,
	setDoc,
	getDoc,
	addDoc,
	query,
	orderBy,
	limit,
	onSnapshot,
	updateDoc,
	serverTimestamp,
	where,
	getDocs,
	deleteDoc
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Lift, UserInfo } from './types';
import { v4 as uuidv4 } from 'uuid';
import { weightUnit } from './stores/weightUnitStore';
import { get } from 'svelte/store';

// Interface for a lifter's document
interface LifterData {
	userId: string;
	displayName: string;
	gender: string;
	selectedUniversity: string;
	lifts: { [key: string]: Lift };
}

function ageCoefCalc(age: number, dotsScore: number): number {
	switch (age) {
		case 14:
			return parseFloat((dotsScore * 1.23).toFixed(2));
		case 15:
			return parseFloat((dotsScore * 1.18).toFixed(2));
		case 16:
			return parseFloat((dotsScore * 1.13).toFixed(2));
		case 17:
			return parseFloat((dotsScore * 1.08).toFixed(2));
		case 18:
			return parseFloat((dotsScore * 1.06).toFixed(2));
		case 19:
			return parseFloat((dotsScore * 1.04).toFixed(2));
		case 20:
			return parseFloat((dotsScore * 1.03).toFixed(2));
		case 21:
			return parseFloat((dotsScore * 1.02).toFixed(2));
		case 22:
			return parseFloat((dotsScore * 1.01).toFixed(2));
		default:
			return parseFloat(dotsScore.toFixed(2));
	}
}

function Calculate_DOTS(bodyWeight: number, total: number, gender: string): number {
	total = total / 2.205;
	bodyWeight = bodyWeight / 2.205;
	const maleCoeff = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
	const femaleCoeff = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];
	const isFemale = gender === 'Female' ? true : false;
	let denominator = isFemale ? femaleCoeff[0] : maleCoeff[0];
	const coeff = isFemale ? femaleCoeff : maleCoeff;
	const maxbw = isFemale ? 150 : 210;
	const bw = Math.min(Math.max(bodyWeight, 40), maxbw);

	for (let i = 1; i < coeff.length; i++) {
		denominator += coeff[i] * Math.pow(bw, i);
	}

	const score: number = (500 / denominator) * total;
	return parseFloat(score.toFixed(2));
}

export const updateUserInfo = async (user: User, updatedInfo: Partial<UserInfo>): Promise<void> => {
	if (user) {
		try {
			const lifterDocRef = doc(db, 'lifters', user.uid);
			await setDoc(lifterDocRef, updatedInfo, { merge: true });
		} catch (error) {
			console.error('Error updating user info:', error);
			throw error;
		}
	}
};

// Function to submit a new lift
export const submitLift = async (
	user: User,
	squat: number,
	bench: number,
	deadlift: number,
	bodyWeight: number,
	age: number,
	gender: string,
	selectedUniversity: string,
	liftUID: string,
	liftType: string
): Promise<void> => {
	if (user) {
		const validateLift = (
			bodyWeight: number,
			lift: number,
			liftType: 'squat' | 'bench' | 'deadlift'
		): boolean => {
			const maxRatios = {
				squat: 5, // world record territory is around 5x bodyweight
				bench: 2.5, // world record territory is around 3.5x bodyweight
				deadlift: 5 // world record territory is around 5.5x bodyweight
			};
			return lift <= bodyWeight * maxRatios[liftType];
		};
		if (
			!validateLift(bodyWeight, squat, 'squat') ||
			!validateLift(bodyWeight, bench, 'bench') ||
			!validateLift(bodyWeight, deadlift, 'deadlift')
		) {
			throw new Error('Lift exceeds maximum allowed weight.');
		}
		if (get(weightUnit) === 'kg') {
			bodyWeight = bodyWeight * 2.205;
			squat = squat * 2.205;
			bench = bench * 2.205;
			deadlift = deadlift * 2.205;
		}
		try {
			const total: number = bench + squat + deadlift;

			const dotsScore: number = ageCoefCalc(age, Calculate_DOTS(bodyWeight, total, gender));

			// Create a new lift document in the 'lifts' collection
			const liftDocRef = await addDoc(collection(db, 'lifts'), {
				userId: user.uid,
				displayName: user.displayName,
				squat,
				bench,
				deadlift,
				bodyWeight,
				gender,
				age,
				dotsScore,
				selectedUniversity,
				total,
				liftUID,
				liftType,
				timestamp: serverTimestamp()
			});

			// Add or update the lift in the user's specific lifter table
			const lifterDocRef = doc(db, 'lifters', user.uid);
			await setDoc(
				lifterDocRef,
				{
					userId: user.uid,
					displayName: user.displayName,
					gender,
					selectedUniversity,
					lifts: {
						[liftDocRef.id]: {
							squat,
							bench,
							deadlift,
							bodyWeight,
							age,
							total,
							dotsScore,
							selectedUniversity,
							liftUID,
							liftType,
							timestamp: serverTimestamp()
						}
					}
				},
				{ merge: true }
			);
		} catch (error) {
			console.error('Error submitting lift:', error);
			throw error;
		}
	} else {
		throw new Error('User not authenticated');
	}
}; // Function to get top lifts
export const getAllLifts = (callback: (lifts: Lift[]) => void): (() => void) => {
	const q = query(collection(db, 'lifts'), orderBy('dotsScore', 'desc'));
	let count = 0;
	const userIds = new Set<string>();
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const topLifts = querySnapshot.docs
			.map((doc) => {
				const data = doc.data() as Lift & { displayName: string };
				if (!userIds.has(data.userId)) {
					count++;
					userIds.add(data.userId);
					return {
						rank: count,
						...data,
						formattedDate: formatDate(data.timestamp),
						selectedUniversity: data.selectedUniversity || 'Not Specified'
					} as Lift;
				}
				return null;
			})
			.filter((lift): lift is Lift => lift !== null);

		callback(topLifts);
	});
	return unsubscribe;
};

// export const updateAllDotsScores = async (): Promise<void> => {
// 	try {
// 		// Step 1: Fetch all the lifts from Firestore
// 		const liftsCollection = collection(db, 'lifts');
// 		const querySnapshot = await getDocs(liftsCollection);

// 		// Step 2: Loop through each lift and update the DOTS score
// 		querySnapshot.forEach(async (docSnapshot) => {
// 			const liftData = docSnapshot.data() as Lift;
// 			const { age, dotsScore, userId } = liftData;

// 			if (age && dotsScore) {
// 				// Step 3: Calculate the new DOTS score
// 				const newDotsScore = ageCoefCalc(age, dotsScore);

// 				// Step 4: Update the lift document with the new DOTS score
// 				const liftDocRef = doc(db, 'lifts', docSnapshot.id);
// 				await updateDoc(liftDocRef, { dotsScore: newDotsScore });

// 				// Step 5: Update the lifter's document with the new DOTS score
// 				const lifterQuery = query(
// 					collection(db, 'lifters'),
// 					where('userId', '==', userId),
// 					limit(1)
// 				);
// 				const lifterSnapshot = await getDocs(lifterQuery);

// 				if (!lifterSnapshot.empty) {
// 					const lifterDoc = lifterSnapshot.docs[0];
// 					const lifterRef = doc(db, 'lifters', lifterDoc.id);
// 					await updateDoc(lifterRef, {
// 						['lifts.' + docSnapshot.id + '.dotsScore']: newDotsScore
// 					});
// 				}

// 				console.log(`Updated DOTS score for lift ID ${docSnapshot.id} and lifter document`);
// 			}
// 		});

// 		console.log('All DOTS scores have been updated.');
// 	} catch (error) {
// 		console.error('Error updating DOTS scores:', error);
// 	}
// };
export const getUserName = async (displayName: string): Promise<string> => {
	const q = query(collection(db, 'lifters'), where('displayName', '==', displayName), limit(1));
	const querySnapshot = await getDocs(q);
	const userName = querySnapshot.docs[0]?.data().userName || '';
	return userName;
};
export const getUserInfo = (
	userId: string,
	callback: (userInfo: UserInfo | null) => void
): (() => void) => {
	const q = query(collection(db, 'lifters'), where('userId', '==', userId), limit(1));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const userInfo = querySnapshot.docs.map((doc) => {
			const data = doc.data() as UserInfo;
			return {
				displayName: data.displayName,
				userName: data.userName || data.displayName, // Fallback to displayName if userName is not set
				gender: data.gender,
				selectedUniversity: data.selectedUniversity || 'Not Specified'
			};
		});
		callback(userInfo[0]);
	});
	return unsubscribe;
};

export const getUserLifts = (
	displayName: string,
	callback: (lifts: Lift[]) => void
): (() => void) => {
	const q = query(collection(db, 'lifters'), where('displayName', '==', displayName), limit(1));
	const unsubscribe = onSnapshot(
		q,
		(querySnapshot) => {
			if (!querySnapshot.empty) {
				const docSnapshot = querySnapshot.docs[0];
				const data = docSnapshot.data() as LifterData;
				const lifts: Lift[] = Object.values(data.lifts).map((lift) => ({
					...lift,
					formattedDate: formatDate(lift.timestamp)
				}));
				callback(lifts);
			} else {
				callback([]);
			}
		},
		(error) => {
			console.error('Error fetching user lifts:', error);
			callback([]);
		}
	);
	return unsubscribe;
};
// Function to get lifts for a specific user
export const getUserLiftsPersonal = (
	userId: string,
	callback: (lifts: Lift[]) => void
): (() => void) => {
	const lifterRef = doc(db, 'lifters', userId);
	const unsubscribe = onSnapshot(
		lifterRef,
		(docSnapshot) => {
			if (docSnapshot.exists()) {
				const data = docSnapshot.data() as LifterData;
				const lifts: Lift[] = Object.values(data.lifts).map((lift) => ({
					...lift,
					formattedDate: formatDate(lift.timestamp)
				}));
				callback(lifts);
			} else {
				callback([]);
			}
		},
		(error) => {
			console.error('Error fetching user lifts:', error);
			callback([]);
		}
	);

	return unsubscribe;
};

// Helper function to format date
function formatDate(timestamp: { toDate: () => Date }): string {
	if (!timestamp) return '';
	const date = timestamp.toDate();
	return date.toLocaleDateString();
}

export const deleteLift = async (user: User, liftUID: string | undefined): Promise<void> => {
	if (user && liftUID) {
		try {
			// Delete from 'lifts' collection
			const q = query(
				collection(db, 'lifts'),
				where('userId', '==', user.uid),
				where('liftUID', '==', liftUID)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const docToDelete = querySnapshot.docs[0];
				await deleteDoc(docToDelete.ref);
			}

			// Delete from 'lifters' collection
			const lifterDocRef = doc(db, 'lifters', user.uid);
			const lifterDocSnap = await getDoc(lifterDocRef);

			if (lifterDocSnap.exists()) {
				const lifterData = lifterDocSnap.data() as LifterData;

				if (lifterData.lifts && liftUID in lifterData.lifts) {
					delete lifterData.lifts[liftUID];

					await updateDoc(lifterDocRef, {
						lifts: lifterData.lifts
					});
				}
			}
		} catch (error) {
			console.error('Error deleting lift:', error);
			console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
			throw error;
		}
	} else {
		console.error('User not authenticated or liftUID is undefined');
		throw new Error('User not authenticated or liftUID is undefined');
	}
};

export const updateLift = async (
	user: User,
	liftUID: string | undefined,
	updatedLift: Partial<Lift>
): Promise<void> => {
	if (user) {
		try {
			const total: number =
				(updatedLift.squat ?? 0) + (updatedLift.bench ?? 0) + (updatedLift.deadlift ?? 0);
			const dotsScore: number = Calculate_DOTS(
				updatedLift.bodyWeight ?? 0,
				total,
				updatedLift.gender ?? 'Male'
			);

			if (!liftUID) {
				// If liftUID is not provided, create a new document
				const newLiftRef = doc(collection(db, 'lifts'));
				liftUID = uuidv4(); // Generate a new UUID for liftUID
				await setDoc(newLiftRef, {
					userId: user.uid,
					liftUID,
					...updatedLift,
					total,
					dotsScore,
					timestamp: serverTimestamp()
				});
			} else {
				// If liftUID is provided, try to update existing document
				const q = query(
					collection(db, 'lifts'),
					where('userId', '==', user.uid),
					where('liftUID', '==', liftUID)
				);
				let querySnapshot = await getDocs(q);

				// If no document found with liftUID, try searching with liftID for legacy support
				if (querySnapshot.empty) {
					const qLegacy = query(
						collection(db, 'lifts'),
						where('userId', '==', user.uid),
						where('liftID', '==', liftUID)
					);
					querySnapshot = await getDocs(qLegacy);
				}

				if (querySnapshot.empty) {
					// If still no matching document found, create a new one
					const newLiftRef = doc(collection(db, 'lifts'));
					await setDoc(newLiftRef, {
						userId: user.uid,
						displayName: user.displayName,
						liftUID,
						...updatedLift,
						total,
						dotsScore,
						timestamp: serverTimestamp()
					});
				} else {
					// Update existing document
					const docToUpdate = querySnapshot.docs[0];

					await updateDoc(docToUpdate.ref, {
						...updatedLift,
						liftUID, // Ensure we're using liftUID going forward
						total,
						dotsScore,
						timestamp: serverTimestamp()
					});
				}
			}

			// Update the lift in the 'lifters' collection
			const lifterDocRef = doc(db, 'lifters', user.uid);
			const lifterDocSnap = await getDoc(lifterDocRef);

			if (lifterDocSnap.exists()) {
				const lifterData = lifterDocSnap.data() as LifterData;

				// Update or add the lift in the lifter's document
				lifterData.lifts = lifterData.lifts || {};
				lifterData.lifts[liftUID] = {
					...(updatedLift as Lift),
					liftUID,
					total,
					dotsScore,
					timestamp: serverTimestamp()
				};

				// Remove old liftID entry if it exists
				if (lifterData.lifts[updatedLift.liftID as string]) {
					delete lifterData.lifts[updatedLift.liftID as string];
				}

				await updateDoc(lifterDocRef, {
					lifts: lifterData.lifts
				});
			} else {
				console.error(`Lifter document not found for user: ${user.uid}`);
				throw new Error('Lifter document not found');
			}
		} catch (error) {
			console.error('Error updating lift:', error);
			console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
			throw error;
		}
	} else {
		console.error('User not authenticated');
		throw new Error('User not authenticated');
	}
};

export const searchPeople = async (searchQuery: string): Promise<any[]> => {
	const q = query(
		collection(db, 'lifters'),
		where('displayName', '>=', searchQuery),
		where('displayName', '<=', searchQuery + '\uf8ff'),
		limit(10)
	);

	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({
		id: doc.id,
		name: doc.data().displayName
	}));
};
