<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTopLifts } from '../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';

	type Lift = {
		rank: number;
		displayName: string;
		selectedUniversity: string;
		dotsScore: number;
		total: number;
		squat: number;
		bench: number;
		deadlift: number;
		formattedDate: string;
	};

	let topLifts: Lift[] = [];
	let unsubscribe: () => void;
	let sort: keyof Lift = 'rank';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

	onMount(() => {
		unsubscribe = getTopLifts((updatedLifts) => {
			topLifts = updatedLifts;
			handleSort();
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

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
		topLifts = topLifts;
	}

	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'rank', label: 'Rank', numeric: true },
		{ key: 'displayName', label: 'Name' },
		{ key: 'selectedUniversity', label: 'University' },
		{ key: 'dotsScore', label: 'Dots' },
		{ key: 'total', label: 'Total', numeric: true },
		{ key: 'squat', label: 'Squat', numeric: true },
		{ key: 'bench', label: 'Bench', numeric: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true },
		{ key: 'formattedDate', label: 'Date', sortable: false }
	];
</script>

<div class="leaderboard-container">
	<h1>Leaderboard</h1>
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
				{#each columns as column}
					<Cell numeric={column.numeric} columnId={column.key} sortable={column.sortable !== false}>
						{#if column.numeric}
							<IconButton class="material-icons">arrow_upward</IconButton>
						{/if}
						<Label>{column.label}</Label>
						{#if !column.numeric && column.sortable !== false}
							<IconButton class="material-icons">arrow_upward</IconButton>
						{/if}
					</Cell>
				{/each}
			</Row>
		</Head>
		<Body>
			{#each topLifts as lift (lift.rank)}
				<Row>
					{#each columns as column}
						<Cell numeric={column.numeric}>{lift[column.key]}</Cell>
					{/each}
				</Row>
			{/each}
		</Body>
	</DataTable>
</div>

<style>
	.leaderboard-container {
		width: 90%;
		max-width: 85%;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		margin-bottom: 20px;
		text-align: center;
	}

	:global(.mdc-data-table) {
		width: 100%;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
	}

	:global(.mdc-data-table__header-cell) {
		font-weight: bold;
		text-transform: uppercase;
	}

	:global(.mdc-data-table__cell) {
		padding: 12px 16px;
	}

	:global(.material-icons) {
		font-size: 18px;
		vertical-align: middle;
		margin-left: 4px;
	}
</style>
