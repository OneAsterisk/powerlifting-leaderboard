<script>
	import SubmissionForm from '../components/SubmissionForm.svelte';
	import Leaderboard from '../components/Leaderboard.svelte';
	import { user } from '../stores/userStore';
	import { Theme } from '@sveltestrap/sveltestrap';

	const title = 'Collegiate Strength - Powerlifting Leaderboard';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<Theme theme="dark">
	<Leaderboard />
</Theme>
