<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getAllLifts, getUniversityLifts, getUserName } from '../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift } from '../types';
	import { Tooltip, ButtonGroup, Button } from '@sveltestrap/sveltestrap';
	import Select, { Option } from '@smui/select';
	import { Label } from '@smui/common';
	import { weightUnit } from '../stores/weightUnitStore';
	import { convertWeight, getUniversityUrlSlug, getUniversityDisplayName } from '../helpers';

	// Exported prop
	export let university: string | undefined;

	// Variables
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

	// Fetch lifts based on university filter
	onMount(() => {
		screenWidth = window.innerWidth;
		if (screenWidth > 1500) {
			screenSize = 'xl';
		} else if (screenWidth > 1280) {
			screenSize = 'lg';
		} else if (screenWidth > 980) {
			screenSize = 'md';
		} else if (screenWidth > 600) {
			screenSize = 'sm';
		} else {
			screenSize = 'xs';
		}

		// Use appropriate function based on university filter
		if (university) {
			unsubscribe = getUniversityLifts(university, (updatedLifts) => {
				topLifts = updatedLifts;
			});
		} else {
			unsubscribe = getAllLifts((updatedLifts) => {
				topLifts = updatedLifts;
			});
		}
	});

	// Clean up subscription on component destroy
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	// Reactive statement to update subscription when university changes
	$: if (university !== undefined) {
		// Clean up existing subscription
		if (unsubscribe) {
			unsubscribe();
		}

		// Create new subscription based on university filter
		if (university) {
			unsubscribe = getUniversityLifts(university, (updatedLifts) => {
				topLifts = updatedLifts;
			});
		} else {
			unsubscribe = getAllLifts((updatedLifts) => {
				topLifts = updatedLifts;
			});
		}
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
</script>

<div class="leaderboard-container">
	<h1 class="leaderboard-title">
		{university ? `${university} Leaderboard` : 'Global Leaderboard'}
	</h1>

	<div class="table-wrapper">
		<DataTable
			sortable
			bind:sort
			bind:sortDirection
			on:SMUIDataTable:sorted={handleSort}
			table$aria-label="Powerlifting Leaderboard"
			class="responsive-table"
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
							class="header-cell {column.key === 'displayName' ||
							column.key === 'rank' ||
							column.key === 'dotsScore' ||
							column.key === 'total'
								? 'priority-high'
								: column.key === 'selectedUniversity'
									? 'priority-low'
									: column.key === 'bodyWeight' || column.key === 'age' || column.key === 'gender'
										? 'priority-medium'
										: 'priority-low'}"
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
					<Row class="data-row">
						{#each columns as column}
							<Cell
								numeric={column.numeric}
								id={column.key === 'displayName' ? lift[column.key] : ''}
								class="data-cell {column.key === 'displayName' ||
								column.key === 'rank' ||
								column.key === 'dotsScore' ||
								column.key === 'total'
									? 'priority-high'
									: column.key === 'selectedUniversity'
										? 'priority-low'
										: column.key === 'bodyWeight' || column.key === 'age' || column.key === 'gender'
											? 'priority-medium'
											: 'priority-low'}"
							>
								{#if column.key === 'displayName'}
									{#await loadUserName(lift[column.key])}
										<a href={`/profile/${lift.displayName}`} class="name-link">{lift[column.key]}</a
										>
									{:then userName}
										{#if userName !== ''}
											<a href={`/profile/${lift.displayName}`} class="name-link">
												<span class="display-name">{lift[column.key]}</span>
												<span class="username">({userName})</span>
											</a>
										{:else}
											<a href={`/profile/${lift.displayName}`} class="name-link"
												>{lift[column.key]}</a
											>
										{/if}
									{/await}
								{:else if column.key === 'selectedUniversity'}
									<a
										href={`/uni/${getUniversityUrlSlug(lift[column.key])}`}
										class="university-link"
									>
										{getUniversityDisplayName(lift[column.key])}
									</a>
								{:else if column.key === 'bodyWeight' || column.key === 'total' || column.key === 'squat' || column.key === 'bench' || column.key === 'deadlift'}
									<span class="weight-value">
										{!lift[column.key]
											? 'N/A'
											: convertWeight(lift[column.key], $weightUnit) + ' ' + $weightUnit}
									</span>
								{:else}
									{lift[column.key]}
								{/if}
							</Cell>
						{/each}
					</Row>
				{/each}
			</Body>
			<Pagination slot="paginate" class="responsive-pagination">
				<svelte:fragment slot="rowsPerPage">
					<Label class="pagination-label">Rows Per Page</Label>
					<Select variant="outlined" bind:value={rowsPerPage} noLabel class="rows-select">
						<Option value={10}>10</Option>
						<Option value={25}>25</Option>
						<Option value={50}>50</Option>
					</Select>
				</svelte:fragment>

				<svelte:fragment slot="total">
					<span class="pagination-info">{start + 1}-{end} of {topLifts.length}</span>
				</svelte:fragment>

				<IconButton
					class="material-icons pagination-btn"
					action="first-page"
					title="First page"
					on:click={() => (currentPage = 0)}
					disabled={currentPage === 0}>first_page</IconButton
				>

				<IconButton
					class="material-icons pagination-btn"
					action="prev-page"
					title="Prev page"
					on:click={() => currentPage--}
					disabled={currentPage === 0}>chevron_left</IconButton
				>

				<IconButton
					class="material-icons pagination-btn"
					action="next-page"
					title="Next page"
					on:click={() => currentPage++}
					disabled={currentPage === lastPage}>chevron_right</IconButton
				>

				<IconButton
					class="material-icons pagination-btn"
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
	/* Container and Layout */
	.leaderboard-container {
		width: 100%;
		max-width: none;
		margin: 0 auto;
		overflow: hidden;
		padding: 0 1rem;
	}

	.leaderboard-title {
		margin-bottom: 1.5rem;
		text-align: center;
		font-weight: 600;
	}

	.table-wrapper {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		background-color: #1a1a1a;
	}

	/* Table Base Styles */
	:global(.mdc-data-table) {
		width: 100%;
		min-width: 100%;
		border: 1px solid #404040;
		border-radius: 8px;
		font-size: 1.25rem;
		background-color: #1a1a1a;
		table-layout: auto;
	}

	/* Header Styles */
	:global(.mdc-data-table__header-cell) {
		font-weight: 600;
		text-transform: uppercase;
		background-color: #0761c7;
		color: aliceblue;
		white-space: nowrap;
		padding: 8px 6px;
		font-size: 0.65rem;
		border-bottom: 2px solid #0550a3;
		width: auto;
	}

	/* Cell Base Styles */
	:global(.mdc-data-table__cell) {
		padding: 6px 6px;
		color: aliceblue;
		white-space: nowrap;
		border-bottom: 1px solid #333;
		vertical-align: middle;
		width: auto;
		font-size: 0.7rem;
	}

	/* Row Styles */
	:global(.mdc-data-table__row) {
		transition: background-color 0.2s ease;
	}

	:global(.mdc-data-table__row:hover) {
		background-color: rgba(7, 97, 199, 0.1);
	}

	:global(.mdc-data-table__row:nth-child(even)) {
		background-color: rgba(255, 255, 255, 0.02);
	}

	/* Link Styles */
	.name-link,
	.university-link {
		color: #ffffff;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.name-link:hover,
	.university-link:hover {
		color: #f0f0f0;
		text-decoration: underline;
	}

	.display-name {
		font-weight: 500;
	}

	.username {
		font-size: 0.85em;
		opacity: 0.8;
		margin-left: 0.25rem;
	}

	.weight-value {
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	/* Specific column width optimizations */
	:global(.mdc-data-table__cell:nth-child(1)),
	:global(.mdc-data-table__header-cell:nth-child(1)) {
		/* Rank column */
		width: 40px;
		max-width: 40px;
	}

	:global(.mdc-data-table__cell:nth-child(2)),
	:global(.mdc-data-table__header-cell:nth-child(2)) {
		/* Name column */
		min-width: 120px;
		max-width: 180px;
	}

	:global(.mdc-data-table__cell:nth-child(3)),
	:global(.mdc-data-table__header-cell:nth-child(3)) {
		/* University column */
		min-width: 150px;
		max-width: 200px;
		white-space: normal;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.mdc-data-table__cell:nth-child(4)),
	:global(.mdc-data-table__header-cell:nth-child(4)),
	:global(.mdc-data-table__cell:nth-child(5)),
	:global(.mdc-data-table__header-cell:nth-child(5)),
	:global(.mdc-data-table__cell:nth-child(6)),
	:global(.mdc-data-table__header-cell:nth-child(6)),
	:global(.mdc-data-table__cell:nth-child(7)),
	:global(.mdc-data-table__header-cell:nth-child(7)),
	:global(.mdc-data-table__cell:nth-child(8)),
	:global(.mdc-data-table__header-cell:nth-child(8)),
	:global(.mdc-data-table__cell:nth-child(9)),
	:global(.mdc-data-table__header-cell:nth-child(9)),
	:global(.mdc-data-table__cell:nth-child(10)),
	:global(.mdc-data-table__header-cell:nth-child(10)),
	:global(.mdc-data-table__cell:nth-child(11)),
	:global(.mdc-data-table__header-cell:nth-child(11)) {
		/* Numeric columns */
		width: 60px;
		max-width: 80px;
	}

	/* Material Icons */
	:global(.material-icons) {
		font-size: 18px;
		vertical-align: middle;
		margin-left: 4px;
	}

	/* Pagination Styles */
	:global(.responsive-pagination) {
		background-color: #1a1a1a;
		padding: 1rem;
		border-top: 1px solid #333;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.pagination-label {
		color: aliceblue;
		font-size: 0.875rem;
		margin-right: 0.5rem;
	}

	.pagination-info {
		color: aliceblue;
		font-size: 0.875rem;
	}

	:global(.rows-select) {
		min-width: 80px;
	}

	:global(.pagination-btn) {
		color: aliceblue;
		padding: 8px;
	}

	:global(.pagination-btn:disabled) {
		opacity: 0.5;
	}

	/* Scrollbar Styling */
	.table-wrapper::-webkit-scrollbar {
		height: 8px;
	}

	.table-wrapper::-webkit-scrollbar-track {
		background: #2a2a2a;
		border-radius: 4px;
	}

	.table-wrapper::-webkit-scrollbar-thumb {
		background: #0761c7;
		border-radius: 4px;
	}

	.table-wrapper::-webkit-scrollbar-thumb:hover {
		background: #0550a3;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 992px) {
		.table-wrapper {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		:global(.mdc-data-table) {
			min-width: 1200px;
		}
	}

	@media (max-width: 768px) {
		.leaderboard-title {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}

		/* Hide only the least important columns on very small screens */
		:global(.priority-low) {
			display: none;
		}

		:global(.mdc-data-table) {
			min-width: 1000px;
			font-size: 0.65rem;
		}

		:global(.mdc-data-table__header-cell),
		:global(.mdc-data-table__cell) {
			padding: 4px 4px;
		}

		:global(.mdc-data-table__header-cell) {
			font-size: 0.6rem;
		}

		:global(.mdc-data-table__cell) {
			font-size: 0.6rem;
		}

		.username {
			display: block;
			margin-left: 0;
			margin-top: 0.1rem;
			font-size: 0.65em;
		}

		:global(.responsive-pagination) {
			padding: 0.75rem;
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.pagination-label,
		.pagination-info {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 576px) {
		.leaderboard-title {
			font-size: 1.375rem;
			margin-bottom: 0.875rem;
		}

		/* Hide medium priority columns on very small screens */
		:global(.priority-medium) {
			display: none;
		}

		:global(.mdc-data-table) {
			min-width: 800px;
			font-size: 0.6rem;
		}

		:global(.mdc-data-table__header-cell),
		:global(.mdc-data-table__cell) {
			padding: 3px 3px;
		}

		:global(.mdc-data-table__header-cell) {
			font-size: 0.55rem;
		}

		:global(.mdc-data-table__cell) {
			font-size: 0.55rem;
		}

		:global(.material-icons) {
			font-size: 14px;
		}

		:global(.responsive-pagination) {
			padding: 0.5rem;
		}

		:global(.pagination-btn) {
			padding: 4px;
		}
	}

	@media (max-width: 400px) {
		.leaderboard-title {
			font-size: 1.25rem;
		}

		:global(.mdc-data-table) {
			min-width: 700px;
		}

		:global(.mdc-data-table__header-cell),
		:global(.mdc-data-table__cell) {
			padding: 2px 2px;
		}

		:global(.mdc-data-table__header-cell) {
			font-size: 0.5rem;
		}

		:global(.mdc-data-table__cell) {
			font-size: 0.5rem;
		}
	}

	/* Priority system for columns - Updated for wider table */
	@media (max-width: 768px) {
		:global(.header-cell.priority-low),
		:global(.data-cell.priority-low) {
			display: none;
		}
	}

	@media (max-width: 576px) {
		:global(.header-cell.priority-medium),
		:global(.data-cell.priority-medium) {
			display: none;
		}
	}

	/* Improve touch targets on mobile */
	@media (max-width: 768px) {
		.name-link,
		.university-link {
			display: inline-block;
			min-height: 32px;
			line-height: 1.2;
			padding: 0.15rem 0;
		}
	}
</style>
