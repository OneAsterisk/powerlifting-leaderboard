<script lang="ts">
	import { Button, ButtonGroup } from '@sveltestrap/sveltestrap';
	import { weightUnit } from '../stores/weightUnitStore';
</script>

<ButtonGroup size="sm" class="me-2">
	<Button
		size="sm"
		color={$weightUnit === 'lbs' ? 'primary' : 'secondary'}
		on:click={() => weightUnit.set('lbs')}
	>
		LBS
	</Button>
	<Button
		size="sm"
		color={$weightUnit === 'kg' ? 'primary' : 'secondary'}
		on:click={() => weightUnit.set('kg')}
	>
		KG
	</Button>
</ButtonGroup>
