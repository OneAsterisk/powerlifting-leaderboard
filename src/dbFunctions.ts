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

// import { updated } from '$app/stores';
// Interface for a lifter's document
interface LifterData {
	userId: string;
	displayName: string;
	gender: string;
	selectedUniversity: string;
	lifts: { [key: string]: Lift };
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
		try {
			const total: number = bench + squat + deadlift;
			const dotsScore = Calculate_DOTS(bodyWeight, total, gender);

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
};

// Function to get top lifts
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

export const getUserInfoNew = (
	userId: string,
	callback: (userInfo: UserInfo | null) => void
): (() => void) => {
	const q = query(collection(db, 'lifters'), orderBy('userId'), limit(1));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const userInfo = querySnapshot.docs.map((doc) => {
			const data = doc.data() as UserInfo;
			return {
				displayName: data.displayName,
				userName: data.userName || data.displayName, // Fallback to displayName if userName is not set
				gender: data.gender,
				selectedUniversity: data.selectedUniversity || 'Not Specified',
				displayNamePreference: data.displayNamePreference
			};
		});
		callback(userInfo[0]);
	});
	return unsubscribe;
};
// export const getUserInfo = async (userId: string): Promise<UserInfo | null> => {
// 	try {
// 		const lifterRef = doc(db, 'lifters', userId);
// 		const lifterDoc = await getDoc(lifterRef);

// 		if (lifterDoc.exists()) {
// 			const data = lifterDoc.data() as LifterData;
// 			return {
// 				displayName: data.displayName,
// 				gender: data.gender,
// 				selectedUniversity: data.selectedUniversity || '' // Add a default value if it doesn't exist
// 			};
// 		} else {
// 			return null;
// 		}
// 	} catch (error) {
// 		console.error('Error fetching user information:', error);
// 		throw error;
// 	}
// };
// Function to get lifts for a specific user
export const getUserLifts = (userId: string, callback: (lifts: Lift[]) => void): (() => void) => {
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
