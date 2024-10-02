<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, InputGroup, InputGroupText } from '@sveltestrap/sveltestrap';

	export let selectedUniversity: string = '';
	let universities: string[] = [];
	let country = 'United States';

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

	onMount(fetchUniversities);
</script>

<InputGroup>
	<InputGroupText class="custom-label">University</InputGroupText>
	<Input type="select" id="university" bind:value={selectedUniversity}>
		<option value="">Select University</option>
		{#each universities as university}
			<option value={university}>
				{university}
			</option>
		{/each}
	</Input>
</InputGroup>

<style>
	:global(.custom-label) {
		width: 100px;
		justify-content: center;
	}
</style>
