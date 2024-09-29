<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import { Table, Column } from '@sveltestrap/sveltestrap';

	let lifts: any[] = [];

	const q = query(collection(db, 'lifts'), orderBy('total', 'desc'), limit(10));

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

	function formatDate(timestamp: { toDate: () => any }) {
		if (!timestamp) return '';
		const date = timestamp.toDate();
		return date.toLocaleDateString();
	}
</script>

<div class="w-75 mx-auto dark-theme">
	<h2 class="mb-4">Top 10 Lifts</h2>
	<Table striped hover size={'md'} rows={lifts} let:row class="table">
		<Column header="Rank" width="4rem">
			{row.rank}
		</Column>
		<Column header="Name" width="8rem">
			{row.displayName}
		</Column>
		<Column header="Squat" width="6rem">
			{row.squat}
		</Column>
		<Column header="Bench" width="6rem">
			{row.bench}
		</Column>
		<Column header="Deadlift" width="6rem">
			{row.deadlift}
		</Column>
		<Column header="Total (lbs)" width="6rem">
			{row.total}
		</Column>
		<Column header="Date" width="8rem">
			{row.formattedDate}
		</Column>
	</Table>
</div>
