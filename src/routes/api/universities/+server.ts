import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const country = url.searchParams.get('country') || 'United States';
	const apiUrl = `https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Error from external API: ${response.status} ${response.statusText}`);
			console.error('Response:', errorText);
			return json({ error: 'Failed to fetch data from external API' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error fetching data:', error);
		return json({ error: 'An error occurred while fetching data' }, { status: 500 });
	}
}
