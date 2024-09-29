<script>
	import SubmissionForm from '../components/SubmissionForm.svelte';
	import Leaderboard from '../components/Leaderboard.svelte';
	import { user } from '../stores/userStore';
	import { Theme } from '@sveltestrap/sveltestrap';
</script>

<Theme theme="dark">
	{#if $user}
		<p>Welcome, {$user.displayName}!</p>
		<SubmissionForm />
	{:else}
		<p>Please log in to submit your lifts.</p>
	{/if}

	<Leaderboard />
</Theme>
