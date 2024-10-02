<script lang="ts">
	import { auth as authStore } from '../../stores/authStores';
	import { user } from '../../stores/userStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';
	import { Button } from '@sveltestrap/sveltestrap';
	import { getUserInfo, type UserInfo } from '../../dbFunctions';
	import { onMount } from 'svelte';
	const title = 'Collegiate Strength - User Profile';

	let userInfo: UserInfo | null = null;
	let userGender: string;
	let userUniversity: string;

	const login = async () => {
		try {
			await signInWithPopup(auth, provider);
			authStore.login();
			localStorage.setItem('isAuthenticated', 'true');
		} catch (error) {
			console.error('Authentication error:', error);
		}
	};
	onMount(async () => {
		if ($user) {
			try {
				userInfo = await getUserInfo($user.uid);
				if (userInfo) {
					userGender = userInfo.gender;
					userUniversity = userInfo.selectedUniversity;
				}
				console.log(userInfo);
			} catch (error) {
				console.error('Error fetching user information:', error);
			}
		}
	});

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
	<div class="user-container">
		<div>
			<h1>Welcome, {$user.displayName}!</h1>
			<Button on:click={logout}>Sign Out</Button>
		</div>
		<aside class="settings-panel">
			<p>This Will be a "form" that allows user to change specific settings</p>
			<section>
				<p>University: {userUniversity}</p>
			</section>
			<section>
				<p>Gender: {userGender}</p>
			</section>
		</aside>
	</div>
	<div style="text-align: center">
		<h1>Content for userLifts</h1>
	</div>
{:else}
	<p>Please sign in to access all features:</p>
	<Button on:click={login}>Sign In with Google</Button>
{/if}

<style>
	.user-container {
		display: flex;
		flex-grow: 1;
	}
	h1 {
		color: var(--dark-accent-blue);
	}
	.settings-panel {
		display: flex;
		flex-direction: column;
		align-items: start;
		border: 1px black solid;
		margin-left: 50%;
		width: 25%;
		color: red;
		flex-grow: 3;
	}
</style>
