<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { deleteLift, updateLift } from '../dbFunctions';
	import { user } from '../stores/userStore';
	import {
		Form,
		FormGroup,
		Label,
		Input,
		Button,
		Modal,
		ModalHeader,
		ModalBody,
		InputGroup,
		InputGroupText,
		Row,
		Col
	} from '@sveltestrap/sveltestrap';
	import type { Lift } from '../types';
	import { weightUnit } from '../stores/weightUnitStore';
	import UniversitySelector from './UniversitySelector.svelte';
	import { convertWeight } from '../helpers';
	import { invalidateAll } from '$app/navigation';
	export let lift: Lift;
	export let open: boolean;
	let squat = lift.squat;
	let bench = lift.bench;
	let deadlift = lift.deadlift;
	let bodyWeight = lift.bodyWeight;
	let age = lift.age;
	let gender = lift.gender || 'Male';
	let liftType = lift.liftType;
	let selectedUniversity = lift.selectedUniversity || '';

	$: displaySquat = $weightUnit === 'kg' ? convertWeight(squat, 'kg') : squat;
	$: displayBench = $weightUnit === 'kg' ? convertWeight(bench, 'kg') : bench;
	$: displayDeadlift = $weightUnit === 'kg' ? convertWeight(deadlift, 'kg') : deadlift;
	$: displayBodyWeight = $weightUnit === 'kg' ? convertWeight(bodyWeight, 'kg') : bodyWeight;

	const convertToLbs = (weight: number, unit: 'lbs' | 'kg'): number => {
		if (unit === 'kg') {
			return Math.round(weight * 2.205 * 100) / 100;
		}
		return weight;
	};
	const toggle = () => {
		open = !open;
	};
	const dispatch = createEventDispatcher();
	const handleDelete = async (event: Event) => {
		event.preventDefault();
		if ($user) {
			try {
				const liftId = lift.liftUID || lift.liftID;
				if (!liftId) {
					throw new Error('No lift ID found');
				}
				await deleteLift($user, liftId);
				dispatch('liftDeleted');
				toggle(); // Actually call the toggle function to close the modal
			} catch (error) {
				console.error('Error deleting lift:', error);
				alert('Error deleting lift. Please try again.');
			}
		}
	};
	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if ($user) {
			try {
				// Convert all weights back to lbs before saving
				const lbsSquat = Number(
					$weightUnit === 'kg' ? convertToLbs(displaySquat, 'kg') : displaySquat
				);
				const lbsBench = Number(
					$weightUnit === 'kg' ? convertToLbs(displayBench, 'kg') : displayBench
				);
				const lbsDeadlift = Number(
					$weightUnit === 'kg' ? convertToLbs(displayDeadlift, 'kg') : displayDeadlift
				);
				const lbsBodyWeight = Number(
					$weightUnit === 'kg' ? convertToLbs(displayBodyWeight, 'kg') : displayBodyWeight
				);

				const updatedLift = {
					squat: lbsSquat,
					bench: lbsBench,
					deadlift: lbsDeadlift,
					bodyWeight: lbsBodyWeight,
					age,
					gender,
					liftType,
					selectedUniversity
				};
				const liftId = lift.liftUID || lift.liftID;
				if (!liftId) {
					throw new Error('No lift ID found');
				}
				await updateLift($user, liftId, updatedLift);
				dispatch('liftUpdated');
				toggle();
			} catch (error) {
				console.error('Error updating lift:', error);
				alert('Error updating lift. Please try again.');
			}
		}
	};
</script>

<Modal isOpen={open} class="edit-modal" size="lg">
	<ModalHeader class="edit-modal-header">
		<h4 class="modal-title">Edit Lift ({$weightUnit})</h4>
	</ModalHeader>
	<ModalBody class="edit-modal-body">
		<Form on:submit={handleSubmit} class="edit-form">
			<!-- Lift Values Section -->
			<div class="form-section">
				<h5 class="section-title">Lift Values</h5>
				<Row class="form-row">
					<Col xs={12} md={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Squat</InputGroupText>
								<Input
									type="text"
									id="squat"
									bind:value={displaySquat}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} md={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Bench</InputGroupText>
								<Input
									type="text"
									id="bench"
									bind:value={displayBench}
									pattern="^\d+(\.\d)?$"
									placeholder="0"
									required
									class="form-input"
								/>
							</InputGroup>
						</FormGroup>
					</Col>
					<Col xs={12} md={4} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Deadlift</InputGroupText>
								<Input
									type="text"
									id="deadlift"
									bind:value={displayDeadlift}
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
				<h5 class="section-title">Personal Information</h5>
				<Row class="form-row">
					<Col xs={12} md={6} class="form-col">
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
					<Col xs={12} md={6} class="form-col">
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
				</Row>
				<Row class="form-row">
					<Col xs={12} class="form-col">
						<FormGroup class="form-group-mobile">
							<InputGroup class="input-group-mobile">
								<InputGroupText class="custom-label">Body Weight</InputGroupText>
								<Input
									type="text"
									id="bodyWeight"
									bind:value={displayBodyWeight}
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
				<h5 class="section-title">Additional Information</h5>
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
									{#each ['Comp Lift', 'Gym Lift'] as value}
										<div class="radio-option">
											<Input
												type="radio"
												bind:group={liftType}
												{value}
												label={value}
												class="radio-input"
											/>
										</div>
									{/each}
								</div>
							</div>
						</FormGroup>
					</Col>
				</Row>
			</div>

			<!-- Action Buttons -->
			<div class="button-container">
				<Button type="submit" color="primary" class="action-button update-button">
					Update Lift
				</Button>
				<Button
					type="button"
					on:click={toggle}
					color="secondary"
					class="action-button cancel-button"
				>
					Cancel
				</Button>
				<Button
					type="button"
					on:click={handleDelete}
					color="danger"
					class="action-button delete-button"
				>
					Delete Lift
				</Button>
			</div>
		</Form>
	</ModalBody>
</Modal>

<style>
	/* Modal Styling */
	:global(.edit-modal .modal-content) {
		background-color: #1a1a1a;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: white;
	}

	:global(.edit-modal-header) {
		background-color: #2a2a2a;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px 12px 0 0;
	}

	.modal-title {
		color: #4fc3f7;
		font-weight: 600;
		margin: 0;
	}

	:global(.edit-modal-body) {
		background-color: #1a1a1a;
		padding: 1.5rem;
	}

	/* Form Layout */
	.edit-form {
		width: 100%;
	}

	.form-section {
		background-color: rgba(255, 255, 255, 0.03);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.section-title {
		color: #4fc3f7;
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		text-align: center;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(79, 195, 247, 0.3);
	}

	.form-row {
		margin-bottom: 0;
	}

	.form-col {
		margin-bottom: 1rem;
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
		min-width: 110px;
		background-color: #0761c7;
		color: white;
		border: none;
		border-radius: 6px 0 0 6px;
		font-size: 0.85rem;
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
		font-size: 0.95rem;
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
		font-size: 0.85rem;
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

	/* Button Container */
	.button-container {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}

	:global(.action-button) {
		padding: 0.75rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		border-radius: 8px;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 120px;
	}

	:global(.update-button) {
		background-color: #0761c7;
		border-color: #0761c7;
	}

	:global(.update-button:hover) {
		background-color: #0550a3;
		border-color: #0550a3;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(7, 97, 199, 0.3);
	}

	:global(.cancel-button) {
		background-color: #6c757d;
		border-color: #6c757d;
	}

	:global(.cancel-button:hover) {
		background-color: #545b62;
		border-color: #545b62;
		transform: translateY(-1px);
	}

	:global(.delete-button) {
		background-color: #dc3545;
		border-color: #dc3545;
	}

	:global(.delete-button:hover) {
		background-color: #c82333;
		border-color: #c82333;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		:global(.edit-modal-body) {
			padding: 1rem;
		}

		.form-section {
			padding: 1rem;
			margin-bottom: 1rem;
		}

		.section-title {
			font-size: 1rem;
			margin-bottom: 0.75rem;
		}

		.form-col {
			margin-bottom: 0.75rem;
		}

		:global(.custom-label) {
			min-width: 90px;
			font-size: 0.8rem;
			padding: 0.625rem 0.75rem;
		}

		:global(.form-input) {
			font-size: 0.9rem;
			padding: 0.625rem 0.875rem;
		}

		.university-wrapper {
			padding: 0.625rem 0.875rem;
		}

		.radio-container {
			padding: 0.875rem;
		}

		.radio-options {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.button-container {
			flex-direction: column;
			align-items: center;
		}

		:global(.action-button) {
			width: 100%;
			max-width: 200px;
		}
	}

	@media (max-width: 576px) {
		.form-section {
			padding: 0.75rem;
		}

		:global(.custom-label) {
			min-width: 80px;
			font-size: 0.75rem;
		}

		:global(.form-input) {
			font-size: 0.85rem;
		}
	}
</style>
