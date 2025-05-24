<!-- src/lib/aside/PlayAside.svelte -->
<script>
	import { fade } from 'svelte/transition';
	import { cache } from '$lib/stores.js';
	import './style.css';

	// Show current game status and quick info
	$: currentDiff = $cache.diff !== 'Null' ? $cache.diff : null;
	$: isGameActive = $cache.gameState;
	$: currentScore = $cache.score;
	$: currentHealth = $cache.hp;

	function getDifficultyDisplay(diff) {
		if (diff === 'custom') return 'Custom';
		return diff ? diff.toUpperCase() : 'None';
	}

	function getDifficultyColor(diff) {
		switch (diff) {
			case 'ez':
				return '#10b981';
			case 'mid':
				return '#f59e0b';
			case 'high':
				return '#ef4444';
			case 'custom':
				return '#8b5cf6';
			default:
				return '#666';
		}
	}
</script>

<div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }} class="play-aside">
	<h2>Game Status</h2>

	<div class="status-section">
		<div class="status-item">
			<label>Difficulty</label>
			<div class="status-value difficulty" style="color: {getDifficultyColor(currentDiff)}">
				{getDifficultyDisplay(currentDiff)}
			</div>
		</div>

		{#if isGameActive}
			<div class="status-item">
				<label>Score</label>
				<div class="status-value score">{currentScore}</div>
			</div>

			<div class="status-item">
				<label>Health</label>
				<div class="status-value health">
					<div class="health-dots">
						{#each Array(5) as _, i}
							<div
								class="health-dot"
								class:active={i < currentHealth}
								style="background: {i < currentHealth ? getDifficultyColor(currentDiff) : '#333'}"
							></div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="status-item">
				<label>Status</label>
				<div class="status-value status">
					{currentDiff ? 'Ready to Start' : 'Select Difficulty'}
				</div>
			</div>
		{/if}
	</div>

	<div class="quick-tips">
		<h3>Quick Tips</h3>
		<ul>
			<li><kbd>Enter</kbd> - Start/Resume</li>
			<li><kbd>Space</kbd> - Pause</li>
			<li><kbd>Escape</kbd> - Quit</li>
			<li><kbd>1-4</kbd> - Select difficulty</li>
		</ul>
	</div>
</div>

<style>
	h2 {
		padding: 1rem;
		padding-top: 2rem;
		text-align: center;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.play-aside {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 0 1rem;
	}

	.status-section {
		width: 100%;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #333;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.status-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #333;
	}

	.status-item:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.status-item label {
		color: #999;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.status-value {
		font-weight: 600;
		font-family: 'Courier New', monospace;
	}

	.status-value.difficulty {
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-value.score {
		font-size: 1.2rem;
		color: #10b981;
	}

	.health-dots {
		display: flex;
		gap: 4px;
	}

	.health-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #333;
		transition: all 0.3s ease;
	}

	.health-dot.active {
		box-shadow: 0 0 6px currentColor;
	}

	.quick-tips {
		width: 100%;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #333;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.quick-tips h3 {
		color: #fff;
		font-size: 1rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.quick-tips ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.quick-tips li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		color: #ccc;
		font-size: 0.9rem;
		border-bottom: 1px solid #333;
	}

	.quick-tips li:last-child {
		border-bottom: none;
	}

	kbd {
		background: #333;
		border: 1px solid #555;
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.8em;
		color: #fff;
	}

	.help-text {
		text-align: center;
		color: #666;
		font-style: italic;
		padding: 1rem;
		border: 1px dashed #333;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.01);
	}

	.help-text p {
		margin: 0;
		line-height: 1.4;
	}

	@media (max-width: 768px) {
		.play-aside {
			padding: 0 0.5rem;
		}

		.status-section,
		.quick-tips {
			padding: 1rem;
		}

		h2 {
			font-size: 1.3rem;
		}
	}
</style>
