<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, InputGroup, InputGroupText, Spinner } from '@sveltestrap/sveltestrap';

	export let selectedUniversity: string = '';
	let universities: string[] = [];
	let country = 'United States';
	let filteredUniversities: string[] = [];
	let showDropdown = false;
	let isLoading = false;
	let selectedIndex = -1;
	let dropdownRef: HTMLDivElement;
	let containerRef: HTMLDivElement;
	let inputWrapperRef: HTMLDivElement;

	const fetchUniversities = async () => {
		isLoading = true;
		try {
			const response = await fetch(`/api/universities?country=${encodeURIComponent(country)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch data from server');
			}
			universities = await response.json();
			filteredUniversities = universities;
		} catch (error) {
			console.error('Error fetching universities:', error);
		} finally {
			isLoading = false;
		}
	};

	onMount(() => {
		fetchUniversities();

		// Add click outside listener
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef && !containerRef.contains(event.target as Node)) {
				showDropdown = false;
				selectedIndex = -1;
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	function filterUniversities(event: Event) {
		const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
		filteredUniversities = universities.filter((uni) => uni.toLowerCase().includes(searchTerm));
		showDropdown = searchTerm.length >= 2; // Only show dropdown if 2 or more characters
		selectedIndex = -1; // Reset selection when filtering
	}

	function selectUniversity(uni: string) {
		selectedUniversity = uni;
		showDropdown = false;
		selectedIndex = -1;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showDropdown) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredUniversities.length - 1);
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
					selectUniversity(filteredUniversities[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				showDropdown = false;
				selectedIndex = -1;
				break;
		}
	}

	function handleFocus() {
		// Only show dropdown if there's a valid search term
		if (selectedUniversity.length >= 2) {
			filterUniversities({ target: { value: selectedUniversity } } as any);
			showDropdown = true;
		}
	}

	function scrollToSelected() {
		if (selectedIndex >= 0 && dropdownRef) {
			const selectedElement = dropdownRef.children[selectedIndex] as HTMLElement;
			if (selectedElement) {
				const dropdownRect = dropdownRef.getBoundingClientRect();
				const elementRect = selectedElement.getBoundingClientRect();

				if (elementRect.bottom > dropdownRect.bottom) {
					dropdownRef.scrollTop += elementRect.bottom - dropdownRect.bottom;
				} else if (elementRect.top < dropdownRect.top) {
					dropdownRef.scrollTop -= dropdownRect.top - elementRect.top;
				}
			}
		}
	}
</script>

<div class="university-selector" bind:this={containerRef}>
	<InputGroup>
		<InputGroupText class="custom-label">University</InputGroupText>
		<div class="input-wrapper" bind:this={inputWrapperRef}>
			<Input
				type="text"
				id="university"
				bind:value={selectedUniversity}
				on:input={filterUniversities}
				on:focus={handleFocus}
				on:keydown={handleKeydown}
				placeholder="Type to search..."
				style="text-overflow: ellipsis; border-top-right-radius: 5px; border-bottom-right-radius: 5px; border-left: 1px solid #495057; border-top-left-radius: 0px; border-bottom-left-radius: 0px; "
			/>
			{#if isLoading}
				<div class="spinner-wrapper">
					<Spinner size="sm" color="secondary" />
				</div>
			{/if}
		</div>
	</InputGroup>

	{#if showDropdown && filteredUniversities.length > 0}
		<div class="dropdown" bind:this={dropdownRef}>
			{#each filteredUniversities as university, i}
				<button
					type="button"
					class="dropdown-item"
					class:selected={i === selectedIndex}
					on:click={() => selectUniversity(university)}
					on:mouseenter={() => (selectedIndex = i)}
				>
					{university}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.university-selector {
		position: relative;
	}

	:global(.custom-label) {
		width: 100px;
		justify-content: center;
		text-overflow: ellipsis;
	}

	.input-wrapper {
		position: relative;
		flex-grow: 1;
	}

	.spinner-wrapper {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
	}

	.dropdown {
		color: #dee2c3;
		position: absolute;
		background-color: #2b3035;
		border: 1px solid #ced4da;
		max-height: 200px;
		overflow-y: auto;
		z-index: 1000;
		width: 100%;
		margin-top: 4px;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.dropdown-item {
		padding: 8px 12px;
		cursor: pointer;
		background: none;
		border: none;
		color: inherit;
		width: 100%;
		text-align: left;
		transition: background-color 0.2s ease;
	}

	.dropdown-item:hover,
	.dropdown-item.selected {
		background-color: #6a6b6d;
	}

	.dropdown-item:not(:last-child) {
		border-bottom: 1px solid rgba(206, 212, 218, 0.1);
	}
</style>
