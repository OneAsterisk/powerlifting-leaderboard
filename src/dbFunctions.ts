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
	serverTimestamp
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Lift } from './types';
export interface UserInfo {
	displayName: string;
	gender: string;
	selectedUniversity: string;
}
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

export const updateUserInfo = async (
	user: User,
	selectedUniversity: string,
	gender: string,
): Promise<void> => {
	if(user){
		try{
			const updatedData = {
				selectedUniversity: selectedUniversity,
				gender: gender,
			}
			const lifterDocRef = doc(db, 'lifters', user.uid);
			await setDoc(lifterDocRef,updatedData, {merge: true});
		} catch (error) {
			console.error('Error updating user info:', error);
			throw error;
	}
}
}

// Function to submit a new lift
export const submitLift = async (
	user: User,
	squat: number,
	bench: number,
	deadlift: number,
	bodyWeight: number,
	age: number,
	gender: string,
	selectedUniversity: string
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
				gender,
				age,
				dotsScore,
				selectedUniversity,
				total,
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
							age,
							total,
							dotsScore,
							selectedUniversity,
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
export const getAllLifts = (
	callback: (lifts: any[]) => void
	// limitCount: number = 10
): (() => void) => {
	const q = query(collection(db, 'lifts'), orderBy('dotsScore', 'desc'));

	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const topLifts = querySnapshot.docs.map((doc, index) => {
			const data = doc.data() as Lift & { displayName: string };
			return {
				rank: index + 1,
				...data,
				formattedDate: formatDate(data.timestamp),
				selectedUniversity: data.selectedUniversity || 'Not Specified'
			};
		});
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
				gender: data.gender,
				selectedUniversity: data.selectedUniversity || 'Not Specified'
			};
		});
		callback(userInfo[0]);
	});

	return unsubscribe;
};
export const getUserInfo = async (userId: string): Promise<UserInfo | null> => {
	try {
		const lifterRef = doc(db, 'lifters', userId);
		const lifterDoc = await getDoc(lifterRef);

		if (lifterDoc.exists()) {
			const data = lifterDoc.data() as LifterData;
			return {
				displayName: data.displayName,
				gender: data.gender,
				selectedUniversity: data.selectedUniversity || '' // Add a default value if it doesn't exist
			};
		} else {
			return null;
		}
	} catch (error) {
		console.error('Error fetching user information:', error);
		throw error;
	}
};
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
