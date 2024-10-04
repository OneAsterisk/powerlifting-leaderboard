/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Lift {
	squat: number;
	bench: number;
	deadlift: number;
	age: number;
	total: number;
	dotsScore: number;
	selectedUniversity: any[];
	timestamp: any; // From Firebase
	formattedDate: string; // Derived property for UI
}

export interface UserInfo {
	displayName: string;
	gender: string;
	selectedUniversity: string;
}
