<script lang="ts">
	import { user } from '../../stores/userStore';
	import { userInfoStore } from '../../stores/userInfoStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut } from 'firebase/auth';
	import { Button, Form, FormGroup, InputGroup,
		InputGroupText, Input } from '@sveltestrap/sveltestrap';
	import { onMount, onDestroy } from 'svelte';
	import { getUserLifts } from '../../dbFunctions';
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
	$: if ($userInfoStore) {
		selectedUniversity = $userInfoStore.selectedUniversity;
		gender = $userInfoStore.gender;
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

	const updateUserInfo = () => {
		userInfoStore.updateUserInfo({ gender: 'Updated Gender' });
		// Note: Implement the actual update in Firebase here
	};

	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'dotsScore', label: 'Dots', sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true },
		{ key: 'bench', label: 'Bench', numeric: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true },
		{ key: 'total', label: 'Total', numeric: true }
	];
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
			<Form on:submit={updateUserInfo}>
				<FormGroup>
					<InputGroup>
						<UniversitySelector bind:selectedUniversity />					</InputGroup>
				</FormGroup>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Gender</InputGroupText>
						<Input type="select" id="gender" bind:value={gender}>
							<option value="">Select</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
						</Input>
					</InputGroup>
				</FormGroup>
				<Button type="submit">Update Settings</Button>
				</Form>
			{:else}
				<p>Loading user information...</p>
			{/if}
		</aside>
	</div>
	<div class="leaderboard-container">
		<DataTable
			sortable
			bind:sort
			bind:sortDirection
			on:SMUIDataTable:sorted={handleSort}
			table$aria-label="Powerlifting Leaderboard"
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
{:else}
	<p>Please sign in to access all features:</p>
	<Button on:click={login}>Sign In with Google</Button>
{/if}

<style>
	.leaderboard-container {
		width: 65%;
		text-align: center;
		margin: auto;
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
