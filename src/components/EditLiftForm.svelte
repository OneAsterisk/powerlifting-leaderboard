<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { deleteLift, updateLift } from '../dbFunctions';
    import { user } from '../stores/userStore';
    import { Form, FormGroup, Label, Input, Button, Modal, ModalHeader, ModalBody, InputGroup } from '@sveltestrap/sveltestrap';
    import type { Lift } from '../types';
	import UniversitySelector from './UniversitySelector.svelte';
    export let lift: Lift;
    export let open: boolean;
    let squat = lift.squat;
    let bench = lift.bench;
    let deadlift = lift.deadlift;
    let bodyWeight = lift.bodyWeight;
    let age = lift.age;
    let liftType = lift.liftType;
    let selectedUniversity = lift.selectedUniversity || '';
    let size;
    //let open = false;
    const toggle = () => {
    open = !open;
  };
    const dispatch = createEventDispatcher();
    const handleDelete = async (event: Event) =>{
        event.preventDefault();
        if ($user) {
            try {
                await deleteLift($user, lift.liftUID ? lift.liftUID: lift.liftID);
                dispatch('liftDeleted');
                toggle;
            } catch (error) {
                console.error('Error deleting lift:', error);
                alert('Error deleting lift. Please try again.');
            }
        }
    }
    const handleSubmit = async (event: Event) => {
        event.preventDefault();
        if ($user) {
            try {
                const updatedLift = {
                    squat,
                    bench,
                    deadlift,
                    bodyWeight,
                    age,
                    liftType,
                    selectedUniversity,
                    total: squat + bench + deadlift,
                };
                await updateLift($user, lift.liftUID ? lift.liftUID: lift.liftID, updatedLift);
                dispatch('liftUpdated');
            } catch (error) {
                console.error('Error updating lift:', error);
                alert('Error updating lift. Please try again.');
            }
        }
    };
</script>
<div id="editLiftForm">
    <Modal isOpen={open} class="editForm">
        <ModalHeader class="editForm">Edit Lift</ModalHeader>
        <ModalBody class="editForm">
    <Form on:submit={handleSubmit}>
        <FormGroup>
            <Label for="squat">Squat</Label>
            <Input type="number" id="squat" bind:value={squat} required />
        </FormGroup>
        <FormGroup>
            <Label for="bench">Bench</Label>
            <Input type="number" id="bench" bind:value={bench} required />
        </FormGroup>
        <FormGroup>
            <Label for="deadlift">Deadlift</Label>
            <Input type="number" id="deadlift" bind:value={deadlift} required />
        </FormGroup>
        <FormGroup>
            <Label for="bodyWeight">Body Weight</Label>
            <Input type="number" id="bodyWeight" bind:value={bodyWeight} required />
        </FormGroup>
        <FormGroup>
            <Label for="age">Age</Label>
            <Input type="number" id="age" bind:value={age} required />
        </FormGroup>
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
