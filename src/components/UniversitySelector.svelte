<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, InputGroup, InputGroupText } from '@sveltestrap/sveltestrap';

	export let selectedUniversity: string = '';
	let universities: string[] = [];
	let country = 'United States';
	let filteredUniversities: string[] = [];
	let showDropdown = false;

	const fetchUniversities = async () => {
		try {
			const response = await fetch(`/api/universities?country=${encodeURIComponent(country)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch data from server');
			}
			universities = await response.json();
			filteredUniversities = universities;
		} catch (error) {
			console.error('Error fetching universities:', error);
		}
	};

	onMount(fetchUniversities);

	function filterUniversities(event: Event) {
		const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
		filteredUniversities = universities.filter((uni) => uni.toLowerCase().includes(searchTerm));
		showDropdown = true;
	}

	function selectUniversity(uni: string) {
		selectedUniversity = uni;
		showDropdown = false;
	}
</script>

<InputGroup>
	<InputGroupText class="custom-label">University</InputGroupText>
	<Input
		type="text"
		id="university"
		bind:value={selectedUniversity}
		on:input={filterUniversities}
		on:focus={() => (showDropdown = true)}
		placeholder="Type to search..."
		style="text-overflow: ellipsis; border-top-right-radius: 5px; border-bottom-right-radius: 5px;"
	/>
</InputGroup>

{#if showDropdown && filteredUniversities.length > 0}
	<div class="dropdown">
		{#each filteredUniversities as university}
			<button
				type="button"
				class="dropdown-item"
				on:click={() => selectUniversity(university)}
				on:keydown={(e) => e.key === 'Enter' && selectUniversity(university)}
			>
				{university}
			</button>
		{/each}
	</div>
{/if}

<style>
	:global(.custom-label) {
		width: 100px;
		justify-content: center;
		text-overflow: ellipsis;
	}
	.dropdown {
		color: #dee2c3;
		position: absolute;
		background-color: #2b3035;
		border: 1px solid #ced4da;
		max-height: 200px;
		overflow-y: auto;
		z-index: 1000;
	}
	.dropdown-item {
		padding: 5px 10px;
		cursor: pointer;
	}
	.dropdown-item:hover {
		background-color: #6a6b6d;
	}
</style>
