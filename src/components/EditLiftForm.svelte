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
		InputGroup
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
				await deleteLift($user, lift.liftUID ? lift.liftUID : lift.liftID);
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
                const lbsSquat = Number($weightUnit === 'kg' ? convertToLbs(displaySquat, 'kg') : displaySquat);
            	const lbsBench = Number($weightUnit === 'kg' ? convertToLbs(displayBench, 'kg') : displayBench);
            	const lbsDeadlift = Number($weightUnit === 'kg' ? convertToLbs(displayDeadlift, 'kg') : displayDeadlift);
            	const lbsBodyWeight = Number($weightUnit === 'kg' ? convertToLbs(displayBodyWeight, 'kg') : displayBodyWeight);

                const updatedLift = {
                    squat: lbsSquat,
                    bench: lbsBench,
                    deadlift: lbsDeadlift,
                    bodyWeight: lbsBodyWeight,
                    age,
                    liftType,
                    selectedUniversity,
                    total: lbsSquat + lbsBench + lbsDeadlift
                };
                await updateLift($user, lift.liftUID ? lift.liftUID : lift.liftID, updatedLift);
                dispatch('liftUpdated');
                toggle();
            } catch (error) {
                console.error('Error updating lift:', error);
                alert('Error updating lift. Please try again.');
            }
        }
    };
 
</script>

<div id="editLiftForm">
	<Modal isOpen={open} class="editForm">
		<ModalHeader class="editForm">Edit Lift ({$weightUnit})</ModalHeader>
		<ModalBody class="editForm">
            <Form on:submit={handleSubmit}>
				<FormGroup>
					<Label for="squat">Squat ({$weightUnit})</Label>
					<Input type="text" id="squat" bind:value={displaySquat} pattern="^\d+(\.\d)?$" required />
				</FormGroup>
				<FormGroup>
					<Label for="bench">Bench ({$weightUnit})</Label>
					<Input type="text" id="bench" bind:value={displayBench} pattern="^\d+(\.\d)?$" required />
				</FormGroup>
				<FormGroup>
					<Label for="deadlift">Deadlift ({$weightUnit})</Label>
					<Input type="text" id="deadlift" bind:value={displayDeadlift} pattern="^\d+(\.\d)?$" required />
				</FormGroup>
				<FormGroup>
					<Label for="bodyWeight">Body Weight ({$weightUnit})</Label>
					<Input type="text" id="bodyWeight" bind:value={displayBodyWeight} pattern="^\d+(\.\d)?$" required />
				</FormGroup>
                <FormGroup>
					<Label for="age">Age</Label>					
					<Input type="number" id="age" bind:value={age} required />
				</FormGroup>
				<FormGroup class="radio-container">
					<InputGroup>
						{#each ['Comp Lift', 'Gym Lift'] as value}
							<div style={'margin: 0 30px;'}>
								<Input type="radio" theme="light" bind:group={liftType} {value} label={value} />
							</div>
						{/each}
					</InputGroup>
				</FormGroup>
				<FormGroup>
					<UniversitySelector bind:selectedUniversity />
				</FormGroup>
				<Button type="submit" color="primary">Update Lift</Button>
				<Button type="button" on:click={toggle} color="secondary">Cancel</Button>
				<Button type="button" on:click={handleDelete} color="danger">Delete</Button>
			</Form>
		</ModalBody>
	</Modal>
</div>

<style>
	:global(.modal-header, .modal-body, .modal-footer) {
		background-color: #2c2c2c;
		border-color: #444343;
	}
</style>
