<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getAllLifts, getUserName } from '../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift } from '../types';
	import { Tooltip } from '@sveltestrap/sveltestrap';

	// Exported prop
	export let university: string | undefined;

	// Variables
	let allLifts: Lift[] = [];
	let topLifts: Lift[] = [];
	let unsubscribe: () => void;
	let sort: keyof Lift = 'rank';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

	// Cache for usernames
	let userNameCache: { [key: string]: string } = {};

	// Fetch all lifts on component mount
	onMount(() => {
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

	// Reactive statement to filter and sort lifts whenever `university` or `allLifts` changes
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
		{ key: 'total', label: 'Total', numeric: true, sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true, sortable: true },
		{ key: 'bench', label: 'Bench', numeric: true, sortable: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true, sortable: true }
	];
</script>

<!-- Your component's markup -->
<div class="leaderboard-container">
	<h1>{university ? `${university} Leaderboard` : 'Global Leaderboard'}</h1>
	<DataTable
		sortable
		bind:sort
		bind:sortDirection
		on:SMUIDataTable:sorted={handleSort}
		table$aria-label="Powerlifting Leaderboard"
		style="width: 100%;"
	>
		<Head>
			<Row>
				{#each columns as column, i}
					<Cell
						numeric={column.numeric}
						columnId={column.key}
						sortable={column.sortable ?? false}
						style="width: 5%"
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
			{#each topLifts as lift (lift.rank)}
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
							{:else}
								{lift[column.key]}
							{/if}
						</Cell>
					{/each}
				</Row>
			{/each}
		</Body>
	</DataTable>
</div>

<style>
	a {
		color: aliceblue;
	}
	.leaderboard-container {
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		padding: 0px;
	}

	h1 {
		margin-bottom: 20px;
		text-align: center;
	}

	:global(.mdc-data-table) {
		width: 100%;
		border: 1px solid #5b5656;
		border-radius: 4px;
		overflow: hidden;
		font-size: 0.735rem;
	}

	:global(.mdc-data-table__header-cell) {
		font-weight: bold;
		text-transform: uppercase;
		background-color: #0761c7;
		font-size: 1.125rem;
		color: aliceblue;
	}

	:global(.mdc-data-table__cell) {
		padding: 12px 16px;
		color: aliceblue;
	}

	:global(.material-icons) {
		font-size: 18px;
		vertical-align: middle;
		margin-left: 4px;
	}
</style>
