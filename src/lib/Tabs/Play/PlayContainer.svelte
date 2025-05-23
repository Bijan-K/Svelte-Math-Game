<!-- src/lib/tabs/play/PlayContainer.svelte -->
<script>
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

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

	// Input State Machine
	import { inputStateMachine } from './input/InputStateMachine.js';

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

	// Component cleanup
	let cleanupFunctions = [];

	// Determine current screen state
	$: showStartScreen =
		gamePaused && !gameOver && ($cache.diff === 'Null' || gameElements.length === 0);
	$: showPauseScreen = gamePaused && !gameOver && $cache.diff !== 'Null' && gameElements.length > 0;
	$: showGameUI = !showStartScreen && !gameOver;

	onMount(() => {
		// Initialize input state machine with game callbacks
		initializeInputSystem();

		// Set up any additional cleanup
		cleanupFunctions.push(() => {
			// Reset input state machine on unmount
			inputStateMachine.reset();
		});
	});

	onDestroy(() => {
		// Run all cleanup functions
		cleanupFunctions.forEach((cleanup) => {
			try {
				cleanup();
			} catch (error) {
				console.warn('Error during cleanup:', error);
			}
		});
		cleanupFunctions = [];
	});

	function initializeInputSystem() {
		// Initialize the input state machine with our game control callbacks
		inputStateMachine.init({
			onProcessInput: handleProcessInput,
			onStartGame: handleStartGame,
			onPauseGame: handlePauseGame,
			onResumeGame: handleResumeGame,
			onQuitGame: handleQuitGame
		});
	}

	// Handle game field readiness
	function handleFieldReady(fieldInfo) {
		try {
			gameFieldReady = true;
			updateFieldDimensions(fieldInfo);
			console.log('Game field ready:', fieldInfo);
		} catch (error) {
			console.error('Error handling field ready:', error);
		}
	}

	// Game control handlers
	function handleStartGame() {
		try {
			console.log('Starting game with difficulty:', $cache.diff);

			if ($cache.diff === 'Null') {
				console.error('No difficulty selected');
				return false;
			}

			// Initialize game configuration
			const config = initializeGame($cache.diff, $cache.customConfig);
			console.log('Game initialized with config:', config);

			// Start the game
			const started = startGame();
			if (started) {
				console.log('Game started successfully');
				return true;
			} else {
				console.error('Failed to start game');
				return false;
			}
		} catch (error) {
			console.error('Error starting game:', error);
			return false;
		}
	}

	function handlePauseGame() {
		try {
			console.log('Pausing game');
			pauseGame();
			return true;
		} catch (error) {
			console.error('Error pausing game:', error);
			return false;
		}
	}

	function handleResumeGame() {
		try {
			console.log('Resuming game');
			resumeGame();
			return true;
		} catch (error) {
			console.error('Error resuming game:', error);
			return false;
		}
	}

	function handleQuitGame() {
		try {
			console.log('Quitting game');
			quitGame();

			// Reset input state
			inputStateMachine.reset();
			return true;
		} catch (error) {
			console.error('Error quitting game:', error);
			return false;
		}
	}

	function handleProcessInput(input) {
		try {
			console.log('Processing input:', input);
			const processed = processInput(input);

			if (processed) {
				console.log('Input processed successfully');
			} else {
				console.log('Input processing failed or no match found');
			}

			return processed;
		} catch (error) {
			console.error('Error processing input:', error);
			return false;
		}
	}

	// Mobile numpad handling
	function handleKeyboardRequest(useDevice) {
		try {
			useDeviceKeyboard = useDevice;

			// The InputManager will handle mode switching through the state machine
			if (inputManager) {
				const newMode = useDevice ? 'mobile-keyboard' : 'mobile-numpad';
				inputManager.switchInputMode(newMode);
			}
		} catch (error) {
			console.error('Error handling keyboard request:', error);
		}
	}

	// Debug logging for state changes
	$: if ($gameState) {
		console.log('Game state updated:', {
			isActive: $gameState.isActive,
			isPaused: $gameState.isPaused,
			isGameOver: $gameState.isGameOver,
			elements: $gameState.elements.length,
			score: $gameState.score,
			health: $gameState.health,
			difficulty: $cache.diff
		});
	}

	// Debug: Log input state machine changes in development
	$: if (typeof window !== 'undefined' && window.__inputStateMachine) {
		const debugInfo = inputStateMachine.getDebugInfo();
		console.log('Input state machine debug:', debugInfo);
	}
</script>

<div class="play-container">
	<!-- Input Manager - Outside layout since it's non-visual -->
	<!-- This component coordinates all input through the InputStateMachine -->
	<InputManager
		bind:this={inputManager}
		isGamePaused={gamePaused}
		onStartGame={handleStartGame}
		onPauseGame={handlePauseGame}
		onResumeGame={handleResumeGame}
		onQuitGame={handleQuitGame}
		onProcessInput={handleProcessInput}
	/>

	<ResponsiveGameLayout showAside={false}>
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

	<!-- Development Debug Panel -->
	{#if false}
		<div class="debug-panel">
			<h3>Game State Debug</h3>
			<div>Difficulty: {$cache.diff}</div>
			<div>Game Active: {gameActive ? 'Yes' : 'No'}</div>
			<div>Game Paused: {gamePaused ? 'Yes' : 'No'}</div>
			<div>Game Over: {gameOver ? 'Yes' : 'No'}</div>
			<div>Elements: {gameElements.length}</div>
			<div>Score: {gameScore}</div>
			<div>Health: {$health}/{$maxHealth}</div>
			<div>Input Mode: {inputStateMachine.getState().mode}</div>
			<div>Input Value: "{inputStateMachine.getState().input}"</div>
			<div>Can Process: {inputStateMachine.getState().canProcess ? 'Yes' : 'No'}</div>
		</div>
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

	/* Debug Panel */
	.debug-panel {
		position: fixed;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.9);
		color: #0f0;
		padding: 1rem;
		border-radius: 8px;
		font-family: monospace;
		font-size: 0.8rem;
		z-index: 9999;
		pointer-events: none;
		border: 1px solid #333;
		max-width: 250px;
		backdrop-filter: blur(4px);
	}

	.debug-panel h3 {
		margin: 0 0 0.5rem 0;
		color: #0ff;
		font-size: 0.9rem;
	}

	.debug-panel div {
		margin-bottom: 0.25rem;
		word-break: break-all;
	}

	/* Mobile Adjustments */
	@media (max-width: 768px) {
		.overlay-screen {
			left: 0;
			width: 100vw;
		}

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

		.debug-panel {
			top: 5px;
			right: 5px;
			padding: 0.5rem;
			font-size: 0.7rem;
			max-width: 200px;
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

		.debug-panel {
			border-color: #fff;
			background: #000;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.resume-btn,
		.quit-btn {
			transition: none;
		}

		.resume-btn:hover,
		.quit-btn:hover {
			transform: none;
		}
	}
</style>
