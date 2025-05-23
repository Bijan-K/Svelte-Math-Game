<!-- src/lib/aside/Components/DiffSelect.svelte -->
<script>
	import { cache, mobileMenuState, menuListIsClosed } from '$lib/stores.js';

	// This component now primarily displays current difficulty status
	// and allows changing when game is not active

	let hp_data = {
		ez: 5,
		mid: 3,
		high: 1
	};

	function handleDifficultyChange(diff) {
		// Only allow changing difficulty when game is not active
		if ($cache.gameState === false) {
			// Reset difficulty to allow re-selection in game start screen
			cache.update((n) => ({ ...n, diff: 'Null', hp: 0, score: 0 }));

			// Close mobile menu
			if (window.innerWidth <= 768) {
				document.querySelector('.prime-container').classList.toggle('mobile-slide');
				mobileMenuState.update((n) => !n);
				menuListIsClosed.update((n) => true);
				document.querySelector('.menu').classList.toggle('spin');
			}
		}
	}

	function getDifficultyDisplay(diff) {
		if (diff === 'Null' || !diff) return 'None Selected';
		if (diff === 'custom') return 'Custom';
		return diff.toUpperCase();
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

<div class="diff-container">
	<div class="current-difficulty">
		<div class="diff-label">Current Difficulty:</div>
		<div class="diff-value" style="color: {getDifficultyColor($cache.diff)}">
			{getDifficultyDisplay($cache.diff)}
		</div>
	</div>

	{#if !$cache.gameState && $cache.diff !== 'Null'}
		<div class="diff-actions">
			<button
				class="change-btn"
				on:click={() => handleDifficultyChange()}
				title="Change difficulty"
			>
				Change Difficulty
			</button>
		</div>
	{:else if $cache.gameState}
		<div class="game-status">
			<div class="status-text">Game in progress</div>
		</div>
	{:else}
		<div class="selection-hint">
			<div class="hint-text">Select difficulty in game area</div>
		</div>
	{/if}

	{#if $cache.diff !== 'Null' && $cache.diff !== 'custom'}
		<div class="diff-details">
			<div class="detail-item">
				<span class="detail-label">Health:</span>
				<span class="detail-value">{hp_data[$cache.diff]} HP</span>
			</div>
			<div class="detail-item">
				<span class="detail-label">Operations:</span>
				<span class="detail-value">
					{#if $cache.diff === 'ez'}
						+, -, ×
					{:else if $cache.diff === 'mid'}
						+, -, ×, ÷, %, ^
					{:else if $cache.diff === 'high'}
						All operations
					{/if}
				</span>
			</div>
		</div>
	{:else if $cache.diff === 'custom' && $cache.customConfig}
		<div class="diff-details">
			<div class="detail-item">
				<span class="detail-label">Health:</span>
				<span class="detail-value">{$cache.customConfig.healthBars} HP</span>
			</div>
			<div class="detail-item">
				<span class="detail-label">Interval:</span>
				<span class="detail-value">{$cache.customConfig.spawnInterval / 1000}s</span>
			</div>
			<div class="detail-item">
				<span class="detail-label">Operations:</span>
				<span class="detail-value">{$cache.customConfig.operations.length} types</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.diff-container {
		padding: 1rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #333;
		border-radius: 12px;
		margin: 1rem 0;
	}

	.current-difficulty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.diff-label {
		font-size: 0.9rem;
		color: #999;
		font-weight: 500;
	}

	.diff-value {
		font-size: 1.2rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.diff-actions {
		text-align: center;
		margin-bottom: 1rem;
	}

	.change-btn {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid #555;
		border-radius: 6px;
		color: #ccc;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 0.85rem;
	}

	.change-btn:hover {
		border-color: #777;
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
	}

	.game-status,
	.selection-hint {
		text-align: center;
		margin-bottom: 1rem;
	}

	.status-text,
	.hint-text {
		font-size: 0.85rem;
		color: #666;
		font-style: italic;
	}

	.diff-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #333;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
	}

	.detail-label {
		color: #999;
		font-weight: 500;
	}

	.detail-value {
		color: #e0e0e0;
		font-family: 'Courier New', monospace;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.diff-container {
			padding: 0.75rem;
			margin: 0.5rem 0;
		}

		.diff-value {
			font-size: 1rem;
		}

		.detail-item {
			font-size: 0.8rem;
		}
	}
</style>
