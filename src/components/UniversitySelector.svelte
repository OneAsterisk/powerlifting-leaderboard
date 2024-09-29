<script lang="ts">
	import { Input, InputGroup, InputGroupText } from '@sveltestrap/sveltestrap';

	/**
	 * @type {string | any[]}
	 */
	let universities: any[] = [];
	let country = 'United States';
	export let selectedUniversity: string = '';

	const fetchUniversities = async () => {
		try {
			const response = await fetch(`/api/universities?country=${encodeURIComponent(country)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch data from server');
			}
			universities = await response.json();
		} catch (error) {
			console.error('Error fetching universities:', error);
		}
	};

	// Fetch data when component mounts
	fetchUniversities();
	console.log(JSON.stringify(universities));
</script>

<!-- Display the universities -->
<InputGroup>
	<InputGroupText class="custom-label">University</InputGroupText>
	<Input type="select" id="university" bind:value={selectedUniversity}>
		<option value="">Select University</option>
		{#each universities as university}
			<option value={university}>{university.name}</option>
		{/each}
	</Input>
</InputGroup>

<style>
	:global(.custom-label) {
		width: 100px;
		justify-content: center;
	}
</style>
