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
	import type { UserInfo } from '../../dbFunctions';

	let unsubscribe: (() => void) | undefined;

	let gender: string = '';
	let selectedUniversity: string = '';
	let squat: number;
	let bench: number;
	let deadlift: number;
	let bodyWeight: number;
	let age: number;
	const title = 'Collegiate Strength - Submit Lift';
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
					selectedUniversity,
					newUUID,
					liftType,
				);
				alert('Lift submitted successfully!');
				
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
						<Input type="number" id="squat" bind:value={squat} min="0" placeholder="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Bench</InputGroupText>
						<Input type="number" id="bench" bind:value={bench} min="0" placeholder="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={4}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Deadlift</InputGroupText>
						<Input type="number" id="deadlift" bind:value={deadlift} min="0" placeholder="0" required />
					</InputGroup>
				</FormGroup>
			</Col>
			</Row>
			<Row class="mb-3">
				<Col sm={12} md={4}>
					<FormGroup>
						<InputGroup>
							<InputGroupText class="custom-label" >Gender</InputGroupText>
							<Input type="select" id="gender" bind:value={gender}  placeholder="Select Gender">
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
							<Input type="number" id="age" bind:value={age} min="0" max="100" placeholder="0" required />
						</InputGroup>
					</FormGroup>
				</Col>
				<Col sm={12} md={4}>
					<FormGroup>
						<InputGroup>
							<InputGroupText class="custom-label">Body Weight</InputGroupText>
							<Input type="number" id="weight" bind:value={bodyWeight} min="0" placeholder="0" required />
						</InputGroup>
					</FormGroup>
				</Col>
			</Row>
			<Row class="mb-3">
			<Col sm={12} md={6}>
				<FormGroup>
					<UniversitySelector bind:selectedUniversity />
				</FormGroup>
			</Col>
			<Col sm={12} md={6}>
                <FormGroup class="radio-container">
                    <InputGroup>
                        {#each ['Comp Lift', 'Gym Lift'] as value}
						<div style={"margin: 0 30px;"}>
                            <Input 
                                type="radio" 
                                theme="light" 
                                bind:group={liftType} 
                                {value} 
                                label={value} 
                            />
						</div>
                        {/each}
                    </InputGroup>
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
		display: flex; /* Consider if flex is necessary; otherwise, use block or inline-block */
		justify-content: center;
		width: 7.5rem;
		border-radius: 0.25rem 0 0 0.25rem;
		padding: 0.375rem 0.75rem;
		overflow: hidden;         /* Added */
		white-space: nowrap;      /* Added */
		text-overflow: ellipsis;  /* Already present */
	}

    @media (max-width: 1080px) {
        :global(.custom-label) {
            width: 75px;
            font-size: 0.75em;
            text-overflow: clip;
        }
    }
    @media (max-width: 767px) {
        :global(.custom-label) {
            width: 75px;
            font-size: 0.75em;
            text-overflow: ellipsis;
        }
    }
    :global(.radio-container) {
        display: flex;
        justify-content: center;
		width: fit-content;
        gap: 15px; /* Added gap for spacing */
		border: 1px solid #495057;
		border-radius: 0.25rem;
        /* padding: 0.375rem 0.75rem; */
		padding: 0.3125rem  0.3rem;
		background-color: #212529;

    }
	:global(.radio-container:first-child) {
       margin-right: 20px;
    }
    :global(.input-group .form-control) {
        flex: 1;
    }
</style>