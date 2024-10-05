/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Lift {
	rank?: number;
	displayName?: string;
	squat: number;
	bench: number;
	deadlift: number;
	age: number;
	total: number;
	dotsScore: number;
	selectedUniversity: any[];
	timestamp: any; // From Firebase
	formattedDate: string; // Derived property for UI
	userId: string;
}

export interface UserInfo {
	displayName: string;
	gender: string;
	selectedUniversity: string;
}
