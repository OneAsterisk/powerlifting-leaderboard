<script>
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';
	import { user } from '../stores/userStore';

	const login = async () => {
		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error('Authentication error:', error);
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Sign-out error:', error);
		}
	};
</script>

{#if $user}
	<p>Welcome, {$user.displayName}!</p>
	<button on:click={logout}>Sign Out</button>
{:else}
	<button on:click={login}>Sign In with Google</button>
{/if}
