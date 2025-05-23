<!-- src/lib/tabs/stats/AnalyticsPanel.svelte -->
<script>
	export let stats;

	function formatNumber(num) {
		return new Intl.NumberFormat().format(num);
	}

	function getOperationSymbol(op) {
		const symbols = {
			'+': '➕',
			'-': '➖',
			'×': '✖️',
			'÷': '➗',
			'%': '📊',
			'^': '⬆️',
			'√': '√',
			unknown: '❓'
		};
		return symbols[op] || op;
	}
</script>

<div class="analytics-grid">
	<div class="stat-item primary">
		<div class="stat-value">{formatNumber(stats.totalScore)}</div>
		<div class="stat-label">Total Points</div>
	</div>

	<div class="stat-item">
		<div class="stat-value">{formatNumber(stats.totalMissed)}</div>
		<div class="stat-label">Total Misses</div>
	</div>

	<div class="stat-item">
		<div class="stat-value">{stats.uniqueProblems}</div>
		<div class="stat-label">Unique Problems</div>
	</div>

	<div class="stat-item">
		<div class="stat-value">{Math.round(stats.averageScore)}</div>
		<div class="stat-label">Avg Score</div>
	</div>

	{#if stats.mostMissedEquation}
		<div class="stat-item weakness">
			<div class="stat-value">{stats.mostMissedEquation.equation}</div>
			<div class="stat-label">Most Missed ({stats.mostMissedEquation.times}x)</div>
		</div>
	{/if}

	<div class="stat-item recent">
		<div class="stat-value">{stats.recentMisses}</div>
		<div class="stat-label">Recent Misses (7d)</div>
	</div>
</div>

{#if stats.operationRanking.length > 0}
	<div class="operation-ranking">
		<h3>Challenging Operations</h3>
		<div class="operation-list">
			{#each stats.operationRanking as [op, count], index}
				<div class="operation-item" class:top={index === 0}>
					<span class="operation-symbol">{getOperationSymbol(op)}</span>
					<span class="operation-name">{op}</span>
					<span class="operation-count">{count}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.analytics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		padding: 1rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		text-align: center;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
	}

	.stat-item:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-1px);
	}

	.stat-item.primary {
		background: #222;
		border: 2px solid #fff;
		color: white;
		grid-column: span 2;
	}

	.stat-item.weakness {
		background: #333;
		border: 2px solid #999;
		color: white;
		grid-column: span 2;
	}

	.stat-item.recent {
		background: #1a1a1a;
		border: 2px solid #666;
		color: white;
	}

	.stat-value {
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		font-family: 'Courier New', monospace;
	}

	.stat-label {
		font-size: 0.85rem;
		opacity: 0.8;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.operation-ranking {
		margin-top: 1rem;
	}

	.operation-ranking h3 {
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
		color: #f0f0f0;
		font-weight: 600;
	}

	.operation-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.operation-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
	}

	.operation-item:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.operation-item.top {
		background: #fff;
		color: #000;
		font-weight: 600;
		border: 2px solid #000;
	}

	.operation-symbol {
		font-size: 1.2rem;
		margin-right: 0.5rem;
	}

	.operation-name {
		flex: 1;
		text-align: left;
		font-weight: 500;
	}

	.operation-count {
		background: rgba(0, 0, 0, 0.2);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 600;
		min-width: 2rem;
		text-align: center;
	}

	.operation-item.top .operation-count {
		background: rgba(0, 0, 0, 0.3);
		color: #000;
	}

	@media (max-width: 768px) {
		.analytics-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.stat-item.primary,
		.stat-item.weakness {
			grid-column: span 1;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.operation-item {
			padding: 0.5rem;
		}
	}
</style>
