<!-- src/lib/tabs/play/PlayContainer.svelte -->
<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Layout Components
	import ResponsiveGameLayout from './layout/ResponsiveGameLayout.svelte';

	// UI Components
	import GameField from './ui/GameField.svelte';
	import ScoreBoard from './ui/ScoreBoard.svelte';

	// Input Components
	import InputManager from './input/InputManager.svelte';

	// Screen Components
	import GameStartScreen from './screens/GameStartScreen.svelte';
	import GameOver from './GameOver.svelte';

	// Mobile Components
	import MobileNumpad from './input/MobileNumpad.svelte';

	// Stores
	import { cache } from '$lib/stores.js';
	import { viewport } from './layout/viewportStore.js';

	// Game Management
	import {
		gameState,
		elements,
		score,
		health,
		maxHealth,
		isGameActive,
		isGamePaused,
		isGameOver,
		initializeGame,
		startGame,
		pauseGame,
		resumeGame,
		quitGame,
		processInput,
		updateFieldDimensions
	} from '$lib/stores/gameStore.js';

	// Game state - derived from stores
	$: gameElements = $elements;
	$: gameScore = $score;
	$: gamePaused = $isGamePaused;
	$: gameOver = $isGameOver;
	$: gameActive = $isGameActive;

	// Mobile state
	let useDeviceKeyboard = false;
	let gameFieldReady = false;
	let inputManager;

	// Determine current screen state
	$: showStartScreen =
		gamePaused && !gameOver && ($cache.diff === 'Null' || gameElements.length === 0);
	$: showPauseScreen = gamePaused && !gameOver && $cache.diff !== 'Null' && gameElements.length > 0;
	$: showGameUI = !showStartScreen && !gameOver;

	// Handle game field readiness
	function handleFieldReady(fieldInfo) {
		gameFieldReady = true;
		updateFieldDimensions(fieldInfo);
	}

	// Game control handlers
	function handleStartGame() {
		console.log('Starting game with difficulty:', $cache.diff);

		if ($cache.diff === 'Null') {
			console.error('No difficulty selected');
			return;
		}

		// Initialize game configuration
		const config = initializeGame($cache.diff, $cache.customConfig);
		console.log('Game initialized with config:', config);

		// Start the game
		const started = startGame();
		if (started) {
			console.log('Game started successfully');
		} else {
			console.error('Failed to start game');
		}
	}

	function handlePauseGame() {
		console.log('Pausing game');
		pauseGame();
	}

	function handleResumeGame() {
		console.log('Resuming game');
		resumeGame();
	}

	function handleQuitGame() {
		console.log('Quitting game');
		quitGame();
	}

	function handleProcessInput(input) {
		console.log('Processing input:', input);
		const processed = processInput(input);
		if (processed) {
			console.log('Input processed successfully');
		}
	}

	// Mobile numpad handling
	function handleKeyboardRequest(useDevice) {
		useDeviceKeyboard = useDevice;
		if (inputManager) {
			inputManager.switchInputMode(useDevice ? 'mobile-keyboard' : 'mobile-numpad');
		}
	}

	// Debug logging
	$: if ($gameState) {
		console.log('Game state updated:', {
			isActive: $gameState.isActive,
			isPaused: $gameState.isPaused,
			isGameOver: $gameState.isGameOver,
			elements: $gameState.elements.length,
			score: $gameState.score,
			health: $gameState.health
		});
	}
</script>

<div class="play-container">
	<ResponsiveGameLayout showAside={false}>
		<!-- Input Manager -->
		<InputManager
			bind:this={inputManager}
			isGamePaused={gamePaused}
			onStartGame={handleStartGame}
			onPauseGame={handlePauseGame}
			onResumeGame={handleResumeGame}
			onQuitGame={handleQuitGame}
			onProcessInput={handleProcessInput}
		/>

		<!-- Game Field -->
		<div slot="game-field">
			<GameField elements={gameElements} onFieldReady={handleFieldReady} />
		</div>

		<!-- Control Panel -->
		<div slot="control-panel">
			<ScoreBoard
				isGamePaused={gamePaused}
				onPause={handlePauseGame}
				onResume={handleResumeGame}
				onQuit={handleQuitGame}
				onProcessInput={handleProcessInput}
				showInput={showGameUI}
			/>
		</div>

		<!-- Overlays -->
		<div slot="overlay">
			<!-- Game Start Screen -->
			{#if showStartScreen}
				<div class="overlay-screen" in:fade={{ duration: 300 }}>
					<GameStartScreen onStartGame={handleStartGame} />
				</div>
			{/if}

			<!-- Pause Screen -->
			{#if showPauseScreen}
				<div class="overlay-screen pause-overlay" in:fade={{ duration: 300 }}>
					<div class="pause-screen">
						<div class="pause-content">
							<h2>Game Paused</h2>
							<div class="pause-hints">
								<p>Press <kbd>Enter</kbd> or <kbd>Space</kbd> to continue</p>
								<p>Press <kbd>Escape</kbd> to quit</p>
							</div>

							<div class="pause-actions">
								<button class="resume-btn" on:click={handleResumeGame}> Resume </button>
								<button class="quit-btn" on:click={handleQuitGame}> Quit Game </button>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Game Over Screen -->
			{#if gameOver}
				<div class="overlay-screen" in:fade={{ duration: 300 }}>
					<GameOver />
				</div>
			{/if}
		</div>
	</ResponsiveGameLayout>

	<!-- Mobile Numpad -->
	{#if $viewport.isMobile && gameActive}
		<MobileNumpad
			onRequestKeyboard={handleKeyboardRequest}
			onProcessInput={handleProcessInput}
			{useDeviceKeyboard}
		/>
	{/if}
</div>

<style>
	.play-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		background: #000;
	}

	/* Overlay Screens */
	.overlay-screen {
		position: absolute;
		top: 0;
		left: 20%;
		right: 0;
		bottom: 0;
		width: 80vw;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(8px);
		z-index: 50;
	}

	.overlay-screen.pause-overlay {
		background: rgba(0, 0, 0, 0.9);
	}

	/* Pause Screen */
	.pause-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 1rem;
	}

	.pause-content {
		text-align: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.95);
		border: 2px solid #333;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		max-width: 90%;
		width: 400px;
	}

	.pause-content h2 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		color: #fff;
		font-weight: 700;
	}

	.pause-hints {
		margin-bottom: 2rem;
	}

	.pause-hints p {
		font-size: 1rem;
		margin-bottom: 0.5rem;
		color: #ccc;
		line-height: 1.5;
	}

	kbd {
		background: #333;
		border: 1px solid #555;
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.9em;
		color: #fff;
		white-space: nowrap;
	}

	.pause-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.resume-btn,
	.quit-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid;
		background: transparent;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 120px;
		color: #fff;
	}

	.resume-btn {
		border-color: #22c55e;
		color: #22c55e;
	}

	.resume-btn:hover {
		background: #22c55e;
		color: #000;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.quit-btn {
		border-color: #ef4444;
		color: #ef4444;
	}

	.quit-btn:hover {
		background: #ef4444;
		color: #fff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	/* Mobile Adjustments */
	@media (max-width: 768px) {
		.pause-content {
			padding: 1.5rem;
			width: 90%;
		}

		.pause-content h2 {
			font-size: 1.5rem;
		}

		.pause-hints p {
			font-size: 0.9rem;
		}

		.pause-actions {
			flex-direction: column;
			width: 100%;
		}

		.resume-btn,
		.quit-btn {
			width: 100%;
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.pause-content {
			border-color: #fff;
			background: #000;
		}

		kbd {
			border-color: #fff;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.resume-btn,
		.quit-btn {
			transition: none;
		}
	}
</style>
