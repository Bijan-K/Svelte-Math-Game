<!-- src/lib/tabs/play/input/InputManager.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore';
	import { inputStateMachine } from './InputStateMachine.js';

	// Props for game control callbacks
	export let isGamePaused;
	export let onStartGame;
	export let onPauseGame;
	export let onResumeGame;
	export let onQuitGame;
	export let onProcessInput;

	// Internal state
	let inputState = inputStateMachine.getState();
	let unsubscribeInput = null;
	let eventCleanup = [];

	// Initialize input state machine when component mounts
	onMount(() => {
		// Initialize with game callbacks
		inputStateMachine.init({
			onProcessInput,
			onStartGame,
			onPauseGame,
			onResumeGame,
			onQuitGame
		});

		// Subscribe to state changes
		unsubscribeInput = inputStateMachine.subscribe((state) => {
			inputState = state;
			// Sync with cache for other components that might read it
			cache.update((c) => ({ ...c, userInput: state.input }));
		});

		// Set initial mode based on viewport
		updateInputMode();

		// Set up event listeners
		setupEventListeners();
	});

	onDestroy(() => {
		// Clean up subscriptions
		if (unsubscribeInput) {
			unsubscribeInput();
		}

		// Clean up event listeners
		eventCleanup.forEach((cleanup) => cleanup());
		eventCleanup = [];
	});

	// Update input mode when viewport changes
	$: if ($viewport) {
		updateInputMode();
	}

	// Update game callbacks when props change
	$: if (onProcessInput || onStartGame || onPauseGame || onResumeGame || onQuitGame) {
		inputStateMachine.init({
			onProcessInput,
			onStartGame,
			onPauseGame,
			onResumeGame,
			onQuitGame
		});
	}

	function updateInputMode() {
		const newMode = $viewport.isMobile ? 'mobile-numpad' : 'desktop';
		inputStateMachine.setMode(newMode, 'viewport-change');
	}

	function setupEventListeners() {
		// Keyboard event handler
		const handleKeydown = (event) => {
			try {
				// Skip if not in desktop mode
				if (inputState.mode !== 'desktop') return;

				// Get current game context
				const gameContext = {
					gameState: $cache.gameState,
					isGamePaused,
					difficulty: $cache.diff
				};

				// Handle game controls (available anytime)
				if (event.key === 'Escape') {
					event.preventDefault();
					inputStateMachine.handleGameAction('quit', gameContext);
					return;
				}

				// Handle start/resume controls
				if (event.key === 'Enter' && isGamePaused) {
					event.preventDefault();

					if ($cache.diff !== 'Null') {
						// Check if we have existing elements (resume) or need to start
						const hasExistingElements = document.querySelector('.equation-element');
						const action = hasExistingElements ? 'resume' : 'start';
						inputStateMachine.handleGameAction(action, gameContext);
					} else {
						inputStateMachine.handleGameAction('start', gameContext);
					}
					return;
				}

				// Handle pause/resume toggle during gameplay
				if (event.key === ' ' && $cache.diff !== 'Null') {
					event.preventDefault();
					inputStateMachine.handleGameAction('toggle-pause', gameContext);
					return;
				}

				// Handle difficulty selection shortcuts (1-4) during start screen
				if (isGamePaused && event.key >= '1' && event.key <= '4' && $cache.diff === 'Null') {
					// Let the start screen handle difficulty selection
					return;
				}

				// Handle game input (only when game is active and not paused)
				if (!isGamePaused && $cache.gameState) {
					handleGameInput(event);
				}
			} catch (error) {
				console.error('Error handling keydown:', error);
			}
		};

		// Game input handler for desktop
		const handleGameInput = (event) => {
			try {
				// Number input (0-9)
				if (event.key >= '0' && event.key <= '9') {
					event.preventDefault();
					inputStateMachine.addChar(event.key, 'keyboard');
				}
				// Negative sign (only at start)
				else if (event.key === '-') {
					event.preventDefault();
					inputStateMachine.addChar('-', 'keyboard');
				}
				// Backspace
				else if (event.key === 'Backspace') {
					event.preventDefault();
					inputStateMachine.addChar('backspace', 'keyboard');
				}
				// Enter - submit answer
				else if (event.key === 'Enter') {
					event.preventDefault();
					inputStateMachine.processInput();
				}
			} catch (error) {
				console.error('Error handling game input:', error);
			}
		};

		// Visibility change handler (pause on tab switch)
		const handleVisibilityChange = () => {
			try {
				if (document.hidden && !isGamePaused && $cache.gameState) {
					inputStateMachine.handleGameAction('pause', {
						gameState: $cache.gameState,
						isGamePaused,
						difficulty: $cache.diff
					});
				}
			} catch (error) {
				console.error('Error handling visibility change:', error);
			}
		};

		// Window blur handler (pause on focus loss)
		const handleWindowBlur = () => {
			try {
				if (!isGamePaused && $cache.gameState) {
					inputStateMachine.handleGameAction('pause', {
						gameState: $cache.gameState,
						isGamePaused,
						difficulty: $cache.diff
					});
				}
			} catch (error) {
				console.error('Error handling window blur:', error);
			}
		};

		// Context menu prevention on mobile during game
		const handleContextMenu = (event) => {
			try {
				if ($viewport.isMobile && $cache.gameState) {
					event.preventDefault();
				}
			} catch (error) {
				console.error('Error handling context menu:', error);
			}
		};

		// Orientation change handler
		const handleOrientationChange = () => {
			try {
				// Update input mode after orientation change
				setTimeout(() => {
					updateInputMode();
				}, 500);
			} catch (error) {
				console.error('Error handling orientation change:', error);
			}
		};

		// Add event listeners
		window.addEventListener('keydown', handleKeydown);
		eventCleanup.push(() => window.removeEventListener('keydown', handleKeydown));

		document.addEventListener('visibilitychange', handleVisibilityChange);
		eventCleanup.push(() =>
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		);

		window.addEventListener('blur', handleWindowBlur);
		eventCleanup.push(() => window.removeEventListener('blur', handleWindowBlur));

		document.addEventListener('contextmenu', handleContextMenu);
		eventCleanup.push(() => document.removeEventListener('contextmenu', handleContextMenu));

		window.addEventListener('orientationchange', handleOrientationChange);
		eventCleanup.push(() =>
			window.removeEventListener('orientationchange', handleOrientationChange)
		);
	}

	// Public API for mode switching (called by other components)
	export function switchInputMode(newMode) {
		try {
			if ($viewport.isMobile && ['mobile-numpad', 'mobile-keyboard'].includes(newMode)) {
				inputStateMachine.setMode(newMode, 'component-request');
			}
		} catch (error) {
			console.error('Error switching input mode:', error);
		}
	}

	// Get keyboard shortcuts for help display
	export function getKeyboardShortcuts() {
		const shortcuts = [
			{ key: 'Enter', action: 'Start/Resume game', context: 'Menu/Paused' },
			{ key: 'Space', action: 'Pause/Resume', context: 'During game' },
			{ key: 'Escape', action: 'Quit game', context: 'During game' },
			{ key: '1-4', action: 'Select difficulty', context: 'Start screen' },
			{ key: '0-9', action: 'Enter numbers', context: 'During game' },
			{ key: '-', action: 'Negative sign', context: 'During game' },
			{ key: 'Backspace', action: 'Delete digit', context: 'During game' }
		];

		return shortcuts.filter((shortcut) => {
			// Filter based on current context
			if (isGamePaused && $cache.diff === 'Null') {
				return shortcut.context === 'Menu' || shortcut.context === 'Start screen';
			} else if (isGamePaused) {
				return shortcut.context === 'Paused' || shortcut.context === 'Menu/Paused';
			} else {
				return shortcut.context === 'During game';
			}
		});
	}

	// Get current input state for debugging
	export function getInputState() {
		return {
			...inputState,
			isGamePaused,
			gameState: $cache.gameState,
			difficulty: $cache.diff,
			isMobile: $viewport.isMobile
		};
	}

	// Get debug information
	export function getDebugInfo() {
		return {
			inputStateMachine: inputStateMachine.getDebugInfo(),
			componentState: getInputState(),
			viewport: {
				isMobile: $viewport.isMobile,
				width: $viewport.width,
				height: $viewport.height
			}
		};
	}
</script>

<!-- Debug info for development (hidden in production) -->
{#if false}
	<div class="input-debug">
		<div>Mode: {inputState.mode}</div>
		<div>Input: "{inputState.input}"</div>
		<div>Source: {inputState.inputSource || 'none'}</div>
		<div>Processing: {inputState.isProcessing ? 'Yes' : 'No'}</div>
		<div>Game State: {$cache.gameState ? 'Active' : 'Inactive'}</div>
		<div>Paused: {isGamePaused ? 'Yes' : 'No'}</div>
		<div>Difficulty: {$cache.diff}</div>
		<div>Viewport: {$viewport.isMobile ? 'Mobile' : 'Desktop'}</div>
		<div>Subscribers: {inputState.subscriberCount || 0}</div>
	</div>
{/if}

<style>
	.input-debug {
		position: fixed;
		top: 60px;
		left: 10px;
		background: rgba(0, 0, 0, 0.9);
		color: #0ff;
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.75rem;
		z-index: 9999;
		pointer-events: none;
		border: 1px solid #333;
		max-width: 200px;
	}

	.input-debug div {
		margin-bottom: 0.25rem;
		word-break: break-all;
	}

	/* Ensure debug info is responsive */
	@media (max-width: 768px) {
		.input-debug {
			top: 10px;
			left: 5px;
			font-size: 0.7rem;
			padding: 0.4rem;
			max-width: 150px;
		}
	}
</style>
