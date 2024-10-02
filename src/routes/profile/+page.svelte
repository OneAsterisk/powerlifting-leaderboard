<script lang="ts">
    import { user } from '../../stores/userStore';
    import { userInfoStore } from '../../stores/userInfoStore';
    import { auth, provider } from '$lib/firebase';
    import { signInWithPopup, signOut } from 'firebase/auth';
    import { Button } from '@sveltestrap/sveltestrap';
    import { onMount, onDestroy } from 'svelte';

    const title = 'Collegiate Strength - User Profile';

    let unsubscribe: (() => void) | undefined;

    onMount(() => {
        unsubscribe = user.subscribe(currentUser => {
            if (currentUser) {
                userInfoStore.fetchUserInfo(currentUser.uid);
            } else {
                userInfoStore.clearUserInfo();
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
        userInfoStore.clearUserInfo();
    });

    const login = async () => {
        try {
            await signInWithPopup(auth, provider);
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('isAuthenticated');
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    };

    const updateUserInfo = () => {
        userInfoStore.updateUserInfo({ gender: 'Updated Gender' });
        // Note: Implement the actual update in Firebase here
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
            {#if $userInfoStore}
                <section>
                    <p>University: {$userInfoStore.selectedUniversity}</p>
                </section>
                <section>
                    <p>Gender: {$userInfoStore.gender}</p>
                </section>
                <Button on:click={updateUserInfo}>Update User Info</Button>
            {:else}
                <p>Loading user information...</p>
            {/if}
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