<!-- src/lib/Tabs/Play/GameStartScreen.svelte -->
<script>
	import { fade, scale } from 'svelte/transition';
	import { cache } from '$lib/stores.js';
	import CustomDifficultyPanel from './CustomDifficultyPanel.svelte';

	export let onStartGame;

	let showCustomPanel = false;
	let selectedDifficulty = $cache.diff !== 'Null' ? $cache.diff : null;

	const difficulties = [
		{
			id: 'ez',
			label: 'Easy',
			description: 'Basic arithmetic with small numbers',
			color: '#10b981',
			details: '5 HP • 45s intervals • +, -, ×'
		},
		{
			id: 'mid',
			label: 'Medium',
			description: 'More operations and larger numbers',
			color: '#f59e0b',
			details: '3 HP • 35s intervals • +, -, ×, ÷, %, ^'
		},
		{
			id: 'high',
			label: 'Hard',
			description: 'Complex operations and multi-step problems',
			color: '#ef4444',
			details: '1 HP • 25s intervals • All operations'
		}
	];

	function selectDifficulty(diffId) {
		selectedDifficulty = diffId;
		cache.update((n) => ({ ...n, diff: diffId }));

		// Auto-start for quick play
		if (diffId !== 'custom') {
			setTimeout(() => {
				if (selectedDifficulty === diffId) {
					handleStartGame();
				}
			}, 500);
		}
	}

	function openCustomPanel() {
		showCustomPanel = true;
	}

	function closeCustomPanel() {
		showCustomPanel = false;
	}

	function handleCustomApplied(customConfig) {
		selectedDifficulty = 'custom';
		cache.update((n) => ({ ...n, diff: 'custom', customConfig }));
		showCustomPanel = false;
		setTimeout(handleStartGame, 300);
	}

	function handleStartGame() {
		if (selectedDifficulty) {
			onStartGame();
		}
	}

	// Keyboard shortcuts
	function handleKeydown(event) {
		if (showCustomPanel) return;

		if (event.key >= '1' && event.key <= '3') {
			const diffIndex = parseInt(event.key) - 1;
			selectDifficulty(difficulties[diffIndex].id);
		} else if (event.key === '4') {
			openCustomPanel();
		} else if (event.key === 'Enter' && selectedDifficulty) {
			handleStartGame();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="start-screen" role="dialog" aria-labelledby="start-title">
	{#if !showCustomPanel}
		<div class="start-content" in:fade={{ duration: 300 }}>
			<h2 id="start-title">Choose Your Challenge</h2>
			<p class="subtitle">Select difficulty to begin training</p>

			<div class="difficulty-grid" role="radiogroup" aria-labelledby="start-title">
				{#each difficulties as diff, index}
					<button
						class="difficulty-card {diff.id}"
						class:selected={selectedDifficulty === diff.id}
						on:click={() => selectDifficulty(diff.id)}
						role="radio"
						aria-checked={selectedDifficulty === diff.id}
						aria-describedby="diff-{diff.id}-desc"
						in:scale={{ delay: index * 100, duration: 300 }}
					>
						<div class="difficulty-header">
							<h3>{diff.label}</h3>
							<kbd>{index + 1}</kbd>
						</div>
						<p class="difficulty-description" id="diff-{diff.id}-desc">
							{diff.description}
						</p>
						<div class="difficulty-details">
							{diff.details}
						</div>
						<div class="difficulty-color-bar" style="background: {diff.color};"></div>
					</button>
				{/each}

				<!-- Custom Difficulty Option -->
				<button
					class="difficulty-card custom"
					class:selected={selectedDifficulty === 'custom'}
					on:click={openCustomPanel}
					role="radio"
					aria-checked={selectedDifficulty === 'custom'}
					aria-describedby="diff-custom-desc"
					in:scale={{ delay: 300, duration: 300 }}
				>
					<div class="difficulty-header">
						<h3>Custom</h3>
						<kbd>4</kbd>
					</div>
					<p class="difficulty-description" id="diff-custom-desc">
						Create your own difficulty settings
					</p>
					<div class="difficulty-details">Advanced configuration</div>
					<div class="difficulty-color-bar custom-gradient"></div>
				</button>
			</div>

			{#if selectedDifficulty && selectedDifficulty !== 'custom'}
				<div class="start-actions" in:fade={{ delay: 200 }}>
					<button
						class="start-btn {selectedDifficulty}"
						on:click={handleStartGame}
						aria-label="Start game with {difficulties.find((d) => d.id === selectedDifficulty)
							?.label} difficulty"
					>
						<span>Start Game</span>
						<kbd>Enter</kbd>
					</button>
				</div>
			{/if}

			<div class="keyboard-hints">
				<span>Use number keys 1-4 or click to select</span>
			</div>
		</div>
	{:else}
		<CustomDifficultyPanel onClose={closeCustomPanel} onApply={handleCustomApplied} />
	{/if}
</div>

<style>
	.start-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(8px);
	}

	.start-content {
		text-align: center;
		padding: 2rem;
		max-width: 800px;
		width: 90%;
	}

	#start-title {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #fff;
		font-weight: 700;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #ccc;
		margin-bottom: 2rem;
		opacity: 0.8;
	}

	.difficulty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.difficulty-card {
		background: rgba(255, 255, 255, 0.03);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		position: relative;
		overflow: hidden;
		min-height: 160px;
		display: flex;
		flex-direction: column;
	}

	.difficulty-card:hover {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
	}

	.difficulty-card.selected {
		border-color: #fff;
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.02);
	}

	.difficulty-card.ez.selected {
		border-color: #10b981;
	}
	.difficulty-card.mid.selected {
		border-color: #f59e0b;
	}
	.difficulty-card.high.selected {
		border-color: #ef4444;
	}
	.difficulty-card.custom.selected {
		border-color: #8b5cf6;
	}

	.difficulty-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.difficulty-header h3 {
		font-size: 1.4rem;
		font-weight: 600;
		color: #fff;
		margin: 0;
	}

	.difficulty-header kbd {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		padding: 0.25rem 0.5rem;
		font-size: 0.9rem;
		color: #ccc;
		min-width: 24px;
		text-align: center;
	}

	.difficulty-description {
		color: #e0e0e0;
		font-size: 1rem;
		margin-bottom: 1rem;
		flex-grow: 1;
		line-height: 1.4;
	}

	.difficulty-details {
		color: #999;
		font-size: 0.85rem;
		margin-bottom: 1rem;
		font-family: 'Courier New', monospace;
	}

	.difficulty-color-bar {
		height: 4px;
		width: 100%;
		border-radius: 2px;
		position: absolute;
		bottom: 0;
		left: 0;
	}

	.custom-gradient {
		background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444);
	}

	.start-actions {
		margin-bottom: 1.5rem;
	}

	.start-btn {
		background: transparent;
		border: 2px solid;
		border-radius: 12px;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		color: #fff;
	}

	.start-btn.ez {
		border-color: #10b981;
	}
	.start-btn.mid {
		border-color: #f59e0b;
	}
	.start-btn.high {
		border-color: #ef4444;
	}

	.start-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
	}

	.start-btn.ez:hover {
		background: #10b981;
		color: #000;
	}
	.start-btn.mid:hover {
		background: #f59e0b;
		color: #000;
	}
	.start-btn.high:hover {
		background: #ef4444;
		color: #fff;
	}

	.keyboard-hints {
		color: #666;
		font-size: 0.9rem;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.start-content {
			padding: 1rem;
		}

		#start-title {
			font-size: 2rem;
		}

		.difficulty-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.difficulty-card {
			padding: 1rem;
			min-height: 120px;
		}

		.difficulty-header h3 {
			font-size: 1.2rem;
		}
	}
</style>
