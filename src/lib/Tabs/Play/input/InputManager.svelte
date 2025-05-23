<!-- src/lib/tabs/play/input/InputManager.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache, functionTriggerEnter } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore';

	// Props for game control callbacks
	export let isGamePaused;
	export let onStartGame;
	export let onPauseGame;
	export let onResumeGame;
	export let onQuitGame;
	export let onProcessInput;

	// Input state management
	let userInput = '';
	let inputMode = 'desktop'; // 'desktop' | 'mobile-numpad' | 'mobile-keyboard'
	let isInputFocused = false;
	let preventNextInput = false;

	// Event cleanup functions
	let cleanupFunctions = [];

	// Determine input mode based on viewport
	$: if ($viewport.isMobile) {
		inputMode = 'mobile-numpad'; // Default to numpad, can switch to keyboard
	} else {
		inputMode = 'desktop';
	}

	// Handle desktop keyboard input
	function handleKeydown(event) {
		try {
			// Skip if using mobile numpad (handled separately)
			if (inputMode === 'mobile-numpad') return;

			// Prevent handling if we're in a mobile keyboard overlay
			if (preventNextInput) {
				preventNextInput = false;
				return;
			}

			// Game controls (available anytime)
			if (event.key === 'Escape') {
				event.preventDefault();
				handleEscapeKey();
				return;
			}

			// Start/Resume game controls
			if (event.key === 'Enter' && isGamePaused) {
				event.preventDefault();
				handleEnterKey();
				return;
			}

			// Pause/Resume toggle - only during active gameplay
			if (event.key === ' ' && $cache.diff !== 'Null') {
				event.preventDefault();
				handleSpaceKey();
				return;
			}

			// Difficulty selection shortcuts (1-4) - only when paused and no difficulty selected
			if (isGamePaused && event.key >= '1' && event.key <= '4' && $cache.diff === 'Null') {
				// Let the start screen handle this
				return;
			}

			// Game input (only when game is active and not paused)
			if (!isGamePaused && $cache.gameState) {
				handleGameInput(event);
			}
		} catch (error) {
			console.error('Error handling keydown:', error);
		}
	}

	function handleEscapeKey() {
		if (!isGamePaused && onQuitGame) {
			onQuitGame();
		}
	}

	function handleEnterKey() {
		if ($cache.diff !== 'Null') {
			const hasExistingElements = document.querySelector('.equation-element');
			if (hasExistingElements && onResumeGame) {
				onResumeGame();
			} else if (onStartGame) {
				onStartGame();
			}
		}
	}

	function handleSpaceKey() {
		if (!isGamePaused && onPauseGame) {
			onPauseGame();
		} else if (isGamePaused && document.querySelector('.equation-element') && onResumeGame) {
			onResumeGame();
		}
	}

	function handleGameInput(event) {
		try {
			// Number input (including negative sign at start)
			if ((event.key >= '0' && event.key <= '9') || (event.key === '-' && userInput === '')) {
				event.preventDefault();
				userInput += event.key;
				updateCacheInput(userInput);
			}
			// Backspace
			else if (event.key === 'Backspace') {
				event.preventDefault();
				userInput = userInput.slice(0, -1);
				updateCacheInput(userInput);
			}
			// Enter - submit answer
			else if (event.key === 'Enter') {
				event.preventDefault();
				if (userInput.trim() !== '') {
					submitAnswer(userInput);
				}
			}
		} catch (error) {
			console.error('Error handling game input:', error);
		}
	}

	function updateCacheInput(value) {
		try {
			cache.update((n) => ({ ...n, userInput: value }));
		} catch (error) {
			console.error('Error updating cache input:', error);
		}
	}

	function submitAnswer(answer) {
		try {
			if (onProcessInput) {
				onProcessInput(answer);
			}
			userInput = '';
			updateCacheInput('');
		} catch (error) {
			console.error('Error submitting answer:', error);
		}
	}

	// Handle mobile numpad triggers
	$: if ($functionTriggerEnter) {
		try {
			if ($cache.userInput.trim() !== '') {
				submitAnswer($cache.userInput);
			}
		} catch (error) {
			console.error('Error handling mobile input trigger:', error);
		} finally {
			functionTriggerEnter.update((n) => false);
		}
	}

	// Sync userInput with cache for mobile
	$: if (inputMode === 'mobile-numpad' || inputMode === 'mobile-keyboard') {
		userInput = $cache.userInput || '';
	}

	// Handle input mode switching for mobile
	export function switchInputMode(newMode) {
		try {
			if ($viewport.isMobile && ['mobile-numpad', 'mobile-keyboard'].includes(newMode)) {
				inputMode = newMode;

				// Clear any existing input when switching modes
				userInput = '';
				updateCacheInput('');

				// Prevent the next desktop input to avoid conflicts
				if (newMode === 'mobile-keyboard') {
					preventNextInput = true;
				}
			}
		} catch (error) {
			console.error('Error switching input mode:', error);
		}
	}

	// Keyboard shortcuts help
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

	// Focus management for accessibility
	function manageFocus() {
		try {
			// Ensure proper focus management for screen readers
			if ($cache.gameState && !isGamePaused && inputMode === 'desktop') {
				const gameField = document.querySelector('.game-field');
				if (gameField) {
					gameField.setAttribute('tabindex', '0');
					gameField.focus();
				}
			}
		} catch (error) {
			console.error('Error managing focus:', error);
		}
	}

	// Handle visibility changes (pause on tab switch)
	function handleVisibilityChange() {
		try {
			if (document.hidden && !isGamePaused && $cache.gameState && onPauseGame) {
				onPauseGame();
			}
		} catch (error) {
			console.error('Error handling visibility change:', error);
		}
	}

	// Handle window blur (pause on focus loss)
	function handleWindowBlur() {
		try {
			if (!isGamePaused && $cache.gameState && onPauseGame) {
				onPauseGame();
			}
		} catch (error) {
			console.error('Error handling window blur:', error);
		}
	}

	// Prevent context menu on mobile during game
	function handleContextMenu(event) {
		try {
			if ($viewport.isMobile && $cache.gameState) {
				event.preventDefault();
			}
		} catch (error) {
			console.error('Error handling context menu:', error);
		}
	}

	// Handle mobile device orientation changes
	function handleOrientationChange() {
		try {
			// Clear any pending input on orientation change
			if ($viewport.isMobile) {
				userInput = '';
				updateCacheInput('');
			}
		} catch (error) {
			console.error('Error handling orientation change:', error);
		}
	}

	// Handle input focus events
	function handleInputFocus() {
		isInputFocused = true;
	}

	function handleInputBlur() {
		isInputFocused = false;
	}

	// Setup and cleanup event listeners
	function setupEventListeners() {
		try {
			// Set up event listeners
			const keydownHandler = (event) => handleKeydown(event);
			window.addEventListener('keydown', keydownHandler);
			cleanupFunctions.push(() => window.removeEventListener('keydown', keydownHandler));

			const visibilityHandler = () => handleVisibilityChange();
			document.addEventListener('visibilitychange', visibilityHandler);
			cleanupFunctions.push(() =>
				document.removeEventListener('visibilitychange', visibilityHandler)
			);

			const blurHandler = () => handleWindowBlur();
			window.addEventListener('blur', blurHandler);
			cleanupFunctions.push(() => window.removeEventListener('blur', blurHandler));

			const contextMenuHandler = (event) => handleContextMenu(event);
			document.addEventListener('contextmenu', contextMenuHandler);
			cleanupFunctions.push(() => document.removeEventListener('contextmenu', contextMenuHandler));

			const orientationHandler = () => handleOrientationChange();
			window.addEventListener('orientationchange', orientationHandler);
			cleanupFunctions.push(() =>
				window.removeEventListener('orientationchange', orientationHandler)
			);
		} catch (error) {
			console.error('Error setting up event listeners:', error);
		}
	}

	function cleanupEventListeners() {
		try {
			cleanupFunctions.forEach((cleanup) => {
				try {
					cleanup();
				} catch (cleanupError) {
					console.warn('Error during event listener cleanup:', cleanupError);
				}
			});
			cleanupFunctions = [];
		} catch (error) {
			console.error('Error cleaning up event listeners:', error);
		}
	}

	onMount(() => {
		setupEventListeners();
		manageFocus();
	});

	onDestroy(() => {
		cleanupEventListeners();
		// Clean up any remaining state
		userInput = '';
		updateCacheInput('');
	});

	// Reactive focus management
	$: if ($cache.gameState !== undefined || isGamePaused !== undefined) {
		manageFocus();
	}

	// Handle input mode changes
	$: if (inputMode && $viewport.isMobile) {
		// Reset input when switching modes
		userInput = '';
		updateCacheInput('');
	}

	// Export current input state for debugging
	export function getInputState() {
		return {
			inputMode,
			userInput,
			isInputFocused,
			isGamePaused,
			gameState: $cache.gameState,
			isMobile: $viewport.isMobile
		};
	}
</script>

<!-- This component handles input only, no visual output -->
<!-- We use svelte:window for global event handling -->
<svelte:window on:keydown={handleKeydown} />

<!-- Debug info for development (hidden in production) -->
{#if false}
	<div class="input-debug">
		<div>Input Mode: {inputMode}</div>
		<div>Game State: {$cache.gameState ? 'Active' : 'Inactive'}</div>
		<div>Paused: {isGamePaused ? 'Yes' : 'No'}</div>
		<div>User Input: "{userInput}"</div>
		<div>Cache Input: "{$cache.userInput}"</div>
		<div>Viewport: {$viewport.isMobile ? 'Mobile' : 'Desktop'}</div>
		<div>Focused: {isInputFocused ? 'Yes' : 'No'}</div>
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
