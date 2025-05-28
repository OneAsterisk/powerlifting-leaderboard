<script lang="ts">
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { Chart, registerables } from 'chart.js/auto';
	import { weightUnit } from '../stores/weightUnitStore';
	import { getUserLiftsPersonal } from '../dbFunctions';
	import { convertWeight } from '../helpers';
	import { Button, ButtonGroup } from '@sveltestrap/sveltestrap';

	export let userId: string;

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;
	let lifts: any[] = [];
	let unsubscribe: (() => void) | undefined;
	let loading = true;
	let error = false;
	let needsChartUpdate = false;

	// Chart configuration options
	let chartType: 'line' | 'bar' = 'line';
	let showDots = false;
	let timeRange: 'all' | '6months' | '1year' = 'all';

	// Individual lift visibility controls
	let showSquat = true;
	let showBench = true;
	let showDeadlift = true;
	let showTotalLift = true;

	// Color scheme matching your dark theme
	const colors = {
		squat: {
			border: '#ff6b6b', // Red for squat
			background: 'rgba(255, 107, 107, 0.1)'
		},
		bench: {
			border: '#4dabf7', // Blue for bench
			background: 'rgba(77, 171, 247, 0.1)'
		},
		deadlift: {
			border: '#69db7c', // Green for deadlift
			background: 'rgba(105, 219, 124, 0.1)'
		},
		total: {
			border: '#ffd43b', // Yellow for total
			background: 'rgba(255, 212, 59, 0.1)'
		},
		dots: {
			border: '#da77f2', // Purple for DOTS
			background: 'rgba(218, 119, 242, 0.1)'
		}
	};

	Chart.register(...registerables);

	onMount(() => {
		unsubscribe = getUserLiftsPersonal(userId, (fetchedLifts) => {
			lifts = fetchedLifts.sort(
				(a, b) =>
					new Date(a.timestamp?.toDate()).getTime() - new Date(b.timestamp?.toDate()).getTime()
			);
			loading = false;
			error = lifts.length === 0;
			needsChartUpdate = true;
		});
	});

	afterUpdate(() => {
		if (needsChartUpdate && chartCanvas && lifts.length > 0) {
			console.log('LiftGraph: Creating chart with', lifts.length, 'lifts');
			needsChartUpdate = false;
			updateChart();
		}
	});

	onDestroy(() => {
		if (chart) chart.destroy();
		if (unsubscribe) unsubscribe();
	});

	function filterLiftsByTimeRange(lifts: any[]) {
		if (timeRange === 'all') return lifts;

		const now = new Date();
		const cutoffDate = new Date();

		if (timeRange === '6months') {
			cutoffDate.setMonth(now.getMonth() - 6);
		} else if (timeRange === '1year') {
			cutoffDate.setFullYear(now.getFullYear() - 1);
		}

		return lifts.filter((lift) => {
			const liftDate = new Date(lift.timestamp?.toDate());
			return liftDate >= cutoffDate;
		});
	}

	function updateChart() {
		if (!chartCanvas || lifts.length === 0) {
			console.log('LiftGraph: Cannot create chart - canvas or lifts missing');
			return;
		}

		if (chart) chart.destroy();

		const filteredLifts = filterLiftsByTimeRange(lifts);

		const datasets = [];

		// Individual lifts
		if (showSquat) {
			datasets.push({
				label: 'Squat',
				data: filteredLifts.map((lift) => convertWeight(lift.squat, $weightUnit)),
				borderColor: colors.squat.border,
				backgroundColor: colors.squat.background,
				borderWidth: 3,
				fill: chartType === 'line' ? false : true,
				tension: 0.4,
				pointRadius: 5,
				pointHoverRadius: 8,
				pointBackgroundColor: colors.squat.border,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2
			});
		}

		if (showBench) {
			datasets.push({
				label: 'Bench Press',
				data: filteredLifts.map((lift) => convertWeight(lift.bench, $weightUnit)),
				borderColor: colors.bench.border,
				backgroundColor: colors.bench.background,
				borderWidth: 3,
				fill: chartType === 'line' ? false : true,
				tension: 0.4,
				pointRadius: 5,
				pointHoverRadius: 8,
				pointBackgroundColor: colors.bench.border,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2
			});
		}

		if (showDeadlift) {
			datasets.push({
				label: 'Deadlift',
				data: filteredLifts.map((lift) => convertWeight(lift.deadlift, $weightUnit)),
				borderColor: colors.deadlift.border,
				backgroundColor: colors.deadlift.background,
				borderWidth: 3,
				fill: chartType === 'line' ? false : true,
				tension: 0.4,
				pointRadius: 5,
				pointHoverRadius: 8,
				pointBackgroundColor: colors.deadlift.border,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2
			});
		}

		if (showTotalLift) {
			datasets.push({
				label: 'Total',
				data: filteredLifts.map((lift) => convertWeight(lift.total, $weightUnit)),
				borderColor: colors.total.border,
				backgroundColor: colors.total.background,
				borderWidth: 4,
				fill: false,
				tension: 0.4,
				pointRadius: 6,
				pointHoverRadius: 10,
				pointBackgroundColor: colors.total.border,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2,
				borderDash: [5, 5] // Dashed line for total
			});
		}

		// DOTS Score (separate Y-axis)
		if (showDots) {
			datasets.push({
				label: 'DOTS Score',
				data: filteredLifts.map((lift) => lift.dotsScore),
				borderColor: colors.dots.border,
				backgroundColor: colors.dots.background,
				borderWidth: 3,
				fill: false,
				tension: 0.4,
				pointRadius: 5,
				pointHoverRadius: 8,
				pointBackgroundColor: colors.dots.border,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2,
				yAxisID: 'y1'
			});
		}

		console.log('LiftGraph: Chart created successfully with', datasets.length, 'datasets');

		chart = new Chart(chartCanvas, {
			type: chartType,
			data: {
				labels: filteredLifts.map((lift) => lift.formattedDate),
				datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					title: {
						display: true,
						text: 'Lift Progression Over Time',
						color: '#ffffff',
						font: {
							size: 18,
							weight: 'bold'
						},
						padding: 20
					},
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: '#ffffff',
							usePointStyle: true,
							padding: 20,
							font: {
								size: 12
							}
						}
					},
					tooltip: {
						backgroundColor: 'rgba(44, 44, 44, 0.95)',
						titleColor: '#ffffff',
						bodyColor: '#ffffff',
						borderColor: '#666666',
						borderWidth: 1,
						cornerRadius: 8,
						displayColors: true,
						callbacks: {
							title: function (context) {
								return `Date: ${context[0].label}`;
							},
							label: function (context) {
								const label = context.dataset.label || '';
								const value = context.parsed.y;
								if (label === 'DOTS Score') {
									return `${label}: ${value.toFixed(1)}`;
								}
								return `${label}: ${value} ${$weightUnit}`;
							},
							afterBody: function (context) {
								const dataIndex = context[0].dataIndex;
								const lift = filteredLifts[dataIndex];
								return [
									`Lift Type: ${lift.liftType}`,
									`Body Weight: ${convertWeight(lift.bodyWeight, $weightUnit)} ${$weightUnit}`,
									`Age: ${lift.age}`
								];
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Date',
							color: '#ffffff',
							font: {
								size: 14,
								weight: 'bold'
							}
						},
						ticks: {
							color: '#b3b3b3',
							maxTicksLimit: 8
						},
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						}
					},
					y: {
						title: {
							display: true,
							text: `Weight (${$weightUnit})`,
							color: '#ffffff',
							font: {
								size: 14,
								weight: 'bold'
							}
						},
						ticks: {
							color: '#b3b3b3',
							callback: function (value) {
								return value + ' ' + $weightUnit;
							}
						},
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						beginAtZero: false
					},
					...(showDots && {
						y1: {
							type: 'linear',
							display: true,
							position: 'right',
							title: {
								display: true,
								text: 'DOTS Score',
								color: colors.dots.border,
								font: {
									size: 14,
									weight: 'bold'
								}
							},
							ticks: {
								color: colors.dots.border
							},
							grid: {
								drawOnChartArea: false
							}
						}
					})
				}
			}
		});
	}

	// Reactive updates
	$: if (chart && lifts.length > 0) {
		needsChartUpdate = true;
	}

	function toggleChartType() {
		chartType = chartType === 'line' ? 'bar' : 'line';
		needsChartUpdate = true;
	}

	function toggleDots() {
		showDots = !showDots;
		needsChartUpdate = true;
	}

	function toggleSquat() {
		showSquat = !showSquat;
		needsChartUpdate = true;
	}

	function toggleBench() {
		showBench = !showBench;
		needsChartUpdate = true;
	}

	function toggleDeadlift() {
		showDeadlift = !showDeadlift;
		needsChartUpdate = true;
	}

	function toggleTotalLift() {
		showTotalLift = !showTotalLift;
		needsChartUpdate = true;
	}

	function setTimeRange(range: 'all' | '6months' | '1year') {
		timeRange = range;
		needsChartUpdate = true;
	}
</script>

<div class="graph-container">
	<div class="graph-header">
		<h3>Lift Progress</h3>
		<div class="graph-controls">
			<ButtonGroup size="sm">
				<Button
					color={timeRange === 'all' ? 'primary' : 'secondary'}
					size="sm"
					on:click={() => setTimeRange('all')}
				>
					All Time
				</Button>
				<Button
					color={timeRange === '1year' ? 'primary' : 'secondary'}
					size="sm"
					on:click={() => setTimeRange('1year')}
				>
					1 Year
				</Button>
				<Button
					color={timeRange === '6months' ? 'primary' : 'secondary'}
					size="sm"
					on:click={() => setTimeRange('6months')}
				>
					6 Months
				</Button>
			</ButtonGroup>

			<ButtonGroup size="sm">
				<Button
					color={chartType === 'line' ? 'primary' : 'secondary'}
					size="sm"
					on:click={toggleChartType}
				>
					{chartType === 'line' ? 'Line' : 'Bar'}
				</Button>
				<Button color={showDots ? 'primary' : 'secondary'} size="sm" on:click={toggleDots}>
					DOTS
				</Button>
			</ButtonGroup>

			<div class="lift-controls">
				<span class="control-label">Show Lifts:</span>
				<ButtonGroup size="sm">
					<Button
						color={showSquat ? 'danger' : 'secondary'}
						size="sm"
						on:click={toggleSquat}
						style="border-color: {colors.squat.border}; {showSquat
							? `background-color: ${colors.squat.border}; color: white;`
							: ''}"
					>
						Squat
					</Button>
					<Button
						color={showBench ? 'primary' : 'secondary'}
						size="sm"
						on:click={toggleBench}
						style="border-color: {colors.bench.border}; {showBench
							? `background-color: ${colors.bench.border}; color: white;`
							: ''}"
					>
						Bench
					</Button>
					<Button
						color={showDeadlift ? 'success' : 'secondary'}
						size="sm"
						on:click={toggleDeadlift}
						style="border-color: {colors.deadlift.border}; {showDeadlift
							? `background-color: ${colors.deadlift.border}; color: white;`
							: ''}"
					>
						Deadlift
					</Button>
					<Button
						color={showTotalLift ? 'warning' : 'secondary'}
						size="sm"
						on:click={toggleTotalLift}
						style="border-color: {colors.total.border}; {showTotalLift
							? `background-color: ${colors.total.border}; color: black;`
							: ''}"
					>
						Total
					</Button>
				</ButtonGroup>
			</div>
		</div>
	</div>

	<div class="chart-wrapper">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading your lift data...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<p>No lift data available yet.</p>
				<p>Submit some lifts to see your progress!</p>
			</div>
		{:else}
			<canvas bind:this={chartCanvas}></canvas>
		{/if}
	</div>
</div>

<style>
	.graph-container {
		background-color: #2a2a2e;
		border-radius: 12px;
		padding: 1.5rem;
		margin: 1rem 0;
		border: 1px solid #444;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.graph-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.graph-header h3 {
		color: #ffffff;
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.graph-controls {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.lift-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.control-label {
		color: #b3b3b3;
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.chart-wrapper {
		position: relative;
		height: 500px;
		width: 100%;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #b3b3b3;
		text-align: center;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #333;
		border-top: 4px solid #4dabf7;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error-state p {
		margin: 0.5rem 0;
		font-size: 1.1rem;
	}

	.error-state p:first-child {
		font-weight: 600;
		color: #ff6b6b;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.graph-container {
			padding: 1rem;
		}

		.graph-header {
			flex-direction: column;
			align-items: stretch;
		}

		.graph-controls {
			justify-content: center;
			flex-direction: column;
			gap: 0.75rem;
		}

		.lift-controls {
			justify-content: center;
		}

		.control-label {
			text-align: center;
			width: 100%;
		}

		.chart-wrapper {
			height: 400px;
		}

		.graph-header h3 {
			text-align: center;
			font-size: 1.3rem;
		}
	}

	@media (max-width: 480px) {
		.graph-controls {
			flex-direction: column;
		}

		.lift-controls .btn-group {
			flex-wrap: wrap;
		}

		.chart-wrapper {
			height: 350px;
		}
	}

	/* Custom button styling to match your theme */
	:global(.graph-controls .btn-group .btn) {
		border-color: #444 !important;
	}

	:global(.graph-controls .btn-primary) {
		background-color: #4dabf7 !important;
		border-color: #4dabf7 !important;
	}

	:global(.graph-controls .btn-secondary) {
		background-color: #444 !important;
		border-color: #444 !important;
		color: #b3b3b3 !important;
	}

	:global(.graph-controls .btn-secondary:hover) {
		background-color: #555 !important;
		border-color: #555 !important;
		color: #ffffff !important;
	}
</style>
