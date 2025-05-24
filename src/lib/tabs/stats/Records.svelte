<!-- src/lib/tabs/stats/Records.svelte -->
<script>
	import { record } from '$lib/stores.js';
</script>

<div class="records-container">
	{#each $record as diff (diff)}
		<div class="record-card {diff.diff}">
			<div class="record-header">
				<h3 class="difficulty-label">{diff.diff.toUpperCase()}</h3>
			</div>

			<div class="record-content">
				<div class="score-section">
					<div class="score-value">{diff.count}</div>
					<div class="score-label">Best Score</div>
				</div>

				<div class="date-section">
					<div class="date-value">{diff.date}</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.records-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	@media (max-width: 768px) {
		.records-container {
			gap: 0.75rem;
		}
	}

	.record-card {
		background: #1a1a1a;
		border: 2px solid #333;
		border-radius: 16px;
		padding: 1.25rem;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.record-card:hover {
		transform: translateY(-2px);
		border-color: #555;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
	}

	.record-card.ez {
		border-left: 4px solid #666;
	}

	.record-card.mid {
		border-left: 4px solid #999;
	}

	.record-card.high {
		border-left: 4px solid #fff;
	}

	.record-header {
		margin-bottom: 1rem;
	}

	.difficulty-label {
		font-size: 1.1rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-family: 'Courier New', monospace;
	}

	.record-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.score-section {
		flex: 1;
	}

	.score-value {
		font-size: 2.5rem;
		font-weight: 900;
		color: #fff;
		line-height: 1;
		margin-bottom: 0.25rem;
		font-family: 'Courier New', monospace;
	}

	.score-label {
		font-size: 0.85rem;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.date-section {
		text-align: right;
		flex-shrink: 0;
	}

	.date-value {
		font-size: 0.9rem;
		color: #ccc;
		font-weight: 500;
		line-height: 1.3;
		max-width: 120px;
		word-wrap: break-word;
	}

	/* Special styling for no records */
	.record-card .score-value:contains('0') {
		color: #666;
	}

	/* Animation for hover effect */
	.record-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
		z-index: 1;
	}

	.record-card:hover::before {
		left: 100%;
	}

	.record-content {
		position: relative;
		z-index: 2;
	}

	@media (max-width: 768px) {
		.record-card {
			padding: 1rem;
			border-radius: 12px;
		}

		.score-value {
			font-size: 2rem;
		}

		.difficulty-label {
			font-size: 1rem;
		}

		.record-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.date-section {
			text-align: left;
			width: 100%;
		}

		.date-value {
			max-width: none;
		}
	}
</style>
