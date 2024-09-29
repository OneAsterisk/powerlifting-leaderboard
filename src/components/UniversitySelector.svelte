<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, InputGroup, InputGroupText } from '@sveltestrap/sveltestrap';
	let universities: string[] = [];
	export let selectedUniversity: string = '';

	onMount(async () => {
		try {
			const response = await fetch('http://universities.hipolabs.com/search?country=United+States');
			const data = await response.json();
			universities = data.map((uni: { name: string }) => uni.name).sort();
		} catch (error) {
			console.error('Error fetching universities:', error);
		}
	});
</script>

<InputGroup>
	<InputGroupText class="custom-label">University</InputGroupText>
	<Input type="select" id="university" bind:value={selectedUniversity}>
		<option value="">Select University</option>
		{#each universities as university}
			<option value={university}>{university}</option>
		{/each}
	</Input>
</InputGroup>

<style>
	:global(.custom-label) {
		width: 100px;
		justify-content: center;
	}
</style>
