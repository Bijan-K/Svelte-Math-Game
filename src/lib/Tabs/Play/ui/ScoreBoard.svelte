<!-- src/lib/tabs/play/ui/ScoreBoard.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore';
	import { scale } from 'svelte/transition';
	import { score, health, maxHealth, isGameActive } from '$lib/stores/gameStore.js';
	import { inputStateMachine } from '../input/InputStateMachine.js';

	// Props for game control
	export let isGamePaused = true;
	export let onPause = () => {};
	export let onResume = () => {};
	export let onQuit = () => {};
	export let onProcessInput = () => {};
	export let showInput = true;

	// Get game state from stores
	$: currentScore = $score;
	$: currentHealth = $health;
	$: currentMaxHealth = $maxHealth;
	$: gameActive = $isGameActive;

	// Input state from state machine
	let inputState = inputStateMachine.getState();
	let unsubscribeInput = null;

	// Input element reference for desktop focus management
	let inputElement;

	// Difficulty-based styling
	$: difficultyTheme = getDifficultyTheme($cache.diff);

	// Determine what to show in the display
	$: showInputField =
		gameActive && !isGamePaused && !$viewport.isMobile && inputState.mode === 'desktop';
	$: displayText = getDisplayText($cache.diff, gameActive, inputState.input, currentScore);

	onMount(() => {
		// Subscribe to input state machine
		unsubscribeInput = inputStateMachine.subscribe((state) => {
			inputState = state;
		});
	});

	onDestroy(() => {
		if (unsubscribeInput) {
			unsubscribeInput();
		}
	});

	function getDifficultyTheme(diff) {
		const themes = {
			ez: { primary: '#10b981', secondary: '#065f46', accent: '#34d399' },
			mid: { primary: '#f59e0b', secondary: '#92400e', accent: '#fbbf24' },
			high: { primary: '#ef4444', secondary: '#991b1b', accent: '#f87171' },
			custom: { primary: '#8b5cf6', secondary: '#5b21b6', accent: '#a78bfa' },
			Null: { primary: '#666', secondary: '#333', accent: '#999' }
		};
		return themes[diff] || themes.Null;
	}

	function handlePauseClick() {
		if (isGamePaused) {
			onResume();
		} else {
			onPause();
		}
	}

	// Handle input changes - route through input state machine
	function handleInputChange(event) {
		const value = event.target.value;
		inputStateMachine.updateInput(value, 'mobile-input');
	}

	// Handle input submission - route through input state machine
	function handleInputSubmit(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			inputStateMachine.processInput();
		}
	}

	// Focus input when game becomes active (desktop only)
	$: if (
		gameActive &&
		!isGamePaused &&
		inputElement &&
		!$viewport.isMobile &&
		inputState.mode === 'desktop'
	) {
		setTimeout(() => {
			inputElement.focus();
		}, 100);
	}

	function getDisplayText(diff, gameActive, userInput, score) {
		if (!gameActive) {
			return diff !== 'Null' ? `READY: ${diff.toUpperCase()}` : 'SELECT MODE';
		}
		// Show score when no input, or when on mobile (input shown separately)
		if ($viewport.isMobile || (!userInput && !isGamePaused)) {
			return `SCORE: ${score}`;
		}
		return ''; // Input field will be shown instead
	}
</script>

<div
	class="scoreboard"
	style="--primary-color: {difficultyTheme.primary}; --secondary-color: {difficultyTheme.secondary}; --accent-color: {difficultyTheme.accent}"
>
	<div class="scoreboard-content">
		<!-- Health Bars -->
		{#if gameActive}
			<div
				class="health-container"
				role="status"
				aria-label="Health: {currentHealth} of {currentMaxHealth}"
			>
				{#each Array(currentMaxHealth) as _, i}
					<div
						class="health-bar"
						class:active={i < currentHealth}
						in:scale={{ duration: 200, delay: i * 50 }}
					></div>
				{/each}
			</div>
		{/if}

		<!-- Central Display -->
		<div class="central-display">
			{#if showInputField}
				<!-- Desktop Input Field - controlled by InputStateMachine -->
				<input
					bind:this={inputElement}
					type="text"
					inputmode="numeric"
					pattern="-?\d*"
					value={inputState.input}
					on:input={handleInputChange}
					on:keydown={handleInputSubmit}
					class="game-input"
					class:processing={inputState.isProcessing}
					placeholder="Enter answer..."
					autocomplete="off"
					aria-label="Math answer input"
					disabled={inputState.isProcessing}
				/>
			{:else}
				<!-- Score/Status Display -->
				<div class="display-text" class:active={gameActive}>
					{displayText}
				</div>
			{/if}
		</div>

		<!-- Game Controls -->
		<div class="controls-container">
			{#if gameActive}
				<button
					class="control-btn pause-btn"
					class:paused={isGamePaused}
					on:click={handlePauseClick}
					aria-label={isGamePaused ? 'Resume' : 'Pause'}
				>
					{#if isGamePaused}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					{:else}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
						</svg>
					{/if}
				</button>

				<button class="control-btn quit-btn" on:click={onQuit} aria-label="Quit">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Input State Indicator (development only) -->
	{#if false}
		<div class="input-state-indicator">
			<div>Mode: {inputState.mode}</div>
			<div>Input: "{inputState.input}"</div>
			<div>Source: {inputState.inputSource || 'none'}</div>
			<div>Can Process: {inputState.canProcess ? 'Yes' : 'No'}</div>
		</div>
	{/if}
</div>

<style>
	.scoreboard {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.95);
		border-top: 2px solid var(--primary-color);
		display: flex;
		align-items: center;
		padding: 1rem;
		padding-top: 1rem;
		backdrop-filter: blur(10px);
		overflow: hidden;
		position: relative;
	}

	.scoreboard-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Health Bars */
	.health-container {
		display: flex;
		gap: 4px;
		align-items: center;
		flex-shrink: 0;
	}

	.health-bar {
		width: 16px;
		height: 40px;
		background: #333;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		transform: skew(-15deg);
		transition: all 0.3s ease;
		opacity: 0.3;
	}

	.health-bar.active {
		background: linear-gradient(to top, var(--primary-color), var(--accent-color));
		opacity: 1;
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
	}

	/* Central Display */
	.central-display {
		flex: 1;
		text-align: center;
		min-width: 0; /* Prevent overflow */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.display-text {
		font-family: 'Courier New', monospace;
		font-weight: 700;
		font-size: clamp(1rem, 3vw, 1.8rem);
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0.5rem;
		transition: all 0.3s ease;
	}

	.display-text.active {
		color: var(--primary-color);
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
	}

	/* Game Input Field */
	.game-input {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid var(--primary-color);
		border-radius: 8px;
		padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
		color: #fff;
		font-family: 'Courier New', monospace;
		font-weight: 700;
		font-size: clamp(1rem, 3vw, 1.5rem);
		text-align: center;
		width: clamp(150px, 40vw, 250px);
		outline: none;
		transition: all 0.3s ease;
	}

	.game-input:focus {
		border-color: var(--accent-color);
		background: rgba(255, 255, 255, 0.15);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.game-input.processing {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--secondary-color);
		opacity: 0.7;
		cursor: not-allowed;
	}

	.game-input::placeholder {
		color: #666;
		font-weight: normal;
	}

	.game-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Remove number input spinners */
	.game-input::-webkit-outer-spin-button,
	.game-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.game-input[type='number'] {
		-moz-appearance: textfield;
	}

	/* Controls */
	.controls-container {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.control-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		backdrop-filter: blur(4px);
	}

	.control-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.6);
		transform: scale(1.05);
	}

	.control-btn:active {
		transform: scale(0.95);
	}

	.pause-btn.paused {
		background: var(--primary-color);
		border-color: var(--primary-color);
		color: #000;
	}

	.quit-btn {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}

	.quit-btn:hover {
		background: rgba(239, 68, 68, 0.4);
	}

	/* Input State Indicator (development only) */
	.input-state-indicator {
		position: absolute;
		top: 5px;
		right: 5px;
		background: rgba(0, 0, 0, 0.9);
		color: #0f0;
		padding: 0.25rem;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.7rem;
		z-index: 100;
		pointer-events: none;
		border: 1px solid #333;
	}

	.input-state-indicator div {
		margin-bottom: 0.1rem;
		white-space: nowrap;
	}

	/* Mobile Adjustments */
	@media (max-width: 768px) {
		.scoreboard {
			padding: 0 0.5rem;
		}

		.health-bar {
			width: 12px;
			height: 32px;
		}

		.display-text {
			font-size: clamp(0.9rem, 4vw, 1.3rem);
		}

		.control-btn {
			width: 36px;
			height: 36px;
		}

		.game-input {
			width: clamp(120px, 50vw, 200px);
			font-size: clamp(0.9rem, 4vw, 1.2rem);
		}
	}

	/* Landscape Mobile */
	@media (max-height: 500px) and (orientation: landscape) {
		.health-bar {
			height: 24px;
		}

		.control-btn {
			width: 32px;
			height: 32px;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.scoreboard {
			border-top-color: #fff;
		}

		.control-btn {
			border-color: #fff;
		}

		.game-input {
			border-color: #fff;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.health-bar,
		.display-text,
		.control-btn,
		.game-input {
			transition: none;
		}
	}
</style>
