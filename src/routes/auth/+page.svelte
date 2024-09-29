<script>
	import { auth as authStore } from '../../stores/authStores';
	import { user } from '../../stores/userStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';

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

<h1>Authentication</h1>

{#if $user}
	<p>Welcome, {$user.displayName}!</p>
	<button on:click={logout}>Sign Out</button>
{:else}
	<p>Please sign in to access all features:</p>
	<button on:click={login}>Sign In with Google</button>
{/if}

<style>
	h1 {
		color: var(--dark-accent-blue);
	}
	button {
		background-color: var(--dark-accent-green);
		color: var(--dark-text-primary);
		border: none;
		padding: 10px 20px;
		cursor: pointer;
	}
</style>
