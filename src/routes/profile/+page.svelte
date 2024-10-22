<script lang="ts">
	import { user } from '../../stores/userStore';
	import { userInfoStore } from '../../stores/userInfoStore';
	import { auth, provider } from '$lib/firebase';
	import { signInWithPopup, signOut, type User } from 'firebase/auth';
	import {
		Button,
		Form,
		FormGroup,
		InputGroup,
		Modal,
		ModalBody,
		ModalHeader,
		ModalFooter,
		InputGroupText,
		Input
	} from '@sveltestrap/sveltestrap';
	import { onMount, onDestroy } from 'svelte';
	import { getUserLifts, updateUserInfo, getUserInfo } from '../../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift, UserInfo } from '../../types';
	import UniversitySelector from '../../components/UniversitySelector.svelte';
	import EditLiftForm from '../../components/EditLiftForm.svelte';

	const title = 'Collegiate Strength - User Profile';
	let userLifts: Lift[] = [];
	let selectedUniversity = '';
	let gender = '';
	let sort: keyof Lift = 'dotsScore';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let unsubscribeUser: (() => void) | undefined;
	let unsubscribeLifts: (() => void) | undefined;
	let hasInitialized = false;
	let userInfo: UserInfo;
	let openEditModal = false;
	let openUpdateModal = false;
	let updatedUserInfo = {
		userName: '',
		selectedUniversity: ''
	};
	onMount(() => {
		unsubscribeUser = user.subscribe((currentUser) => {
			if (currentUser && $user) {
				unsubscribeLifts = getUserLifts($user.uid, (lifts) => {
					userLifts = lifts;
				});

				// Use getUserInfoNew with its callback
				const unsubscribeUserInfo = getUserInfo($user.uid, (info) => {
					if (info !== null) {
						userInfo = info;
						updatedUserInfo.selectedUniversity = info.selectedUniversity;
					}
				});

				// Don't forget to unsubscribe when component is destroyed
				return () => {
					if (unsubscribeLifts) unsubscribeLifts();
					if (unsubscribeUserInfo) unsubscribeUserInfo();
				};
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
		toggleUpdateModal;
	};
	const columns: { key: keyof Lift; label: string; numeric?: boolean; sortable?: boolean }[] = [
		{ key: 'dotsScore', label: 'Dots', sortable: true },
		{ key: 'squat', label: 'Squat', numeric: true },
		{ key: 'bench', label: 'Bench', numeric: true },
		{ key: 'deadlift', label: 'Deadlift', numeric: true },
		{ key: 'total', label: 'Total', numeric: true },
		{ key: 'selectedUniversity', label: 'University' }
	];

	let editingLift: Lift | null = null;
	// let open = false;
	const editLift = (lift: Lift) => {
		openEditModal = true;
		editingLift = lift;
	};
	const handleUpdateSettings = async () => {
		if ($user) {
			await updateUserInfo($user, updatedUserInfo);
		}
	};
	const handleLiftUpdated = () => {
		editingLift = null;
		if ($user) {
			unsubscribeLifts = getUserLifts($user.uid, (lifts) => {
				userLifts = lifts;
			});
		}
	};

	const toggleUpdateModal = () => {
		if (!openUpdateModal) {
			updatedUserInfo = {
				userName: userInfo.userName,
				selectedUniversity: userInfo.selectedUniversity
			};
		}
		openUpdateModal = !openUpdateModal;
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if $user}
	<h1>Welcome, {$user.displayName}!</h1>

	<!-- Main content container -->
	<div class="main-content">
		<Modal isOpen={openUpdateModal}>
			<ModalHeader>Update Your Information</ModalHeader>
			<ModalBody>
				<Form on:submit={handleUpdateSettings}>
					<FormGroup>
						<InputGroup>
							<InputGroupText class="custom-label">Username:</InputGroupText>

							<Input
								type="text"
								id="userName"
								bind:value={updatedUserInfo.userName}
								placeholder={'Previous: ' + userInfo.userName}
								style="text-overflow: ellipsis; border-top-right-radius: 5px; border-bottom-right-radius: 5px;"
							/>
						</InputGroup>
					</FormGroup>
					<FormGroup>
						<UniversitySelector bind:selectedUniversity={updatedUserInfo.selectedUniversity} />
					</FormGroup>
				</Form>
				<Button color="primary" type="submit" on:click={handleUpdateSettings}>Update</Button>
				<Button color="secondary" on:click={toggleUpdateModal}>Cancel</Button>
			</ModalBody>
		</Modal>
		{#if editingLift}
			<EditLiftForm
				bind:open={openEditModal}
				lift={editingLift}
				on:liftUpdated={handleLiftUpdated}
			/>
		{/if}
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
						<Cell>
							<Label><span>Action</span></Label>
						</Cell>
					</Row>
				</Head>
				<Body>
					{#each userLifts as lift}
						<Row>
							{#each columns as column}
								<Cell numeric={column.numeric}>{lift[column.key]}</Cell>
							{/each}
							<Cell>
								<Label><Button on:click={() => editLift(lift)}>Edit</Button></Label>
							</Cell>
						</Row>
					{/each}
				</Body>
			</DataTable>
		</div>
		<aside class="settings-panel">
			{#if userInfo}
				<h2>Settings</h2>
				<div class="settings-option">
					<div class="settings-label">Username:</div>
					<div class="settings-label">{userInfo.userName}</div>
				</div>
				<div class="settings-option">
					<div class="settings-label">University:</div>
					<div class="settings-label">{userInfo.selectedUniversity}</div>
				</div>
				<div style="display: flex; justify-content: space-between; width: 100%">
					<Button type="button" on:click={toggleUpdateModal} color="primary">Update Info</Button>
					<Button on:click={logout} color="danger">Sign Out</Button>
				</div>
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
	:global(.custom-label) {
		font-weight: bold;
		display: flex;
		justify-content: center;
		width: 7.5rem;
		border-radius: 0.25rem 0 0 0.25rem;
		padding: 0.375rem 0.75rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
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
		background-color: #2a2a2e;
		padding: 10px;
		border-radius: 8px;
	}
	.settings-option {
		display: flex;
		flex-direction: row;
		row-gap: 1.5rem;
		align-items: center;
		width: 100%;
		border: 1px solid #2a2a2e;
		border-radius: 5px;
		margin-bottom: 15px; /* Add this line to create space between items */
	}
	.settings-label:first-child {
		width: 25%;
	}
	.settings-label {
		width: 75%;
		text-overflow: ellipsis;
		overflow: hidden;
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
		:global(.modal-header, .modal-body, .modal-footer) {
			background-color: #2c2c2c;
			border-color: #444343;
		}
		:global(.modal-body) {
			border-bottom-left-radius: 3%;
			border-bottom-right-radius: 3%;
		}
		h1 {
			font-size: 1.5rem; /* Optional: Adjust heading size for better readability */
		}
	}
</style>
