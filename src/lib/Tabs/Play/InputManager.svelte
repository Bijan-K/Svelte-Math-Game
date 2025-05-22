<!-- src/lib/Tabs/Play/InputManager.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache, functionTriggerEnter } from '$lib/stores.js';

	export let isGamePaused;
	export let onStartGame;
	export let onPauseGame;
	export let onResumeGame;
	export let onQuitGame;
	export let onProcessInput;

	let userInput = '';

	function handleKeydown(event) {
		// Game controls (available anytime)
		if (event.key === 'Escape') {
			event.preventDefault();
			if (!isGamePaused) {
				onQuitGame();
			}
			return;
		}

		// Start game - only if difficulty is selected and game is paused
		if (isGamePaused && event.key === 'Enter' && $cache.diff !== 'Null') {
			event.preventDefault();
			if (document.querySelector('.equation-element')) {
				// Game exists, resume
				onResumeGame();
			} else {
				// Start new game
				onStartGame();
			}
			return;
		}

		// Pause/Resume toggle - only during active gameplay
		if (event.key === ' ' && $cache.diff !== 'Null') {
			event.preventDefault();
			if (!isGamePaused) {
				onPauseGame();
			} else if (document.querySelector('.equation-element')) {
				onResumeGame();
			}
			return;
		}

		// Game input (only when game is active and not paused)
		if (!isGamePaused && $cache.gameState) {
			if ((event.key >= '0' && event.key <= '9') || (event.key === '-' && userInput === '')) {
				event.preventDefault();
				userInput += event.key;
				cache.update((n) => ({ ...n, userInput: userInput }));
			} else if (event.key === 'Backspace') {
				event.preventDefault();
				userInput = userInput.slice(0, -1);
				cache.update((n) => ({ ...n, userInput: userInput }));
			} else if (event.key === 'Enter') {
				event.preventDefault();
				if (userInput.trim() !== '') {
					onProcessInput(userInput);
					userInput = '';
					cache.update((n) => ({ ...n, userInput: userInput }));
				}
			}
		}
	}

	// Handle mobile trigger from numpad
	$: if ($functionTriggerEnter) {
		if ($cache.userInput.trim() !== '') {
			onProcessInput($cache.userInput);
			userInput = '';
			cache.update((n) => ({ ...n, userInput: '' }));
		}
		functionTriggerEnter.update((n) => false);
	}

	// Sync userInput with cache
	$: userInput = $cache.userInput || '';

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<!-- This component handles input only, no visual output -->
<svelte:window on:keydown={handleKeydown} />
