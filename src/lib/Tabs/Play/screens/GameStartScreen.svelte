<!-- src/lib/tabs/play/screens/GameStartScreen.svelte -->
<script>
	import { fade, scale, fly } from 'svelte/transition';
	import { cache } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore.js';
	import CustomDifficultyPanel from './CustomDifficultyPanel.svelte';

	export let onStartGame;

	let showCustomPanel = false;
	let selectedDifficulty = null;

	// Reset selected difficulty when component mounts or cache changes
	$: if ($cache.diff === 'Null') {
		selectedDifficulty = null;
	}

	// Difficulty configurations
	const difficulties = [
		{
			id: 'ez',
			label: 'Easy',
			description: 'Basic arithmetic with small numbers',
			color: '#10b981',
			details: '5 HP • 45s intervals • +, -, ×',
			hp: 5,
			icon: '🟢'
		},
		{
			id: 'mid',
			label: 'Medium',
			description: 'More operations and larger numbers',
			color: '#f59e0b',
			details: '3 HP • 35s intervals • +, -, ×, ÷, %, ^',
			hp: 3,
			icon: '🟡'
		},
		{
			id: 'high',
			label: 'Hard',
			description: 'Complex operations and multi-step problems',
			color: '#ef4444',
			details: '1 HP • 25s intervals • All operations',
			hp: 1,
			icon: '🔴'
		}
	];

	function selectDifficulty(diffId) {
		selectedDifficulty = diffId;
		const selectedDiff = difficulties.find((d) => d.id === diffId);

		if (selectedDiff) {
			cache.update((n) => ({
				...n,
				diff: diffId,
				hp: selectedDiff.hp,
				score: 0,
				gameState: false,
				userInput: '',
				customConfig: null
			}));
		}

		// Auto-start for quick play after a short delay
		setTimeout(() => {
			if (selectedDifficulty === diffId && !showCustomPanel) {
				handleStartGame();
			}
		}, 500);
	}

	function openCustomPanel() {
		showCustomPanel = true;
	}

	function closeCustomPanel() {
		showCustomPanel = false;
	}

	function handleCustomApplied(customConfig) {
		selectedDifficulty = 'custom';
		cache.update((n) => ({
			...n,
			diff: 'custom',
			customConfig,
			hp: customConfig.healthBars,
			score: 0,
			gameState: false,
			userInput: ''
		}));
		showCustomPanel = false;

		// Start game after custom config is applied
		setTimeout(() => {
			handleStartGame();
		}, 300);
	}

	function handleStartGame() {
		if (selectedDifficulty && onStartGame) {
			onStartGame();
		}
	}

	// Keyboard shortcuts
	function handleKeydown(event) {
		if (showCustomPanel) return;

		if (event.key >= '1' && event.key <= '3') {
			const diffIndex = parseInt(event.key) - 1;
			if (difficulties[diffIndex]) {
				selectDifficulty(difficulties[diffIndex].id);
			}
		} else if (event.key === '4') {
			openCustomPanel();
		} else if (event.key === 'Enter' && selectedDifficulty) {
			handleStartGame();
		} else if (event.key === 'Escape' && showCustomPanel) {
			closeCustomPanel();
		}
	}

	// Touch/click handlers for mobile accessibility
	function handleDifficultyTouch(diffId) {
		// Add haptic feedback on supported devices
		if ('vibrate' in navigator) {
			navigator.vibrate(50);
		}
		selectDifficulty(diffId);

		console.log(diffId);
		console.log($cache.diff);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="start-screen"
	class:mobile={$viewport.isMobile}
	role="dialog"
	aria-labelledby="start-title"
	aria-modal="true"
>
	{#if !showCustomPanel}
		<div class="start-content" in:fade={{ duration: 400 }}>
			<!-- Header -->
			<header class="start-header">
				<h1 id="start-title" in:fly={{ y: -30, duration: 600, delay: 200 }}>
					Choose Your Challenge
				</h1>
				<p class="subtitle" in:fade={{ duration: 600, delay: 400 }}>
					Select difficulty to begin training your mental math skills
				</p>
			</header>

			<!-- Difficulty Grid -->
			<main class="difficulty-section">
				<div
					class="difficulty-grid"
					role="radiogroup"
					aria-labelledby="start-title"
					aria-describedby="keyboard-hint"
				>
					{#each difficulties as diff, index}
						<button
							class="difficulty-card {diff.id}"
							class:selected={selectedDifficulty === diff.id}
							on:click={() => handleDifficultyTouch(diff.id)}
							role="radio"
							aria-checked={selectedDifficulty === diff.id}
							aria-describedby="diff-{diff.id}-desc"
							in:scale={{
								delay: index * 150 + 600,
								duration: 400,
								start: 0.8
							}}
						>
							<div class="card-content">
								<div class="difficulty-header">
									<div class="difficulty-icon">{diff.icon}</div>
									<h2>{diff.label}</h2>
									<kbd class="shortcut-key">{index + 1}</kbd>
								</div>

								<p class="difficulty-description" id="diff-{diff.id}-desc">
									{diff.description}
								</p>

								<div class="difficulty-details">
									{diff.details}
								</div>

								<div class="difficulty-accent" style="background: {diff.color};"></div>
							</div>
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
						in:scale={{
							delay: 450 + 600,
							duration: 400,
							start: 0.8
						}}
					>
						<div class="card-content">
							<div class="difficulty-header">
								<div class="difficulty-icon">⚙️</div>
								<h2>Custom</h2>
								<kbd class="shortcut-key">4</kbd>
							</div>

							<p class="difficulty-description" id="diff-custom-desc">
								Create your own difficulty settings
							</p>

							<div class="difficulty-details">Advanced configuration</div>

							<div class="difficulty-accent custom-gradient"></div>
						</div>
					</button>
				</div>

				<!-- Action Buttons -->
				{#if selectedDifficulty && selectedDifficulty !== 'custom'}
					<div class="start-actions" in:fade={{ delay: 200, duration: 400 }}>
						<button
							class="start-btn {selectedDifficulty}"
							on:click={handleStartGame}
							aria-label="Start game with {difficulties.find((d) => d.id === selectedDifficulty)
								?.label} difficulty"
						>
							<span class="btn-text">Start Game</span>
							<kbd class="btn-shortcut">Enter</kbd>
						</button>
					</div>
				{/if}
			</main>

			<!-- Footer -->
			<footer class="start-footer">
				<div class="keyboard-hints" id="keyboard-hint">
					{#if !$viewport.isMobile}
						<span>💡 Use number keys 1-4 or click to select • Press Enter to start</span>
					{:else}
						<span>💡 Tap to select difficulty</span>
					{/if}
				</div>
			</footer>
		</div>
	{:else}
		<!-- Custom Difficulty Panel -->
		<div in:fade={{ duration: 300 }}>
			<CustomDifficultyPanel onClose={closeCustomPanel} onApply={handleCustomApplied} />
		</div>
	{/if}
</div>

<style>
	.start-screen {
		position: relative;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(10px);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.start-content {
		width: 100%;
		max-width: 900px;
		padding: clamp(1rem, 4vw, 2rem);
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 4vw, 2.5rem);
		height: 100dvh;
	}

	/* Header */
	.start-header {
		text-align: center;
	}

	#start-title {
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 700;
		margin-bottom: clamp(0.5rem, 2vw, 1rem);
		background: linear-gradient(135deg, #fff, #ccc);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		line-height: 1.2;
	}

	.subtitle {
		font-size: clamp(1rem, 3vw, 1.2rem);
		color: #ccc;
		opacity: 0.9;
		line-height: 1.4;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Difficulty Section */
	.difficulty-section {
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 4vw, 2rem);
	}

	.difficulty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: clamp(1rem, 3vw, 1.5rem);
		width: 100%;
	}

	.difficulty-card {
		background: rgba(255, 255, 255, 0.03);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		min-height: clamp(160px, 20vw, 200px);
		display: flex;
		flex-direction: column;
	}

	.difficulty-card:hover {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(clamp(-2px, -0.5vw, -4px));
		box-shadow: 0 clamp(4px, 2vw, 12px) clamp(16px, 4vw, 32px) rgba(0, 0, 0, 0.4);
	}

	.difficulty-card.selected {
		border-color: #fff;
		background: rgba(255, 255, 255, 0.12);
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

	.card-content {
		padding: clamp(1rem, 3vw, 1.5rem);
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 2;
	}

	.difficulty-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: clamp(0.75rem, 2vw, 1rem);
	}

	.difficulty-icon {
		font-size: clamp(1.5rem, 4vw, 2rem);
	}

	.difficulty-header h2 {
		font-size: clamp(1.2rem, 3vw, 1.5rem);
		font-weight: 600;
		color: #fff;
		margin: 0;
		flex: 1;
		text-align: center;
	}

	.shortcut-key {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		padding: clamp(0.25rem, 1vw, 0.4rem) clamp(0.4rem, 1.5vw, 0.6rem);
		font-size: clamp(0.8rem, 2vw, 0.9rem);
		color: #ccc;
		min-width: clamp(24px, 6vw, 32px);
		text-align: center;
	}

	.difficulty-description {
		color: #e0e0e0;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		margin-bottom: clamp(0.75rem, 2vw, 1rem);
		flex-grow: 1;
		line-height: 1.4;
	}

	.difficulty-details {
		color: #999;
		font-size: clamp(0.8rem, 2vw, 0.85rem);
		font-family: 'Courier New', monospace;
		margin-bottom: clamp(0.5rem, 2vw, 1rem);
	}

	.difficulty-accent {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		border-radius: 0 0 14px 14px;
	}

	.custom-gradient {
		background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444);
	}

	/* Start Actions */
	.start-actions {
		display: flex;
		justify-content: center;
	}

	.start-btn {
		background: transparent;
		border: 2px solid;
		border-radius: 12px;
		padding: clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 4vw, 2rem);
		font-size: clamp(1rem, 3vw, 1.2rem);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: clamp(0.5rem, 2vw, 1rem);
		color: #fff;
		min-width: clamp(140px, 30vw, 200px);
		justify-content: center;
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

	.btn-shortcut {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.8em;
		opacity: 0.8;
	}

	/* Footer */
	.start-footer {
		text-align: center;
	}

	.keyboard-hints {
		color: #666;
		font-size: clamp(0.8rem, 2.5vw, 0.9rem);
		font-style: italic;
	}

	/* Mobile Adjustments */
	.start-screen.mobile .difficulty-grid {
		grid-template-columns: 1fr;
		gap: clamp(0.75rem, 3vw, 1rem);
	}

	.start-screen.mobile .difficulty-card {
		min-height: clamp(120px, 25vw, 140px);
	}

	.start-screen.mobile .shortcut-key {
		display: none;
	}

	.start-screen.mobile .btn-shortcut {
		display: none;
	}

	/* Landscape Mobile */
	@media (max-height: 600px) and (orientation: landscape) {
		.start-content {
			padding: clamp(0.5rem, 2vw, 1rem);
			gap: clamp(1rem, 3vw, 1.5rem);
		}

		.difficulty-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}

		.difficulty-card {
			min-height: clamp(100px, 15vh, 120px);
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.start-screen {
			background: #000;
		}

		.difficulty-card {
			border-color: #fff;
			background: #000;
		}

		#start-title {
			color: #fff;
			background: none;
			-webkit-text-fill-color: #fff;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.difficulty-card,
		.start-btn {
			transition: none;
		}

		.difficulty-card:hover {
			transform: none;
		}

		.start-btn:hover {
			transform: none;
		}
	}

	/* Focus Styles for Accessibility */
	.difficulty-card:focus,
	.start-btn:focus {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	/* Touch Target Sizes for Mobile */
	@media (pointer: coarse) {
		.difficulty-card {
			min-height: 120px;
		}

		.start-btn {
			min-height: 48px;
		}
	}
</style>
