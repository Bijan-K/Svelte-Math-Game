<!-- src/lib/Tabs/Play/GameContainer.svelte -->
<script>
	import { fade } from 'svelte/transition';
	import GameEngine from './GameEngine.svelte';
	import EquationField from './EquationField.svelte';
	import GameHUD from './GameHUD.svelte';
	import InputManager from './InputManager.svelte';
	import GameOver from './GameOver.svelte';

	// Game Engine reference and reactive state
	let gameEngine;
	let elements = [];
	let score = 0;
	let isGamePaused = true;
	let isGameOver = false;

	// Handle spawn requests from engine
	function handleSpawnRequest() {
		if (gameEngine) {
			// Get current container dimensions from field
			const field = document.querySelector('.equation-field');
			if (field) {
				gameEngine.addElement(field.clientWidth, field.clientHeight);
			}
		}
	}

	// Game control handlers
	function handleStartGame() {
		if (gameEngine) gameEngine.startGame();
	}

	function handlePauseGame() {
		if (gameEngine) gameEngine.pauseGame();
	}

	function handleResumeGame() {
		if (gameEngine) gameEngine.resumeGame();
	}

	function handleQuitGame() {
		if (gameEngine) gameEngine.quitGame();
	}

	function handleProcessInput(input) {
		if (gameEngine) gameEngine.processInput(input);
	}

	function handleElementSpawn(containerWidth, containerHeight) {
		// Initial spawn trigger when container is ready
		if (gameEngine && !isGamePaused && elements.length === 0) {
			gameEngine.addElement(containerWidth, containerHeight);
		}
	}
</script>

<div class="game-container" role="main" aria-label="Math game play area">
	<!-- Game Engine (logic only) -->
	<GameEngine
		bind:this={gameEngine}
		bind:elements
		bind:score
		bind:isGamePaused
		bind:isGameOver
		on:requestSpawn={handleSpawnRequest}
	/>

	<!-- Input Handler -->
	<InputManager
		{isGamePaused}
		onStartGame={handleStartGame}
		onPauseGame={handlePauseGame}
		onResumeGame={handleResumeGame}
		onQuitGame={handleQuitGame}
		onProcessInput={handleProcessInput}
	/>

	{#if isGamePaused && !isGameOver}
		<div class="game-overlay" in:fade={{ duration: 200 }}>
			{#if elements.length > 0}
				<!-- Game is paused -->
				<div class="pause-screen" role="dialog" aria-label="Game paused">
					<div class="pause-content">
						<h2>Game Paused</h2>
						<p>Press <kbd>Enter</kbd> or <kbd>Space</kbd> to continue</p>
						<p>Press <kbd>Escape</kbd> to quit</p>

						<div class="pause-actions">
							<button class="resume-btn" on:click={handleResumeGame} aria-label="Resume game">
								Resume
							</button>
							<button class="quit-btn" on:click={handleQuitGame} aria-label="Quit current game">
								Quit Game
							</button>
						</div>
					</div>
				</div>
			{:else}
				<!-- No game started -->
				<div class="start-screen" role="dialog" aria-label="Start new game">
					<div class="start-content">
						<h2>Ready to Play?</h2>
						<p>Select a difficulty and press <kbd>Enter</kbd> to start</p>
						<button class="start-btn" on:click={handleStartGame} aria-label="Start new game">
							Start Game
						</button>
					</div>
				</div>
			{/if}
		</div>
	{:else if isGameOver}
		<div class="game-overlay" in:fade={{ duration: 200 }}>
			<GameOver />
		</div>
	{/if}

	<!-- Game Field -->
	<EquationField {elements} onElementSpawn={handleElementSpawn} />

	<!-- HUD (health bars, pause button) -->
	{#if !isGamePaused || elements.length > 0}
		<GameHUD
			{isGamePaused}
			onPause={handlePauseGame}
			onResume={handleResumeGame}
			onQuit={handleQuitGame}
		/>
	{/if}
</div>

<style>
	.game-container {
		position: relative;
		width: 80vw;
		height: 88dvh;
		background: transparent;
		overflow: hidden;
	}

	.game-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		backdrop-filter: blur(4px);
	}

	.pause-screen,
	.start-screen {
		text-align: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid #333;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		max-width: 400px;
		width: 90%;
	}

	.pause-content h2,
	.start-content h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #fff;
	}

	.pause-content p,
	.start-content p {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: #ccc;
		line-height: 1.4;
	}

	kbd {
		background: #333;
		border: 1px solid #555;
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.9em;
		color: #fff;
	}

	.pause-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.resume-btn,
	.quit-btn,
	.start-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid;
		background: transparent;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.resume-btn,
	.start-btn {
		border-color: #22c55e;
		color: #22c55e;
	}

	.resume-btn:hover,
	.start-btn:hover {
		background: #22c55e;
		color: #000;
	}

	.quit-btn {
		border-color: #ef4444;
		color: #ef4444;
	}

	.quit-btn:hover {
		background: #ef4444;
		color: #fff;
	}

	@media (max-width: 768px) {
		.game-container {
			width: 100vw;
			height: 68dvh;
		}

		.pause-screen,
		.start-screen {
			padding: 1.5rem;
			margin: 1rem;
		}

		.pause-content h2,
		.start-content h2 {
			font-size: 1.5rem;
		}

		.pause-actions {
			flex-direction: column;
			gap: 0.75rem;
		}
	}
</style>
