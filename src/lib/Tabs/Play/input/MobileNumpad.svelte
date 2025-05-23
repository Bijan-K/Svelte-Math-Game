<!-- src/lib/tabs/play/input/MobileNumpad.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore.js';
	import { fade, slide } from 'svelte/transition';
	import { inputStateMachine } from './InputStateMachine.js';

	export let onRequestKeyboard = () => {};
	export let useDeviceKeyboard = false;

	// Input state from state machine
	let inputState = inputStateMachine.getState();
	let unsubscribeInput = null;

	// Device input element reference
	let inputElement;

	// Get difficulty-based theming
	$: difficultyTheme = getDifficultyTheme($cache.diff);

	// Show numpad when on mobile and game is active
	$: showNumpad = $viewport.isMobile && $cache.gameState;

	// Determine current mode from state machine
	$: isNumpadMode = inputState.mode === 'mobile-numpad';
	$: isKeyboardMode = inputState.mode === 'mobile-keyboard';

	// Numpad layout - traditional phone style with an Enter button
	const numpadLayout = [
		[
			{ value: '1', label: '1', type: 'number' },
			{ value: '2', label: '2', type: 'number' },
			{ value: '3', label: '3', type: 'number' }
		],
		[
			{ value: '4', label: '4', type: 'number' },
			{ value: '5', label: '5', type: 'number' },
			{ value: '6', label: '6', type: 'number' }
		],
		[
			{ value: '7', label: '7', type: 'number' },
			{ value: '8', label: '8', type: 'number' },
			{ value: '9', label: '9', type: 'number' }
		],
		[
			{ value: '-', label: '±', type: 'special', title: 'Negative sign' },
			{ value: '0', label: '0', type: 'number' },
			{ value: 'backspace', label: '⌫', type: 'special', title: 'Delete' }
		],
		[
			// New row for the Enter button
			{ value: 'enter', label: 'ENTER', type: 'action', title: 'Submit Answer' }
		]
	];

	onMount(() => {
		// Subscribe to input state machine
		unsubscribeInput = inputStateMachine.subscribe((state) => {
			inputState = state;

			// Update useDeviceKeyboard prop based on state machine mode
			const newUseDeviceKeyboard = state.mode === 'mobile-keyboard';
			if (newUseDeviceKeyboard !== useDeviceKeyboard) {
				useDeviceKeyboard = newUseDeviceKeyboard;
				onRequestKeyboard(useDeviceKeyboard);
			}
		});

		// Set up orientation change handler
		window.addEventListener('orientationchange', handleOrientationChange);
	});

	onDestroy(() => {
		if (unsubscribeInput) {
			unsubscribeInput();
		}
		window.removeEventListener('orientationchange', handleOrientationChange);
	});

	function getDifficultyTheme(diff) {
		const themes = {
			ez: { primary: '#10b981', secondary: '#065f46', accent: '#34d399' },
			mid: { primary: '#f59e0b', secondary: '#92400e', accent: '#fbbf24' },
			high: { primary: '#ef4444', secondary: '#991b1b', accent: '#f87171' },
			custom: { primary: '#8b5cf6', secondary: '#5b21b6', accent: '#a78bfa' }
		};
		return themes[diff] || themes.ez;
	}

	function handleInput(value) {
		if (!$cache.gameState) return;

		try {
			switch (value) {
				case 'enter':
					// Only process if there's valid input and not already processing
					if (inputState.canProcess) {
						inputStateMachine.processInput();
					}
					break;

				case 'backspace':
					inputStateMachine.addChar('backspace', 'numpad');
					break;

				case 'keyboard':
					toggleKeyboardMode();
					break;

				case '-':
					inputStateMachine.addChar('-', 'numpad');
					break;

				default:
					// Number input (0-9)
					if (value >= '0' && value <= '9') {
						inputStateMachine.addChar(value, 'numpad');
					}
					break;
			}

			// Haptic feedback on supported devices
			if ('vibrate' in navigator && $cache.gameState) {
				navigator.vibrate(10);
			}
		} catch (error) {
			console.error('Error handling numpad input:', error);
		}
	}

	function toggleKeyboardMode() {
		try {
			const newMode = isKeyboardMode ? 'mobile-numpad' : 'mobile-keyboard';
			inputStateMachine.setMode(newMode, 'user-toggle');

			if (newMode === 'mobile-keyboard' && inputElement) {
				// Small delay to ensure DOM is updated
				setTimeout(() => {
					inputElement.focus();
					inputElement.click();
				}, 100);
			}
		} catch (error) {
			console.error('Error toggling keyboard mode:', error);
		}
	}

	// Handle device keyboard input
	function handleDeviceInput(event) {
		if (!isKeyboardMode || !$cache.gameState) return;

		try {
			const value = event.target.value;
			inputStateMachine.updateInput(value, 'device-keyboard');
		} catch (error) {
			console.error('Error handling device input:', error);
		}
	}

	function handleDeviceKeydown(event) {
		if (!isKeyboardMode || !$cache.gameState) return;

		try {
			if (event.key === 'Enter') {
				event.preventDefault();
				if (inputState.canProcess) {
					inputStateMachine.processInput();
				}

				// Keep focus for continuous input
				setTimeout(() => {
					if (inputElement) {
						inputElement.focus();
					}
				}, 100);
			}
		} catch (error) {
			console.error('Error handling device keydown:', error);
		}
	}

	// Handle screen orientation changes
	function handleOrientationChange() {
		if (isKeyboardMode && inputElement) {
			// Refocus input after orientation change
			setTimeout(() => {
				inputElement.focus();
			}, 500);
		}
	}

	// Handle keyboard visibility changes - sync with state machine
	$: if ($viewport.isKeyboardOpen && !isKeyboardMode && $viewport.isMobile) {
		// Device keyboard opened unexpectedly, switch modes
		inputStateMachine.setMode('mobile-keyboard', 'system-keyboard-open');
	}
</script>

{#if showNumpad}
	<div
		class="numpad-container"
		class:device-mode={isKeyboardMode}
		style="--primary-color: {difficultyTheme.primary}; --secondary-color: {difficultyTheme.secondary}; --accent-color: {difficultyTheme.accent}"
		in:slide={{ duration: 300, axis: 'y' }}
		out:slide={{ duration: 200, axis: 'y' }}
	>
		{#if isNumpadMode}
			<!-- Custom Numpad Mode -->
			<div class="numpad" role="group" aria-label="Number input pad">
				<!-- Input Display -->
				<div
					class="input-display"
					aria-live="polite"
					aria-label="Current input: {inputState.input || 'none'}"
				>
					<div class="input-value" class:processing={inputState.isProcessing}>
						{inputState.input || '0'}
					</div>
					<div class="input-actions">
						<button
							class="keyboard-toggle"
							on:click={() => handleInput('keyboard')}
							aria-label="Switch to device keyboard"
							title="Use device keyboard"
							disabled={inputState.isProcessing || !$cache.gameState}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Number Grid -->
				<div class="numpad-grid">
					{#each numpadLayout as row}
						<div class="numpad-row">
							{#each row as button}
								<button
									class="numpad-button"
									class:special={button.type === 'special'}
									class:enter-button={button.type === 'action'}
									class:can-process={button.type === 'action' && inputState.canProcess}
									on:click={() => handleInput(button.value)}
									aria-label={button.title || `${button.type} ${button.label}`}
									title={button.title}
									disabled={!$cache.gameState ||
										inputState.isProcessing ||
										(button.type === 'action' && !inputState.canProcess)}
								>
									{button.label}
								</button>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{:else if isKeyboardMode}
			<!-- Device Keyboard Mode -->
			<div class="device-keyboard-mode" in:fade={{ duration: 200 }}>
				<div class="keyboard-info">
					<span class="mode-label">Device Keyboard</span>
					<button
						class="keyboard-toggle device"
						on:click={() => handleInput('keyboard')}
						aria-label="Switch to custom numpad"
						title="Use custom numpad"
						disabled={inputState.isProcessing || !$cache.gameState}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
							/>
						</svg>
					</button>
				</div>

				<input
					bind:this={inputElement}
					type="number"
					inputmode="numeric"
					pattern="-?\d*"
					value={inputState.input}
					on:input={handleDeviceInput}
					on:keydown={handleDeviceKeydown}
					placeholder="Enter answer..."
					aria-label="Math answer input"
					class="device-input"
					class:processing={inputState.isProcessing}
					autocomplete="off"
					disabled={!$cache.gameState || inputState.isProcessing}
				/>

				<!-- Processing indicator -->
				{#if inputState.isProcessing}
					<div class="processing-indicator">Processing answer...</div>
				{/if}
			</div>
		{/if}

		<!-- State indicator for debugging -->
		{#if true}
			<div class="state-indicator">
				<div>Mode: {inputState.mode}</div>
				<div>Input: "{inputState.input}"</div>
				<div>Source: {inputState.inputSource || 'none'}</div>
				<div>Processing: {inputState.isProcessing ? 'Yes' : 'No'}</div>
				<div>Can Process: {inputState.canProcess ? 'Yes' : 'No'}</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.numpad-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 30;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(10px);
		border-top: 2px solid var(--primary-color);
		max-height: 55vh; /* Adjusted slightly for new row */
		overflow: hidden;
	}

	.numpad-container.device-mode {
		max-height: 20vh;
	}

	.numpad {
		padding: clamp(0.5rem, 2vw, 1rem);
		max-width: 400px;
		margin: 0 auto;
	}

	.input-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid var(--primary-color);
		border-radius: 12px;
		padding: clamp(0.75rem, 3vw, 1rem);
		margin-bottom: clamp(0.5rem, 2vw, 1rem);
		transition: all 0.3s ease;
	}

	.input-display:has(.processing) {
		border-color: var(--secondary-color);
		background: rgba(255, 255, 255, 0.02);
	}

	.input-value {
		font-size: clamp(1.2rem, 4vw, 1.8rem);
		font-weight: 600;
		color: #fff;
		font-family: 'Courier New', monospace;
		min-height: 1.5rem;
		flex: 1;
		text-align: left;
		transition: all 0.3s ease;
	}

	.input-value.processing {
		opacity: 0.7;
		color: var(--secondary-color);
	}

	.input-actions {
		display: flex;
		gap: 0.5rem;
	}

	.keyboard-toggle {
		background: var(--primary-color);
		border: none;
		border-radius: 8px;
		padding: clamp(0.4rem, 1.5vw, 0.6rem);
		color: #fff;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		min-height: 36px;
	}

	.keyboard-toggle:hover:not(:disabled) {
		background: var(--accent-color);
		transform: scale(1.05);
	}

	.keyboard-toggle:active {
		transform: scale(0.95);
	}

	.keyboard-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.numpad-grid {
		display: flex;
		flex-direction: column;
		gap: clamp(0.5rem, 2vw, 0.75rem);
	}

	.numpad-row {
		display: flex;
		gap: clamp(0.5rem, 2vw, 0.75rem);
	}

	.numpad-button {
		flex: 1;
		height: clamp(48px, 10vw, 55px); /* Adjusted for potentially more rows */
		border: 2px solid var(--primary-color);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font-size: clamp(1rem, 4vw, 1.4rem);
		font-weight: 600;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		position: relative;
		overflow: hidden;
	}

	.numpad-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
		transition: left 0.5s ease;
		opacity: 0.3;
	}

	.numpad-button:active:not(:disabled)::before {
		left: 100%;
	}

	.numpad-button:active:not(:disabled) {
		background: var(--primary-color);
		transform: scale(0.95);
		border-color: var(--accent-color);
	}

	.numpad-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		background: rgba(255, 255, 255, 0.02);
	}

	.numpad-button.special {
		background: var(--secondary-color);
		border-color: var(--secondary-color);
	}

	.numpad-button.special:active:not(:disabled) {
		background: var(--primary-color);
	}

	.enter-button {
		/* Styles for the Enter button */
		background: var(--primary-color);
		border-color: var(--primary-color);
		font-size: clamp(0.9rem, 3vw, 1.2rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.3s ease;
	}

	.enter-button.can-process {
		/* When Enter button can be pressed */
		background: var(--accent-color);
		border-color: var(--accent-color);
		box-shadow: 0 0 10px var(--accent-color);
	}

	.enter-button:active:not(:disabled) {
		background: var(--accent-color); /* Keep accent on active */
		border-color: var(--accent-color);
		transform: scale(0.95);
	}

	/* General disabled style for enter button will be inherited from .numpad-button:disabled */
	/* Override if specific disabled style for enter button is needed */
	.enter-button:disabled {
		opacity: 0.4; /* Slightly different opacity if needed */
		background: rgba(100, 100, 100, 0.2); /* Darker disabled background */
		border-color: rgba(120, 120, 120, 0.3);
		color: rgba(255, 255, 255, 0.3);
	}
	.enter-button.can-process:disabled {
		/* This case should ideally not happen if logic is correct */
		background: var(--primary-color); /* Revert if can-process but disabled by other means */
		border-color: var(--primary-color);
	}

	/* Device Keyboard Mode */
	.device-keyboard-mode {
		padding: clamp(0.75rem, 3vw, 1.5rem);
		text-align: center;
		max-width: 400px;
		margin: 0 auto;
	}

	.keyboard-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: clamp(0.75rem, 3vw, 1rem);
	}

	.mode-label {
		color: #ccc;
		font-size: clamp(0.85rem, 3vw, 1rem);
		font-weight: 500;
	}

	.keyboard-toggle.device {
		background: #666;
		border: 2px solid #999;
	}

	.keyboard-toggle.device:hover:not(:disabled) {
		background: #777;
		border-color: #bbb;
	}

	.device-input {
		width: 100%;
		padding: clamp(0.75rem, 3vw, 1rem);
		font-size: clamp(1.2rem, 4vw, 1.8rem);
		text-align: center;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid var(--primary-color);
		border-radius: 12px;
		color: #fff;
		font-family: 'Courier New', monospace;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.device-input:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.device-input.processing {
		opacity: 0.7;
		background: rgba(255, 255, 255, 0.02);
		border-color: var(--secondary-color);
	}

	.device-input:disabled {
		opacity: 0.5;
		background: rgba(255, 255, 255, 0.02);
		border-color: rgba(255, 255, 255, 0.2);
		cursor: not-allowed;
	}

	.device-input::placeholder {
		color: #666;
		font-weight: normal;
	}

	.processing-indicator {
		margin-top: 0.5rem;
		color: var(--secondary-color);
		font-size: clamp(0.8rem, 2.5vw, 0.9rem);
		font-style: italic;
	}

	/* State indicator for debugging */
	.state-indicator {
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

	.state-indicator div {
		margin-bottom: 0.1rem;
		white-space: nowrap;
	}

	/* Remove spinner arrows */
	.device-input::-webkit-outer-spin-button,
	.device-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.device-input[type='number'] {
		--moz-appearance: textfield;
	}

	/* Responsive Adjustments */
	@media (max-height: 700px) {
		/* Adjusted for potentially taller numpad */
		.numpad-button {
			height: clamp(40px, 8vw, 50px);
		}
		.numpad-container {
			max-height: 50vh;
		}
	}
	@media (max-height: 600px) {
		.numpad-button {
			height: clamp(38px, 7vw, 45px);
		}
		.numpad-container {
			max-height: 55vh; /* Allow more height if screen is short */
		}
		.numpad-grid {
			gap: clamp(0.25rem, 1.5vw, 0.5rem);
		}

		.numpad-row {
			gap: clamp(0.25rem, 1.5vw, 0.5rem);
		}
	}

	@media (max-width: 480px) {
		.numpad {
			padding: 0.5rem;
		}

		.input-display {
			padding: 0.75rem;
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.numpad-container {
			border-top-color: #fff;
			background: #000;
		}

		.numpad-button {
			border-color: #fff;
			background: #000;
		}

		.input-display {
			border-color: #fff;
			background: #000;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.numpad-button,
		.keyboard-toggle,
		.device-input,
		.input-value,
		.enter-button {
			/* Added enter-button */
			transition: none;
		}

		.numpad-button::before {
			display: none;
		}
	}
</style>
