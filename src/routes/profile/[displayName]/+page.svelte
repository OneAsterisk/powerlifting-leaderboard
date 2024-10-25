<script lang="ts">
	import { page } from '$app/stores';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift } from '../../../types';
	import { onDestroy, onMount } from 'svelte';
	import { getUserLifts } from '../../../dbFunctions';
	import { weightUnit } from '../../../stores/weightUnitStore';
	import { convertWeight } from '../../../helpers';

	let displayName: string;
	$: displayName = $page.params.displayName;

	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'dotsScore', label: 'Dots', sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true },
		{ key: 'bench', label: 'Bench', numeric: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true },
		{ key: 'total', label: 'Total', numeric: true },
		{ key: 'selectedUniversity', label: 'University' }
	];

	let userLifts: Lift[] = [];
	let sort: keyof Lift = 'dotsScore';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let unsubscribeLifts: (() => void) | undefined;

	onMount(() => {
		unsubscribeLifts = getUserLifts(displayName, (lifts) => {
			userLifts = lifts;
		});
	});

	onDestroy(() => {
		unsubscribeLifts && unsubscribeLifts();
	});

	function handleSort() {
		userLifts.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		userLifts = userLifts;
	}

	$: if (displayName) {
		if (unsubscribeLifts) {
			unsubscribeLifts();
		}
		unsubscribeLifts = getUserLifts(displayName, (lifts) => {
			userLifts = lifts;
		});
	}
</script>

<svelte:head>
	<title>Profile: {displayName}</title>
</svelte:head>

<div class="leaderboard-container">
	<h1>{displayName}'s Stats</h1>
	<DataTable
		sortable
		bind:sort
		bind:sortDirection
		on:SMUIDataTable:sorted={handleSort}
		table$aria-label="Personal Lifts"
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
			{#each userLifts as lift}
				<Row>
					{#each columns as column}
						<Cell numeric={column.numeric}>
							{#if column.key === 'squat' || column.key === 'bench' || column.key === 'deadlift' || column.key === 'total'}
								{!lift[column.key]
									? 'N/A'
									: convertWeight(lift[column.key], $weightUnit) + ' ' + $weightUnit}
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
	h1 {
		margin-bottom: 20px;
		text-align: center;
	}
	.leaderboard-container {
		flex: 3;
		width: 100%;
		margin: 20px auto;
	}

	:global(.mdc-data-table) {
		width: 100%;
		border: 1px solid #5b5656;
		border-radius: 4px;
		overflow: hidden;
		text-align: center;
	}

	:global(.mdc-data-table__table) {
		table-layout: auto;
	}

	:global(.mdc-data-table__header-cell) {
		font-weight: bold;
		text-transform: uppercase;
		background-color: #0761c7;
		font-size: 1.125rem;
		color: aliceblue;
		text-overflow: ellipsis;
	}

	:global(.mdc-data-table__cell-numeric) {
		width: 5%;
	}

	a {
		color: aliceblue;
	}

	@media (max-width: 850px) {
		.leaderboard-container {
			width: 90%;
			margin: 20px auto;
		}
	}
</style>
