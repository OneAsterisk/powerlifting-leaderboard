<script lang="ts">
	import { goto } from '$app/navigation';
	import { ButtonGroup, Button, Tooltip } from '@sveltestrap/sveltestrap';
	import { searchPeople } from '../dbFunctions';
	import { onMount } from 'svelte';

	let searchQuery = '';
	let searchResults: any[] = [];
	let showResults = false;
	let searchType = 'universities'; // or 'people'
	let searchTimeout: ReturnType<typeof setTimeout>;
	let searchContainer: HTMLElement;
	let resultsContainer: HTMLElement;
	let selectedIndex = -1;

	onMount(() => {
		// Add click outside listener
		const handleClickOutside = (event: MouseEvent) => {
			if (searchContainer && !searchContainer.contains(event.target as Node)) {
				showResults = false;
				selectedIndex = -1;
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Watch for changes in `searchQuery` and `searchType`
	$: if (searchQuery.length >= 2) {
		search();
	} else {
		searchResults = [];
		showResults = false;
		selectedIndex = -1;
	}

	function search() {
		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			if (searchType === 'universities') {
				const response = await fetch(`/api/universities?country=United States`);
				const data = await response.json();
				searchResults = data.filter((uni) => uni.toLowerCase().includes(searchQuery.toLowerCase()));
			} else {
				searchResults = await searchPeople(searchQuery);
			}
			showResults = true;
			selectedIndex = -1;
		}, 300);
	}

	function selectResult(result) {
		showResults = false;
		searchQuery = '';
		selectedIndex = -1;

		if (searchType === 'universities') {
			goto(`/uni/${encodeURIComponent(result)}`);
		} else {
			goto(`/profile/${encodeURIComponent(result.name)}`);
		}
	}

	function handleInputFocus() {
		if (searchQuery.length >= 2) {
			showResults = true;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showResults || searchResults.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
				scrollToSelected();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				scrollToSelected();
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0) {
					const result = searchResults[selectedIndex];
					selectResult(searchType === 'universities' ? result.split(' -')[0] : result);
				}
				break;
			case 'Escape':
				event.preventDefault();
				showResults = false;
				selectedIndex = -1;
				break;
		}
	}

	function scrollToSelected() {
		if (selectedIndex >= 0 && resultsContainer) {
			const selectedElement = resultsContainer.children[selectedIndex] as HTMLElement;
			if (selectedElement) {
				const containerRect = resultsContainer.getBoundingClientRect();
				const elementRect = selectedElement.getBoundingClientRect();

				if (elementRect.bottom > containerRect.bottom) {
					resultsContainer.scrollTop += elementRect.bottom - containerRect.bottom;
				} else if (elementRect.top < containerRect.top) {
					resultsContainer.scrollTop -= containerRect.top - elementRect.top;
				}
			}
		}
	}
</script>

<div class="search-container-nav" bind:this={searchContainer}>
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
	<div>
		<input
			type="text"
			bind:value={searchQuery}
			id="searchBar"
			placeholder={`Search ${searchType}...`}
			on:focus={handleInputFocus}
			on:keydown={handleKeydown}
		/>
		<Tooltip placement="right" target="searchBar" isOpen={false}
			>Searching is case sensitive!</Tooltip
		>
	</div>
	{#if showResults && searchQuery}
		<div class="search-results" bind:this={resultsContainer}>
			{#each searchResults as result, i}
				<button
					type="button"
					class="result-item"
					class:selected={i === selectedIndex}
					on:click={() =>
						searchType === 'universities'
							? selectResult(result.split(' -')[0])
							: selectResult(result)}
					on:mouseenter={() => (selectedIndex = i)}
				>
					{searchType === 'universities' ? result : result.name}
				</button>
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
		background: #2c2c2c;
		border: 1px solid #444;
		border-radius: 4px;
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		margin-top: 0.25rem;
		width: 240px;
	}

	.result-item {
		padding: 0.5rem;
		cursor: pointer;
		text-align: left;
		width: 100%;
		background: none;
		border: none;
		color: #fff;
		display: block;
		transition: background-color 0.2s ease;
	}

	.result-item:hover,
	.result-item.selected {
		background: #444;
	}

	.result-item:not(:last-child) {
		border-bottom: 1px solid #444;
	}

	.result-item:focus {
		outline: none;
		background: #555;
	}
</style>
