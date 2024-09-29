<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import { Table, Pagination, PaginationItem, PaginationLink } from '@sveltestrap/sveltestrap';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	let lifts: any[] = [];
	let currentPage = 1;
	let itemsPerPage = 5;

	const q = query(collection(db, 'lifts'), orderBy('total', 'desc'), limit(50));

	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		lifts = querySnapshot.docs.map((doc, index) => {
			const data = doc.data();
			return {
				...data,
				rank: index + 1,
				formattedDate: formatDate(data.timestamp)
			};
		});
	});

	onDestroy(() => {
		unsubscribe();
	});

	function formatDate(timestamp: { toDate: () => Date }) {
		if (!timestamp) return '';
		const date = timestamp.toDate();
		return date.toLocaleDateString();
	}

	$: totalPages = Math.ceil(lifts.length / itemsPerPage);
	$: paginatedLifts = lifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	function goToPage(page: number) {
		currentPage = page;
	}
</script>

<div class="leaderboard-container">
	<h2 class="mb-4">Powerlifting Leaderboard</h2>
	<div class="table-responsive">
		<Table striped hover size="sm" class="leaderboard-table">
			<thead>
				<tr>
					<th>Rank</th>
					<th>Name</th>
					<th class="d-none d-md-table-cell">Squat</th>
					<th class="d-none d-md-table-cell">Bench</th>
					<th class="d-none d-md-table-cell">Deadlift</th>
					<th>Total</th>
					<th class="d-none d-lg-table-cell">Date</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedLifts as lift}
					<tr>
						<td>{lift.rank}</td>
						<td>{lift.displayName}</td>
						<td class="d-none d-md-table-cell">{lift.squat}</td>
						<td class="d-none d-md-table-cell">{lift.bench}</td>
						<td class="d-none d-md-table-cell">{lift.deadlift}</td>
						<td>{lift.total}</td>
						<td class="d-none d-lg-table-cell">{lift.formattedDate}</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	</div>

	<script lang="ts">
		import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	</script>

	<Pagination aria-label="Leaderboard navigation" class="justify-content-center mt-3">
		<PaginationItem class={currentPage === 1 ? 'disabled' : ''}>
			<PaginationLink previous on:click={() => goToPage(currentPage - 1)} />
		</PaginationItem>
		{#each Array(totalPages) as _, i}
			<PaginationItem class={currentPage === i + 1 ? 'active' : ''}>
				<PaginationLink on:click={() => goToPage(i + 1)}>
					{i + 1}
				</PaginationLink>
			</PaginationItem>
		{/each}
		<PaginationItem class={currentPage === totalPages ? 'disabled' : ''}>
			<PaginationLink next on:click={() => goToPage(currentPage + 1)} />
		</PaginationItem>
	</Pagination>
</div>

<style>
	.leaderboard-container {
		max-width: 100%;
		overflow-x: auto;
		padding: 0 15px;
	}

	.leaderboard-table {
		min-width: 300px;
	}

	@media (max-width: 767px) {
		.leaderboard-table th,
		.leaderboard-table td {
			font-size: 0.875rem;
		}
	}

	@media (max-width: 575px) {
		.leaderboard-table th,
		.leaderboard-table td {
			font-size: 0.75rem;
		}
	}
</style>
