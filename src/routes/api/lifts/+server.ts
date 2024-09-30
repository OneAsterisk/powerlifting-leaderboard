import { json } from '@sveltejs/kit';
import clientPromise from '$lib/db/db.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET({ url }) {
	const client = await clientPromise;
	const db = client.db('powerlifting_leaderboard');

	const lifts = await db.collection('lifts').find({}).sort({ total: -1 }).limit(10).toArray();

	return json(lifts);
}

export async function POST({ request }) {
	const client = await clientPromise;
	const db = client.db('powerlifting_leaderboard');

	const liftData = await request.json();
	const result = await db.collection('lifts').insertOne(liftData);

	return json({ id: result.insertedId });
}
