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
	import { getUserLiftsPersonal, updateUserInfo, getUserInfo } from '../../dbFunctions';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import type { Lift, UserInfo } from '../../types';
	import UniversitySelector from '../../components/UniversitySelector.svelte';
	import EditLiftForm from '../../components/EditLiftForm.svelte';
	import {weightUnit} from '../../stores/weightUnitStore';
	import { convertWeight } from '../../helpers';
	const title = 'Collegiate Strength - User Profile';
	let userLifts: Lift[] = [];
	let sort: keyof Lift = 'dotsScore';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let unsubscribeUser: (() => void) | undefined;
	let unsubscribeLifts: (() => void) | undefined;
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
				unsubscribeLifts = getUserLiftsPersonal($user.uid, (lifts) => {
					userLifts = lifts;
				});

				const unsubscribeUserInfo = getUserInfo($user.uid, (info) => {
					if (info !== null) {
						userInfo = info;
						updatedUserInfo.selectedUniversity = info.selectedUniversity;
					}
				});

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
		// toggleUpdateModal();
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

	const editLift = (lift: Lift) => {
		openEditModal = true;
		editingLift = lift;
	};

	const handleUpdateSettings = async () => {
		if ($user) {
			await updateUserInfo($user, updatedUserInfo);
			toggleUpdateModal();
		}
	};

	const handleLiftUpdated = () => {
		editingLift = null;
		if ($user) {
			unsubscribeLifts = getUserLiftsPersonal($user.uid, (lifts) => {
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

	<div class="main-content">
		<!-- Update Modal -->
		<Modal isOpen={openUpdateModal}>
			<ModalHeader>Update Your Information</ModalHeader>
			<ModalBody>
				<Form on:submit={updateInfo}>
					<FormGroup>
						<InputGroup>
							<InputGroupText class="custom-label">Username:</InputGroupText>
							<Input
								type="text"
								id="userName"
								bind:value={updatedUserInfo.userName}
								placeholder={'Previous: ' + userInfo.userName}
								class="custom-input"
							/>
						</InputGroup>
					</FormGroup>
					<FormGroup>
						<UniversitySelector bind:selectedUniversity={updatedUserInfo.selectedUniversity} />
					</FormGroup>
					<div class="modal-buttons">
						<Button color="primary" type="submit" on:click={handleUpdateSettings}>Update</Button>
						<Button color="secondary" on:click={toggleUpdateModal}>Cancel</Button>
					</div>
				</Form>
			</ModalBody>
		</Modal>

		<!-- Edit Lift Modal -->
		{#if editingLift}
			<EditLiftForm
				bind:open={openEditModal}
				lift={editingLift}
				on:liftUpdated={handleLiftUpdated}
			/>
		{/if}

		<div class="content-wrapper">
			<!-- Leaderboard Table -->
			<div class="leaderboard-container">
				<DataTable
					sortable
					bind:sort
					bind:sortDirection
					on:SMUIDataTable:sorted={handleSort}
					table$aria-label="Personal Lifts"
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
								<Label>Action</Label>
							</Cell>
						</Row>
					</Head>
					<Body>
						{#each userLifts as lift}
							<Row>
								{#each columns as column}
									<Cell numeric={column.numeric}>
										{#if column.key === 'squat' || column.key === 'bench' || column.key === 'deadlift' || column.key === 'total' || column.key === 'bodyWeight'}
											{!lift[column.key] ? 'N/A' : convertWeight(lift[column.key], $weightUnit) + ' ' + $weightUnit}
										{:else}
											{lift[column.key]}
										{/if}
									</Cell>
								{/each}
								<Cell>
									<Button on:click={() => editLift(lift)}>Edit</Button>
								</Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
			</div>

			<!-- Settings Panel -->
			<aside class="settings-panel">
				{#if userInfo}
					<h2>Settings</h2>
					<div class="settings-option">
						<div class="settings-label">Username:</div>
						<div class="settings-value">{userInfo.userName}</div>
					</div>
					<div class="settings-option">
						<div class="settings-label">University:</div>
						<div class="settings-value">{userInfo.selectedUniversity}</div>
					</div>
					<div class="settings-buttons">
						<Button type="button" on:click={toggleUpdateModal} color="primary">Update Info</Button>
						<Button on:click={logout} color="danger">Sign Out</Button>
					</div>
				{:else}
					<p>Loading user information...</p>
				{/if}
			</aside>
		</div>
	</div>
{:else}
	<div class="login-container">
		<p>Please sign in to access all features:</p>
		<Button on:click={login}>Sign In with Google</Button>
	</div>
{/if}
<style>
    h1 {
        color: var(--dark-accent-blue);
        text-align: center;
        margin-bottom: 2rem;
        font-size: 2rem;
    }

    h2 {
        color: #fff;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
    }

    .main-content {
        width: 90%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .content-wrapper {
        display: flex;
        gap: 2rem;
        margin-top: 2rem;
    }

	.leaderboard-container {
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
	}

    .settings-panel {
        width: 300px;
        background-color: #2a2a2e;
        padding: 1.5rem;
        border-radius: 8px;
        height: fit-content;
    }

    .settings-option {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: #333;
        border-radius: 4px;
    }

    .settings-label {
        font-weight: bold;
        color: #888;
        font-size: 0.9rem;
    }

    .settings-value {
        color: #fff;
        word-break: break-word;
    }

    .settings-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .modal-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .login-container {
        text-align: center;
        margin-top: 2rem;
    }

    :global(.custom-label) {
        font-weight: bold;
        display: flex;
        justify-content: center;
        width: 7.5rem;
        border-radius: 0.25rem 0 0 0.25rem;
        padding: 0.375rem 0.75rem;
    }

    :global(.custom-input) {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        text-overflow: ellipsis;
    }

    :global(.mdc-data-table) {
        width: 100%;
        border: 1px solid #5b5656;
        border-radius: 4px;
        background-color: #2a2a2e;
    }

    :global(.mdc-data-table__header-cell) {
        font-weight: bold;
        text-transform: uppercase;
        background-color: #0761c7;
        font-size: 1rem;
        color: aliceblue;
        padding: 0.75rem;
    }

    :global(.mdc-data-table__cell) {
        color: #fff;
        padding: 0.75rem;
        border-bottom: 1px solid #444;
    }

    :global(.modal-content) {
        background-color: #2a2a2e;
        color: #fff;
    }

    :global(.modal-header) {
        border-bottom: 1px solid #444;
    }

    /* Responsive Styles */
    @media (max-width: 1300px) {
        .content-wrapper {
            flex-direction: column;
        }

        .settings-panel {
            width: 50%;
			margin: 0 auto;
            margin-top: 2rem;
        }

        .settings-buttons {
            flex-direction: row;
            justify-content: space-between;
        }

        h1 {
            font-size: 1.75rem;
        }
    }

    @media (max-width: 480px) {
        .main-content {
            width: 100%;
            padding: 0 0.5rem;
        }

        h1 {
            font-size: 1.5rem;
        }

        .settings-buttons {
            flex-direction: column;
            gap: 0.5rem;
        }

        :global(.custom-label) {
            width: 6rem;
            font-size: 0.9rem;
        }
    }
</style>