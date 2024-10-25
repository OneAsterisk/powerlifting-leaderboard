<script>
	import Leaderboard from '../components/Leaderboard.svelte';
	import { Theme } from '@sveltestrap/sveltestrap';

	const title = 'Collegiate Strength - Powerlifting Leaderboard';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<Theme theme="dark">
	<Leaderboard university={undefined} />
</Theme>
