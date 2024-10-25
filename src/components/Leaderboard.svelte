<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getAllLifts, getUserName } from '../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift } from '../types';
	import { Tooltip, ButtonGroup, Button } from '@sveltestrap/sveltestrap';
	import Select, { Option } from '@smui/select';
	import { Label } from '@smui/common';
	import { weightUnit } from '../stores/weightUnitStore';

	// Exported prop
	export let university: string | undefined;

	// Variables
	let allLifts: Lift[] = [];
	let topLifts: Lift[] = [];
	let unsubscribe: () => void;
	let sort: keyof Lift = 'rank';
	const SortValue = {
		ascending: 'ascending',
		descending: 'descending'
	} as const;

	let sortDirection: keyof typeof SortValue = 'ascending';

	let rowsPerPage = 10;
	let currentPage = 0;

	$: start = currentPage * rowsPerPage;
	$: end = Math.min(start + rowsPerPage, topLifts.length);
	$: paginatedLifts = topLifts.slice(start, end);
	$: lastPage = Math.max(Math.ceil(topLifts.length / rowsPerPage) - 1, 0);

	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}
	let screenWidth: number;
	let screenSize: string;
	// Fetch all lifts on component mount
	onMount(() => {
		screenWidth = window.innerWidth;
		if(screenWidth > 1500){
			screenSize = 'xl';
		}
		else if(screenWidth > 1280){
			screenSize = 'lg';
		} else if(screenWidth >980){
			screenSize = 'md';
		} else if(screenWidth > 600){
			screenSize = 'sm';
		} else {
			screenSize = 'xs';
		}
		unsubscribe = getAllLifts((updatedLifts) => {
			allLifts = updatedLifts;
		});
	});

	// Clean up subscription on component destroy
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	// Reactive statement to filter and sort lifts whenever university or allLifts changes
	$: if (allLifts.length > 0) {
		if (university) {
			topLifts = allLifts.filter((lift) => lift.selectedUniversity.split(' -')[0] === university);
		} else {
			topLifts = allLifts;
		}
		// Update ranks after filtering
		topLifts = topLifts.map((lift, index) => ({
			...lift,
			rank: index + 1
		}));
		handleSort();
	}

	// Function to load usernames
	async function loadUserName(displayName: string) {
		if (!userNameCache[displayName]) {
			userNameCache[displayName] = await getUserName(displayName);
		}
		return userNameCache[displayName];
	}

	// Sorting function
	function handleSort() {
		topLifts.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		// Update ranks after sorting
		topLifts = topLifts.map((lift, index) => ({
			...lift,
			rank: index + 1
		}));
	}

	// Columns for the data table
	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'rank', label: 'Rank' },
		{ key: 'displayName', label: 'Name' },
		{ key: 'selectedUniversity', label: 'University' },
		{ key: 'dotsScore', label: 'Dots', numeric: true, sortable: true },
		{ key: 'bodyWeight', label: 'Body Weight', numeric: true, sortable: true },
		{ key: 'age', label: 'Age', numeric: true, sortable: true },
		{ key: 'gender', label: 'Gender', sortable: true },
		{ key: 'total', label: 'Total', numeric: true, sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true, sortable: true },
		{ key: 'bench', label: 'Bench', numeric: true, sortable: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true, sortable: true }
	];

	// Cache for usernames
	let userNameCache: { [key: string]: string } = {};

	const convertWeight = (weight: number, unit: 'lbs' | 'kg'): number => {
		if (unit === 'kg') {
			return Math.round((weight / 2.205) * 100) / 100;
		}
		return weight;
	};
</script>

<div class="leaderboard-container">
	<h1>{university ? `${university} Leaderboard` : 'Global Leaderboard'}</h1>

	<div class="table-wrapper">
		<DataTable
			sortable
			bind:sort
			bind:sortDirection
			on:SMUIDataTable:sorted={handleSort}
			table$aria-label="Powerlifting Leaderboard"
		>
			<Head>
				<Row>
					{#each columns as column, i}
						<Cell
							numeric={column.numeric}
							columnId={column.key}
							sortable={column.sortable ?? false}
							id={column.sortable
								? 'sorting-cell' + i
								: column.key === 'selectedUniversity'
									? 'university-cell'
									: ''}
						>
							{#if column.numeric}
								<IconButton class="material-icons">arrow_upward</IconButton>
							{/if}
							<Label>{column.label}</Label>
							{#if !column.numeric && column.sortable === false}
								<IconButton class="material-icons">arrow_upward</IconButton>
							{/if}
						</Cell>
						<Tooltip placement="top" target="university-cell" isOpen={false}
							>Click on a university to view its leaderboard</Tooltip
						>
						<Tooltip placement="top" target={'sorting-cell' + i} isOpen={false}
							>Sorting adjusts the ranking</Tooltip
						>
					{/each}
				</Row>
			</Head>

			<Body>
				{#each paginatedLifts as lift (lift.rank)}
					<Row>
						{#each columns as column}
							<Cell
								numeric={column.numeric}
								id={column.key === 'displayName' ? lift[column.key] : ''}
							>
								{#if column.key === 'displayName'}
									{#await loadUserName(lift[column.key])}
										<a href={`/profile/${lift.displayName}`}>{lift[column.key]}</a>
									{:then userName}
										{#if userName !== ''}
											<a href={`/profile/${lift.displayName}`}>{lift[column.key]}</a> ({userName})
										{:else}
											<a href={`/profile/${lift.displayName}`}>{lift[column.key]}</a>
										{/if}
									{/await}
								{:else if column.key === 'selectedUniversity'}
									<a href={`/uni/${lift[column.key].split(' -')[0]}`}
										>{lift[column.key].split(' -')[0]}</a
									>
								{:else if column.key === 'bodyWeight' || column.key === 'total' || column.key === 'squat' || column.key === 'bench' || column.key === 'deadlift'}
									{!lift[column.key]
										? 'N/A'
										: convertWeight(lift[column.key], $weightUnit) + ' ' + $weightUnit}
								{:else}
									{lift[column.key]}
								{/if}
							</Cell>
						{/each}
					</Row>
				{/each}
			</Body>
			<Pagination slot="paginate">
				<svelte:fragment slot="rowsPerPage">
					<Label>Rows Per Page</Label>
					<Select variant="outlined" bind:value={rowsPerPage} noLabel>
						<Option value={10}>10</Option>
						<Option value={25}>25</Option>
						<Option value={50}>50</Option>
					</Select>
				</svelte:fragment>

				<svelte:fragment slot="total">
					{start + 1}-{end} of {topLifts.length}
				</svelte:fragment>

				<IconButton
					class="material-icons"
					action="first-page"
					title="First page"
					on:click={() => (currentPage = 0)}
					disabled={currentPage === 0}>first_page</IconButton
				>

				<IconButton
					class="material-icons"
					action="prev-page"
					title="Prev page"
					on:click={() => currentPage--}
					disabled={currentPage === 0}>chevron_left</IconButton
				>

				<IconButton
					class="material-icons"
					action="next-page"
					title="Next page"
					on:click={() => currentPage++}
					disabled={currentPage === lastPage}>chevron_right</IconButton
				>

				<IconButton
					class="material-icons"
					action="last-page"
					title="Last page"
					on:click={() => (currentPage = lastPage)}
					disabled={currentPage === lastPage}>last_page</IconButton
				>
			</Pagination>
		</DataTable>
	</div>
</div>

<style>
	a {
		color: aliceblue;
	}
	
	.leaderboard-container {
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		overflow-x: hidden; /* Prevent horizontal scroll on container */
	}

	.table-wrapper {
		width: 100%;
		border-radius: 5px;
		overflow-x: auto; /* Enable horizontal scroll only for table */
		-webkit-overflow-scrolling: touch;
	}

	h1 {
		margin-bottom: 20px;
		text-align: center;
	}

	:global(.mdc-data-table) {
		width: 100%; /* Changed from 95% */
		min-width: max-content; /* Ensure table doesn't shrink below content width */
		border: 1px solid #5b5656;
		border-radius: 4px;
		font-size: 0.735rem;
	}

	:global(.mdc-data-table__header-cell) {
		font-weight: bold;
		text-transform: uppercase;
		background-color: #0761c7;
		font-size: 1.125rem;
		color: aliceblue;
		white-space: nowrap; /* Prevent header text from wrapping */
	}

	:global(.mdc-data-table__cell) {
		width: auto; /* Changed from 1px */
		min-width: max-content; /* Ensure cells don't shrink below content */
		padding: 12px 16px;
		color: aliceblue;
		white-space: nowrap; /* Prevent cell content from wrapping */
	}

	:global(.material-icons) {
		font-size: 18px;
		vertical-align: middle;
		margin-left: 4px;
	}

	:global(.mdc-data-table::-webkit-scrollbar-thumb) {
		background: #0761c7;
		border-radius: 6px;
	}

	@media (max-width: 768px) {
		.leaderboard-container {
			font-size: 0.6rem;
		}
		:global(.mdc-data-table__header-cell),
		:global(.mdc-data-table__cell) {
			padding: 8px;
		}
		:global(.mdc-data-table__header-cell) {
			font-size: 0.8rem;
		}
	}

	@media (min-width: 769px) and (max-width: 1200px) {
		.leaderboard-container {
			font-size: 0.8rem;
		}
	}
</style>