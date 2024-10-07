<script lang="ts">
	import { user } from '../../stores/userStore';
	import {
		Form,
		FormGroup,
		Label,
		Input,
		Button,
		InputGroup,
		InputGroupText,
		Row,
		Col
	} from '@sveltestrap/sveltestrap';
	import UniversitySelector from '../../components/UniversitySelector.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { userInfoStore } from '../../stores/userInfoStore';

	import { getUserInfo, submitLift } from '../../dbFunctions';
	import type { UserInfo } from '../../dbFunctions';

	let unsubscribe: (() => void) | undefined;

	let gender = '';
	let selectedUniversity = 'Select University';
	let squat = 0;
	let bench = 0;
	let deadlift = 0;
	let bodyWeight = 0;
	let age = 0;
	const title = 'Collegiate Strength - Submit Lift';
	let hasInitialized = false;

	onMount(() => {
		unsubscribe = user.subscribe((currentUser) => {
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

	$: if ($userInfoStore && !hasInitialized) {
		gender = $userInfoStore.gender || '';
		hasInitialized = true;
	}

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if ($user) {
			try {
				await submitLift(
					$user,
					squat,
					bench,
					deadlift,
					bodyWeight,
					age,
					gender,
					selectedUniversity
				);
				alert('Lift submitted successfully!');
				// Optionally reset form fields here
			} catch (error) {
				console.error('Error submitting lift:', error);
				alert('Error submitting lift. Please try again.');
			}
		} else {
			alert('Please sign in to submit your lift.');
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
{#if $user}
	<header class="w-75 mx-auto">
		<h1>Submit Your Lifts</h1>
		<h6>Enter everything in pounds</h6>
	</header>

	<Form on:submit={handleSubmit} class="w-75 mx-auto">
		<Row class="mb-3">
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Squat</InputGroupText>
						<Input type="number" id="squat" bind:value={squat} min="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Bench</InputGroupText>
						<Input type="number" id="bench" bind:value={bench} min="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Deadlift</InputGroupText>
						<Input type="number" id="deadlift" bind:value={deadlift} min="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
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
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Age</InputGroupText>
						<Input type="number" id="age" bind:value={age} min="0" max="100" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Body Weight</InputGroupText>
						<Input type="number" id="weight" bind:value={bodyWeight} min="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={6}>
				<FormGroup>
					<UniversitySelector bind:selectedUniversity />
				</FormGroup>
			</Col>
		</Row>
		<Button type="submit" color="primary">Submit</Button>
	</Form>
{:else}
	<h2>Please sign in to be able to submit a lift</h2>
{/if}

<style>
	:global(.custom-label) {
		font-weight: bold;
		display: flex;
		justify-content: center;
		width: 120px;
		border-radius: 0.25rem 0 0 0.25rem;
		padding: 0.375rem 0.75rem;
	}

	@media (max-width: 1080px) {
		:global(.custom-label) {
			width: 75px;
			font-size: 0.75em;
			text-overflow: ellipsis;

		}
	}
	@media (max-width: 767px) {
		:global(.custom-label) {
			width: 75px;
			font-size: 0.75em;
			text-overflow: ellipsis;
		}
	}
	:global(.input-group .form-control) {
		flex: 1;
	}
</style>
