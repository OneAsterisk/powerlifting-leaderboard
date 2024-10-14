<script lang="ts">
	import { user } from '../../stores/userStore';
	import { userInfoStore } from '../../stores/userInfoStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';
	import { Button, Form, FormGroup, InputGroup } from '@sveltestrap/sveltestrap';
	import { onMount, onDestroy } from 'svelte';
	import { getUserLifts, updateUserInfo } from '../../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift } from '../../types';
	import UniversitySelector from '../../components/UniversitySelector.svelte';

	const title = 'Collegiate Strength - User Profile';
	let userLifts: Lift[] = [];
	let selectedUniversity = '';
	let gender = '';
	let sort: keyof Lift = 'dotsScore';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let unsubscribeUser: (() => void) | undefined;
	let unsubscribeLifts: (() => void) | undefined;
	let hasInitialized = false;

	onMount(() => {
		unsubscribeUser = user.subscribe((currentUser) => {
			if (currentUser && $user) {
				unsubscribeLifts = getUserLifts($user.uid, (lifts) => {
					userLifts = lifts;
				});
				userInfoStore.fetchUserInfo(currentUser.uid);
			} else {
				userInfoStore.clearUserInfo();
			}
		});
	});

	onDestroy(() => {
		if (unsubscribeUser) {
			unsubscribeUser();
		}
		userInfoStore.clearUserInfo();
	});

	$: if ($userInfoStore && !hasInitialized) {
		selectedUniversity = $userInfoStore.selectedUniversity || '';
		gender = $userInfoStore.gender || '';
		hasInitialized = true;
	}

	function handleSort() {
		userLifts.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		userLifts = userLifts;
	}

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

	const updateInfo = async (event: Event) => {
		event.preventDefault();
		if ($user) {
			try {
				await updateUserInfo($user, selectedUniversity);
				alert(`Information updated successfully!`);
			} catch (error) {
				console.error(`Error updating info: `, error);
				alert(`Error updating info. Please try again.`);
			}
		}
	};

	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'dotsScore', label: 'Dots', sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true },
		{ key: 'bench', label: 'Bench', numeric: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true },
		{ key: 'total', label: 'Total', numeric: true },
		{ key: 'selectedUniversity', label: 'University' },
	];
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if $user}
	<Button on:click={logout}>Sign Out</Button>
	<h1>Welcome, {$user.displayName}!</h1>

	<!-- Main content container -->
	<div class="main-content">
		<!-- Left side: Lifts table -->
		<div class="leaderboard-container">
			<DataTable
				sortable
				bind:sort
				bind:sortDirection
				on:SMUIDataTable:sorted={handleSort}
				table$aria-label="Personal Lifts"
				style="width: 100%;"
			>
				<Head>
					<Row>
						{#each columns as column}
							<Cell
								numeric={column.numeric}
								columnId={column.key}
								sortable={column.sortable !== false}
							>
								{#if column.numeric}
									<IconButton class="material-icons">arrow_upward</IconButton>
								{/if}
								<Label>{column.label}</Label>
								{#if !column.numeric && column.sortable !== false}
									<IconButton class="material-icons">arrow_upward</IconButton>
								{/if}
							</Cell>
						{/each}
					</Row>
				</Head>
				<Body>
					{#each userLifts as lift (lift.total)}
						<Row>
							{#each columns as column}
								<Cell numeric={column.numeric}>{lift[column.key]}</Cell>
							{/each}
						</Row>
					{/each}
				</Body>
			</DataTable>
		</div>
		<aside class="settings-panel">
			{#if $userInfoStore}
				<Form on:submit={updateInfo}>
					<FormGroup>
						<InputGroup>
							<UniversitySelector bind:selectedUniversity />
						</InputGroup>
					</FormGroup>
					<Button type="submit">Update Settings</Button>
				</Form>
			{:else}
				<p>Loading user information...</p>
			{/if}
		</aside>
	</div>
{:else}
	<p>Please sign in to access all features:</p>
	<Button on:click={login}>Sign In with Google</Button>
{/if}

<style>
	h1 {
		color: var(--dark-accent-blue);
		text-align: center;
	}

	.main-content {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		width: 80%;
		margin: auto;
		margin-top: 20px;
		margin-right: 30px;
	}

	.leaderboard-container {
		flex: 3;
		width: 65%;
		margin-right: 20px;
	}

	.settings-panel {
		flex: 1;
		/* background-color: #f9f9f9; */
		padding: 10px;
		border-radius: 8px;
	}

	:global(.mdc-data-table) {
		width: 100%;
		border: 1px solid #5b5656;
		border-radius: 4px;
		overflow: hidden;
		text-align: center;
	}

	:global(.mdc-data-table__table) {
		table-layout: auto;
	}

	:global(.mdc-data-table__header-cell) {
		font-weight: bold;
		text-transform: uppercase;
		background-color: #0761c7;
		font-size: 1.125rem;
		color: aliceblue;
		text-overflow: ellipsis;
	}
	:global(.mdc-data-table__cell-numeric) {
		width: 5%;
	}

	/* Responsive Styles */
	@media (max-width: 850px) {
		.main-content {
			flex-direction: column;
			width: 90%;
			margin-right: 0;
		}

		.leaderboard-container,
		.settings-panel {
			width: 100%;
			margin-right: 0;
			margin-bottom: 20px; /* Add spacing between stacked elements */
		}

		.settings-panel {
			padding: 15px; /* Optional: Adjust padding for better spacing on mobile */
		}

		h1 {
			font-size: 1.5rem; /* Optional: Adjust heading size for better readability */
		}
	}
</style>
