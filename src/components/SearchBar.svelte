<script lang="ts">
	import { goto } from '$app/navigation';
	import { ButtonGroup, Button } from '@sveltestrap/sveltestrap';
	import { searchPeople } from '../dbFunctions';
	let searchQuery = '';
	let searchResults = [];
	let showResults = false;
	let searchType = 'universities'; // or 'people'
	let searchTimeout: NodeJS.Timeout;

	async function search() {
		clearTimeout(searchTimeout);

		if (searchQuery.length < 2) {
			searchResults = [];
			showResults = false;
			return;
		}

		searchTimeout = setTimeout(async () => {
			if (searchType === 'universities') {
				const response = await fetch(`/api/universities?country=United States`);
				const data = await response.json();
				searchResults = data.filter((uni) => uni.toLowerCase().includes(searchQuery.toLowerCase()));
			} else {
				searchResults = await searchPeople(searchQuery);
			}
			showResults = true;
		}, 300);
	}

	async function selectResult(result) {
		showResults = false;
		searchQuery = '';

		if (searchType === 'universities') {
			await goto(`/uni/${encodeURIComponent(result)}`, {
				invalidateAll: true
			});
		} else {
			await goto(`/profile/${encodeURIComponent(result.name)}`, {
				invalidateAll: true
			});
		}
	}
	$: if (searchQuery) {
		search();
	} else {
		searchResults = [];
		showResults = false;
	}
</script>

<div class="search-container-nav">
	<ButtonGroup size="sm" class="me-2">
		<Button
			size="sm"
			color={searchType === 'universities' ? 'primary' : 'secondary'}
			on:click={() => (searchType = 'universities')}
		>
			Unis &nbsp;
		</Button>
		<Button
			size="sm"
			color={searchType === 'people' ? 'primary' : 'secondary'}
			on:click={() => (searchType = 'people')}
		>
			Users
		</Button>
	</ButtonGroup>

	<input
		type="text"
		bind:value={searchQuery}
		on:input={search}
		placeholder={`Search ${searchType}...`}
	/>

	{#if showResults && searchQuery}
		<div class="search-results">
			{#each searchResults as result}
				<div
					class="result-item"
					on:click={() =>
						searchType === 'universities'
							? selectResult(result.split(' -')[0])
							: selectResult(result)}
				>
					{searchType === 'universities' ? result : result.name}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-container-nav {
		position: relative;
		width: 300px;
		display: flex;
		align-items: center;
	}

	input {
		width: 160px;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
		height: 31px;
	}

	.search-results {
		position: absolute;
		top: 100%;
		right: 0;
		width: 250px;
		background: #2c2c2c;
		border: 1px solid #444;
		border-radius: 4px;
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		margin-top: 0.25rem;
	}

	.result-item {
		padding: 0.5rem;
		cursor: pointer;
		text-align: left;
	}

	.result-item:hover {
		background: #444;
	}
</style>
