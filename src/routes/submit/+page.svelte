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
	import { v4 as uuidv4 } from 'uuid';
	import { getUserInfo, submitLift } from '../../dbFunctions';
	import type { UserInfo } from '../../types';

	let unsubscribe: (() => void) | undefined;

	let gender: string = '';
	let selectedUniversity: string = '';
	let squat: string = ''; // Adjusted to string to handle input parsing
	let bench: string = '';
	let deadlift: string = '';
	let bodyWeight: string = '';
	let age: number;
	const title = 'Submit Your Powerlifting Lifts - Collegiate Strength';
	let hasInitialized = false;
	let newUUID = '';
	let liftType: string;

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
		newUUID = uuidv4();
		event.preventDefault();

		// Validate required fields
		if (!liftType) {
			alert('Please select a lift type (Comp Lift or Gym Lift).');
			return;
		}

		if (!selectedUniversity) {
			alert('Please select your university.');
			return;
		}

		const parsedSquat = parseFloat(squat) || 0;
		const parsedBench = parseFloat(bench) || 0;
		const parsedDeadlift = parseFloat(deadlift) || 0;
		const parsedBodyWeight = parseFloat(bodyWeight) || 0;

		const total = parsedSquat + parsedBench + parsedDeadlift;

		if ($user) {
			try {
				await submitLift(
					$user,
					parsedSquat,
					parsedBench,
					parsedDeadlift,
					parsedBodyWeight,
					age,
					gender,
					selectedUniversity,
					newUUID,
					liftType
				);
				alert(`Lift submitted successfully!`);
			} catch (error) {
				if (error instanceof Error && error.message === 'Lift exceeds maximum allowed weight.') {
					alert(
						'Your lifts seem to exceed the average and need to be verified! Please contact support@collegiatestrength.com for assistance.'
					);
				} else {
					console.error('Error submitting lift:', error);
					alert('Error submitting lift. Please try again.');
				}
			}
		} else {
			alert('Please sign in to submit your lift.');
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Submit your powerlifting records to the collegiate strength leaderboard. Track your squat, bench press, and deadlift PRs. Join university powerlifters competing nationwide and improve your DOTS score ranking."
	/>
	<meta
		name="keywords"
		content="submit powerlifting lifts, powerlifting record submission, collegiate powerlifting tracker, university strength records, squat bench deadlift submission, DOTS score tracker, student athlete powerlifting, college powerlifting records, campus recreation lifting, powerlifting competition entry, strength sports submission, university gym records, collegiate strength tracking, powerlifting meet results, student powerlifting database"
	/>

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta
		property="og:description"
		content="Submit your powerlifting records and compete with collegiate athletes nationwide. Track squat, bench, deadlift PRs on the premier university strength platform."
	/>
	<meta property="og:type" content="website" />

	<!-- Twitter -->
	<meta name="twitter:title" content={title} />
	<meta
		name="twitter:description"
		content="Submit your powerlifting records and compete with collegiate athletes nationwide."
	/>
</svelte:head>

{#if $user}
	<div class="submit-container">
		<header class="submit-header">
			<h1>Submit Your Lifts</h1>
			<p class="submit-description">
				Select your weight unit in the navigation! That is how everything will be entered
			</p>
		</header>

		<Form on:submit={handleSubmit} class="submit-form">
			<!-- Lift Values Section -->
			<div class="form-section">
				<h3 class="section-title">Lift Values</h3>
				<Row class="form-row">
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Squat</InputGroupText>
								<Input
									type="text"
									id="squat"
									bind:value={squat}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Bench</InputGroupText>
								<Input
									type="text"
									id="bench"
									bind:value={bench}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Deadlift</InputGroupText>
								<Input
									type="text"
									id="deadlift"
									bind:value={deadlift}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
				</Row>
			</div>

			<!-- Personal Information Section -->
			<div class="form-section">
				<h3 class="section-title">Personal Information</h3>
				<Row class="form-row">
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Gender</InputGroupText>
								<Input
									type="select"
									id="gender"
									bind:value={gender}
									placeholder="Select Gender"
									class="form-input"
								>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
								</Input>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Age</InputGroupText>
								<Input
									type="number"
									id="age"
									bind:value={age}
									min="0"
									max="100"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} sm={6} lg={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Body Weight</InputGroupText>
								<Input
									type="text"
									id="weight"
									bind:value={bodyWeight}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
				</Row>
			</div>

			<!-- Additional Information Section -->
			<div class="form-section">
				<h3 class="section-title">Additional Information</h3>
				<Row class="form-row">
					<Col xs={12} lg={6} class="form-col">
						<FormGroup class="form-group-mobile">
							<div class="university-wrapper">
								<UniversitySelector bind:selectedUniversity />
							</div>
						</FormGroup>
					</Col>
					<Col xs={12} lg={6} class="form-col">
						<FormGroup class="form-group-mobile">
							<div class="radio-container">
								<span class="radio-label">Lift Type:</span>
								<div class="radio-options">
									{#each ['Comp Lift', 'Gym Lift'] as value, index}
										<div class="radio-option">
											<Input
												type="radio"
												bind:group={liftType}
												{value}
												label={value}
												class="radio-input"
												required={index === 0}
											/>
										</div>
									{/each}
								</div>
							</div>
						</FormGroup>
					</Col>
				</Row>
			</div>

			<!-- Submit Button -->
			<div class="submit-button-container">
				<Button type="submit" color="primary" class="submit-button">Submit Lift</Button>
			</div>
		</Form>
	</div>
{:else}
	<div class="signin-container">
		<h2>Please sign in to submit a lift</h2>
		<p>You need to be authenticated to submit your powerlifting data.</p>
	</div>
{/if}

<style>
	/* Container Styles */
	.submit-container {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.submit-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 0 1rem;
	}

	.submit-description {
		font-size: 1.1rem;
		color: #b3b3b3;
		margin-bottom: 0;
		font-weight: 400;
	}

	.signin-container {
		text-align: center;
		padding: 2rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.signin-container h2 {
		color: #f35151;
		margin-bottom: 1rem;
	}

	.signin-container p {
		color: #b3b3b3;
		font-size: 1.1rem;
	}

	/* Form Layout */
	.submit-form {
		width: 100%;
		padding: 0 1rem;
	}

	.form-section {
		background-color: rgba(255, 255, 255, 0.03);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.form-section:not(:last-child) {
		margin-bottom: 2.5rem;
	}

	.section-title {
		color: #4fc3f7;
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		text-align: center;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(79, 195, 247, 0.3);
	}

	.form-row {
		margin-bottom: 0;
	}

	.form-col {
		margin-bottom: 1.5rem;
	}

	.form-group-mobile {
		margin-bottom: 0;
	}

	/* Input Group Styles */
	.input-group-mobile {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.custom-label) {
		font-weight: 600;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 120px;
		background-color: #0761c7;
		color: white;
		border: none;
		border-radius: 6px 0 0 6px;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.form-input) {
		border: none;
		border-radius: 0 6px 6px 0;
		background-color: #2a2a2a;
		color: white;
		font-size: 1rem;
		padding: 0.75rem 1rem;
		transition: all 0.2s ease;
	}

	:global(.form-input:focus) {
		background-color: #333;
		border-color: #4fc3f7;
		box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.25);
	}

	/* University Selector Wrapper */
	.university-wrapper {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Radio Container */
	.radio-container {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.radio-label {
		display: block;
		color: #4fc3f7;
		font-weight: 600;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		font-size: 0.9rem;
		letter-spacing: 0.5px;
	}

	.radio-options {
		display: flex;
		gap: 1.5rem;
		justify-content: flex-start;
		align-items: center;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.radio-input) {
		margin-right: 0.5rem;
	}

	/* Submit Button */
	.submit-button-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		padding: 1rem;
	}

	:global(.submit-button) {
		padding: 1rem 3rem;
		font-size: 1.1rem;
		font-weight: 600;
		border-radius: 8px;
		background-color: #0761c7;
		border-color: #0761c7;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	:global(.submit-button:hover) {
		background-color: #0550a3;
		border-color: #0550a3;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(7, 97, 199, 0.3);
	}

	/* Mobile Responsive Styles */
	@media (max-width: 992px) {
		.form-section {
			padding: 1.25rem;
			margin-bottom: 1.5rem;
		}

		.form-section:not(:last-child) {
			margin-bottom: 2rem;
		}

		.section-title {
			font-size: 1.1rem;
			margin-bottom: 1.25rem;
		}

		.form-col {
			margin-bottom: 1.75rem;
		}
	}

	@media (max-width: 768px) {
		.submit-container {
			padding: 0 0.5rem;
		}

		.submit-header {
			margin-bottom: 1.5rem;
			padding: 0 0.5rem;
		}

		.submit-description {
			font-size: 1rem;
		}

		.submit-form {
			padding: 0;
		}

		.form-section {
			padding: 1rem;
			margin-bottom: 1.25rem;
			border-radius: 8px;
		}

		.form-section:not(:last-child) {
			margin-bottom: 1.75rem;
		}

		.section-title {
			font-size: 1rem;
			margin-bottom: 1rem;
		}

		.form-col {
			margin-bottom: 1.5rem;
		}

		.form-group-mobile {
			margin-bottom: 0.75rem;
		}

		:global(.custom-label) {
			min-width: 100px;
			font-size: 0.8rem;
			padding: 0.625rem 0.75rem;
		}

		:global(.form-input) {
			font-size: 0.95rem;
			padding: 0.625rem 0.875rem;
		}

		.university-wrapper {
			padding: 0.625rem 0.875rem;
			margin-bottom: 0.75rem;
		}

		.radio-container {
			padding: 0.875rem;
			margin-bottom: 0.75rem;
		}

		.radio-options {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		:global(.submit-button) {
			padding: 0.875rem 2rem;
			font-size: 1rem;
		}
	}

	@media (max-width: 576px) {
		.submit-header {
			margin-bottom: 1.25rem;
		}

		.form-section {
			padding: 0.875rem;
			margin-bottom: 1rem;
		}

		.form-section:not(:last-child) {
			margin-bottom: 1.5rem;
		}

		.section-title {
			font-size: 0.95rem;
			margin-bottom: 0.875rem;
		}

		.form-col {
			margin-bottom: 1rem;
		}

		:global(.custom-label) {
			min-width: 90px;
			font-size: 0.75rem;
			padding: 0.5rem 0.625rem;
		}

		:global(.form-input) {
			font-size: 0.9rem;
			padding: 0.5rem 0.75rem;
		}

		.university-wrapper {
			padding: 0.5rem 0.75rem;
			margin-bottom: 0.75rem;
		}

		.radio-container {
			padding: 0.75rem;
			margin-bottom: 0.75rem;
		}

		.radio-label {
			font-size: 0.85rem;
			margin-bottom: 0.5rem;
		}

		:global(.submit-button) {
			padding: 0.75rem 1.5rem;
			font-size: 0.95rem;
			width: 100%;
			max-width: 300px;
		}
	}

	@media (max-width: 400px) {
		.submit-container {
			padding: 0 0.25rem;
		}

		.form-section {
			padding: 0.75rem;
		}

		:global(.custom-label) {
			min-width: 80px;
			font-size: 0.7rem;
		}

		:global(.form-input) {
			font-size: 0.85rem;
		}
	}
</style>
