<script>
	import SubmissionForm from '../components/SubmissionForm.svelte';
	import Leaderboard from '../components/Leaderboard.svelte';
	import { user } from '../stores/userStore';
	import { Theme } from '@sveltestrap/sveltestrap';
</script>

<Theme theme="dark">
	<Leaderboard />
</Theme>
