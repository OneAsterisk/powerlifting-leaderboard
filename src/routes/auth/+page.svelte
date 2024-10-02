<script>
	import { auth as authStore } from '../../stores/authStores';
	import { user } from '../../stores/userStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';
	import { Button } from '@sveltestrap/sveltestrap';
	import Leaderboard from '../../components/Leaderboard.svelte';

	const title = 'Collegiate Strength - User Profile';

	const login = async () => {
		try {
			await signInWithPopup(auth, provider);
			authStore.login();
			localStorage.setItem('isAuthenticated', 'true');
		} catch (error) {
			console.error('Authentication error:', error);
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
			authStore.logout();
			localStorage.removeItem('isAuthenticated');
		} catch (error) {
			console.error('Sign-out error:', error);
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
{#if $user}
	<h1>Welcome, {$user.displayName}!</h1>
	<Button on:click={logout}>Sign Out</Button>
	<article>
		<Leaderboard leaderboardType="user" />
	</article>
	<aside>
		<p>This Will be a "form" that allows user to change specific settings</p>
	</aside>
{:else}
	<p>Please sign in to access all features:</p>
	<Button on:click={login}>Sign In with Google</Button>
{/if}

<style>
	h1 {
		color: var(--dark-accent-blue);
	}
	.settings-panel {
	}
</style>
