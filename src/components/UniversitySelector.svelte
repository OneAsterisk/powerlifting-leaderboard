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
	onMount(fetchUniversities); // Fetch universities when component mounts
</script>

<InputGroup>
	<InputGroupText class="custom-label">University</InputGroupText>
	<Input
		type="text"
		id="university"
		bind:value={selectedUniversity}
		list="universitiesList"
		placeholder="Select or type..."
		style="text-overflow: ellipsis; border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;"
	/>
	<datalist id="universitiesList">
		{#each universities as university}
			<option value={university}></option>
		{/each}
	</datalist>
</InputGroup>

<style>
	:global(.custom-label) {
		width: 100px;
		justify-content: center;
		text-overflow: ellipsis;
	}
</style>
