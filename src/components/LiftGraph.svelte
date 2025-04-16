<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import { weightUnit } from '../stores/weightUnitStore';
	import { getUserLiftsPersonal } from '../dbFunctions';
	export let userId: string;
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		return getUserLiftsPersonal(userId, (lifts) => {
			if (chart) chart.destroy();

			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: lifts.map((lift) => lift.formattedDate),
					datasets: [
						{
							label: 'Bench Press',
							data: lifts.map((lift) => lift.bench),
							backgroundColor: 'rgba(75, 192, 192, 0.2)',
							borderColor: 'rgba(75, 192, 192, 1)',
							borderWidth: 2
						},
						{
							label: 'Squat',
							data: lifts.map((lift) => lift.squat),
							backgroundColor: 'rgba(255, 99, 132, 0.2)',
							borderColor: 'rgba(255, 99, 132, 1)',
							borderWidth: 2
						},
						{
							label: 'Deadlift',
							data: lifts.map((lift) => lift.deadlift),
							backgroundColor: 'rgba(54, 162, 235, 0.2)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 2
						}
					]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							title: {
								display: true,
								text: `Weight (${$weightUnit})`
							}
						},
						x: {
							title: {
								display: true,
								text: 'Date'
							}
						}
					}
				}
			});
		});
	});
</script>

<div class="chart-container">
	<canvas bind:this={chartCanvas}></canvas>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 400px;
	}
</style>
