import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface University {
	name: string;
	[key: string]: unknown;
}

export const GET: RequestHandler = async ({ url }) => {
	const country = url.searchParams.get('country') || 'United States';
	const apiUrl = `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Error from external API: ${response.status} ${response.statusText}`);
			console.error('Response:', errorText);
			return json({ error: 'Failed to fetch data from external API' }, { status: response.status });
		}

		const data: University[] = await response.json();
		const universityNames = data.map((uni: University) => uni.name).sort();
		return json(universityNames);
	} catch (error) {
		console.error('Error fetching data:', error);
		return json({ error: 'An error occurred while fetching data' }, { status: 500 });
	}
};
