<script lang="ts">
	import { page } from '$app/stores';
	import { Theme } from '@sveltestrap/sveltestrap';
	import Leaderboard from '../../../components/Leaderboard.svelte';

	// Fix the parameter name to match the file path
	let university: string;
	$: university = $page.params.selectedUniversity;
</script>

<svelte:head>
	<title>{university} Leaderboard</title>
</svelte:head>
<Theme theme="dark">
	<Leaderboard {university} />
</Theme>
