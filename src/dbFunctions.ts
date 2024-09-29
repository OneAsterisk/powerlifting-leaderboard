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

// Interface for a single lift
interface Lift {
	squat: number;
	bench: number;
	deadlift: number;
	age: number;
	total: number;
	dotsScore: number;
	selectedUniversity: string;
	timestamp: any;
}
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
			console.log(`SelectedUni: ${selectedUniversity}`);
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
export const getTopLifts = (
	callback: (lifts: any[]) => void,
	limitCount: number = 10
): (() => void) => {
	const q = query(collection(db, 'lifts'), orderBy('dotsScore', 'desc'), limit(limitCount));

	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const topLifts = querySnapshot.docs.map((doc, index) => {
			const data = doc.data() as Lift & { displayName: string };
			console.log(data.dotsScore);
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
export const getUserLifts = async (userId: string): Promise<Lift[]> => {
	try {
		const lifterRef = doc(db, 'lifters', userId);
		const lifterDoc = await getDoc(lifterRef);

		if (lifterDoc.exists()) {
			const data = lifterDoc.data() as LifterData;
			return Object.values(data.lifts).map((lift) => ({
				...lift,
				formattedDate: formatDate(lift.timestamp)
			}));
		} else {
			return [];
		}
	} catch (error) {
		console.error('Error fetching user lifts:', error);
		throw error;
	}
};

// Helper function to format date
function formatDate(timestamp: { toDate: () => Date }): string {
	if (!timestamp) return '';
	const date = timestamp.toDate();
	return date.toLocaleDateString();
}
