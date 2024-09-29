<script lang="ts">
	import { user } from '../../stores/userStore';
	import { db } from '$lib/firebase';
	import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

	let squat: number = 0;
	let bench: number = 0;
	let deadlift: number = 0;
	let gender: string = '';
	let age: number = 0;
	let selectedUniversity: string = '';
	let dotsScore: number = 0;
	let bodyWeight: number = 0;
	//Dots Variables
	const menA = 0.000001093;
	const menB = 0.0007391293;
	const menC = 0.1918759221;
	const menD = 24.0900756;
	const menE = 307.75076;

	const womenA = -0.0000010706;
	const womenB = 0.0005158568;
	const womenC = -0.1126655495;
	const womenD = 13.6175032;
	const womenE = -57.96288;
	function Calculate_DOTS(bodyWeight: number, weightLifted: number, gender: string) {
		weightLifted = weightLifted / 2.205;
		bodyWeight = bodyWeight / 2.205;
		const maleCoeff = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
		const femaleCoeff = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];
		const isFemale = gender === 'Female' ? true : false;
		let denominator = isFemale ? femaleCoeff[0] : maleCoeff[0];
		let coeff = isFemale ? femaleCoeff : maleCoeff;
		let maxbw = isFemale ? 150 : 210;
		let bw = Math.min(Math.max(bodyWeight, 40), maxbw);

		for (let i = 1; i < coeff.length; i++) {
			denominator += coeff[i] * Math.pow(bw, i);
		}

		let score = (500 / denominator) * weightLifted;
		return score.toFixed(2);
	}
	const submitLifts = async () => {
		if ($user) {
			try {
				const total: number = bench + squat + deadlift;
				let dotsScore = Calculate_DOTS(bodyWeight, total, gender);
				// Create a new lift document in the 'lifts' collection
				const liftDocRef = await addDoc(collection(db, 'lifts'), {
					userId: $user.uid,
					displayName: $user.displayName,
					squat,
					bench,
					deadlift,
					gender,
					age,
					dotsScore,
					selectedUniversity,
					total,
					timestamp: serverTimestamp()
				});

				// Add or update the lift in the user's specific lifter table
				const lifterDocRef = doc(db, 'lifters', $user.uid);
				await setDoc(
					lifterDocRef,
					{
						userId: $user.uid,
						displayName: $user.displayName,
						gender,
						lifts: {
							[liftDocRef.id]: {
								squat,
								bench,
								deadlift,
								age,
								total,
								timestamp: serverTimestamp()
							}
						}
					},
					{ merge: true }
				);

				alert('Submission successful!');
			} catch (error) {
				console.error('Error submitting lifts:', error);
			}
		} else {
			alert('Please sign in to submit your lifts.');
		}
	};
</script>

{#if $user}
	<header class="w-75 mx-auto">
		<h1>Submit Your Lifts</h1>
		<h6>Enter everything in pounds</h6>
	</header>

	<Form on:submit={submitLifts} class="w-75 mx-auto">
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
			<Col sm={12} md={3}>
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
			<Col sm={12} md={3}>
				<FormGroup>
					<InputGroup>
						<InputGroupText class="custom-label">Age</InputGroupText>
						<Input type="number" id="age" bind:value={age} min="0" max="100" required />
					</InputGroup>
				</FormGroup>
			</Col>
			<Col sm={12} md={3}>
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

	:global(.input-group .form-control) {
		flex: 1;
	}
</style>
