<!-- src/lib/Tabs/Stats/PerformanceChart.svelte -->
<script>
	export let stats;

	$: chartData = prepareChartData(stats);

	function prepareChartData(stats) {
		if (!stats) return null;

		const total =
			stats.difficultyStats.easy + stats.difficultyStats.medium + stats.difficultyStats.hard;
		if (total === 0) return null;

		return [
			{
				label: 'Easy',
				value: stats.difficultyStats.easy,
				percentage: Math.round((stats.difficultyStats.easy / total) * 100),
				color: '#666'
			},
			{
				label: 'Medium',
				value: stats.difficultyStats.medium,
				percentage: Math.round((stats.difficultyStats.medium / total) * 100),
				color: '#999'
			},
			{
				label: 'Hard',
				value: stats.difficultyStats.hard,
				percentage: Math.round((stats.difficultyStats.hard / total) * 100),
				color: '#fff'
			}
		];
	}
</script>

{#if chartData}
	<div class="chart-container">
		<div class="chart-bars">
			{#each chartData as item}
				<div class="bar-container">
					<div class="bar-label">{item.label}</div>
					<div class="bar-wrapper">
						<div
							class="bar"
							style="height: {item.percentage}%; background-color: {item.color};"
						></div>
					</div>
					<div class="bar-stats">
						<div class="bar-value">{item.value}</div>
						<div class="bar-percentage">{item.percentage}%</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="legend">
			{#each chartData as item}
				<div class="legend-item">
					<div class="legend-color" style="background-color: {item.color};"></div>
					<span>{item.label}: {item.value} misses</span>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="no-data">
		<div class="no-data-icon">📊</div>
		<p>No performance data yet</p>
		<p class="no-data-subtitle">Start playing to see your difficulty distribution</p>
	</div>
{/if}

<style>
	.chart-container {
		display: flex;
		flex-direction: column;
		height: 200px;
	}

	.chart-bars {
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		height: 120px;
		margin-bottom: 1rem;
		padding: 0 1rem;
	}

	.bar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		max-width: 80px;
	}

	.bar-label {
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #e0e0e0;
	}

	.bar-wrapper {
		width: 40px;
		height: 80px;
		display: flex;
		align-items: flex-end;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		margin-bottom: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.bar {
		width: 100%;
		border-radius: 4px 4px 0 0;
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		animation: growUp 1s ease-out;
		min-height: 4px;
	}

	@keyframes growUp {
		from {
			height: 0%;
		}
		to {
			height: var(--final-height);
		}
	}

	.bar-stats {
		text-align: center;
	}

	.bar-value {
		font-size: 1rem;
		font-weight: 700;
		color: #f0f0f0;
		font-family: 'Courier New', monospace;
	}

	.bar-percentage {
		font-size: 0.75rem;
		color: #a0a0a0;
		margin-top: 0.25rem;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #e0e0e0;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.no-data {
		text-align: center;
		padding: 2rem;
		color: #a0a0a0;
	}

	.no-data-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.no-data p {
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.no-data-subtitle {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.chart-container {
			height: 180px;
		}

		.chart-bars {
			height: 100px;
		}

		.bar-wrapper {
			height: 60px;
			width: 30px;
		}

		.legend {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
