<!-- src/lib/tabs/play/input/MobileNumpad.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache, mobileMenuState } from '$lib/stores.js';
	import { viewport } from '../layout/viewportStore.js';
	import { fade, slide } from 'svelte/transition';
	import { inputStateMachine } from './InputStateMachine.js';
	import { score, health, maxHealth, pauseGame } from '$lib/stores/gameStore.js';
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';

	export let onRequestKeyboard = () => {};
	export let useDeviceKeyboard = false;

	// Input state from state machine
	let inputState = inputStateMachine.getState();
	let unsubscribeInput = null;

	// Device input element reference
	let inputElement;

	// Store subscriptions
	let healthUnsubscribe;
	let scoreUnsubscribe;

	// Get difficulty-based theming
	$: difficultyTheme = getDifficultyTheme($cache.diff);

	// Show numpad when on mobile and game is active
	$: showNumpad = $viewport.isMobile && $cache.gameState;

	// Determine current mode from state machine
	$: isNumpadMode = inputState.mode === 'mobile-numpad';
	$: isKeyboardMode = inputState.mode === 'mobile-keyboard';

	// Get current health and score
	$: currentHealth = $health;
	$: currentMaxHealth = $maxHealth;
	$: currentScore = $score;
	$: healthPercentage = currentMaxHealth > 0 ? (currentHealth / currentMaxHealth) * 100 : 0;

	// Generate HP segments reactively
	$: hpSegments = (() => {
		const segments = [];
		for (let i = 0; i < currentMaxHealth; i++) {
			const isActive = i < currentHealth;
			segments.push({
				active: isActive,
				percentage: 100 / currentMaxHealth,
				index: i
			});
		}
		return segments;
	})();

	// Force update when health changes
	$: healthKey = `${currentHealth}-${currentMaxHealth}`;

	// Numpad layout - traditional phone style with Enter and Menu buttons
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
		]
		// Enter and Menu buttons will be handled separately for custom layout
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

	function toggleAside() {
		// Pause the game when opening menu
		if (!$mobileMenuState && $cache.gameState) {
			pauseGame();
		}

		// Toggle mobile menu state
		mobileMenuState.update((n) => !n);
		// Apply the slide class to move game content
		const primeContainer = document.querySelector('.prime-container');
		if (primeContainer) {
			primeContainer.classList.toggle('mobile-slide');
		}
		// Haptic feedback
		if ('vibrate' in navigator) {
			navigator.vibrate(20);
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
				<!-- Input Display with Score -->
				<div
					class="input-display"
					aria-live="polite"
					aria-label="Current input: {inputState.input || 'none'}"
				>
					<div class="display-content">
						<div class="score-display">
							SCORE: <span class="score-value">{currentScore}</span>
						</div>
						<div class="input-value" class:processing={inputState.isProcessing}>
							{inputState.input || '0'}
						</div>
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
									on:click={() => handleInput(button.value)}
									aria-label={button.title || `${button.type} ${button.label}`}
									title={button.title}
									disabled={!$cache.gameState || inputState.isProcessing}
								>
									{button.label}
								</button>
							{/each}
						</div>
					{/each}

					<!-- Bottom row with Enter and Menu buttons -->
					<div class="numpad-row bottom-row">
						<button
							class="numpad-button menu-button"
							on:click={toggleAside}
							aria-label="Toggle menu"
							title="Menu"
						>
							<SettingIcon />
						</button>
						<button
							class="numpad-button enter-button"
							class:can-process={inputState.canProcess}
							on:click={() => handleInput('enter')}
							aria-label="Submit Answer"
							title="Submit Answer"
							disabled={!$cache.gameState || inputState.isProcessing || !inputState.canProcess}
							style="--health-percentage: {healthPercentage}%"
							data-health-key={healthKey}
						>
							<div class="enter-content">
								<span class="enter-text">ENTER</span>
								<!-- HP segments background -->
								{#key healthKey}
									<div class="hp-segments">
										{#each hpSegments as segment (segment.index)}
											<div
												class="hp-segment"
												class:active={segment.active}
												style="width: {segment.percentage}%"
											></div>
										{/each}
									</div>
								{/key}
							</div>
						</button>
					</div>
				</div>
			</div>
		{:else if isKeyboardMode}
			<!-- Device Keyboard Mode -->
			<div class="device-keyboard-mode" in:fade={{ duration: 200 }}>
				<div class="keyboard-info">
					<span class="mode-label">Device Keyboard</span>
					<div class="keyboard-stats">
						<span class="score-display">SCORE: {currentScore}</span>
						<span class="health-display">HP: {currentHealth}/{currentMaxHealth}</span>
					</div>
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
		max-height: 55vh;
		overflow: hidden;
	}

	.numpad-container.device-mode {
		max-height: 25vh;
	}

	.numpad {
		padding: clamp(0.5rem, 2vw, 1rem);
		max-width: 400px;
		margin: 0 auto;
	}

	.input-display {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid var(--primary-color);
		border-radius: 12px;
		padding: clamp(0.5rem, 2vw, 0.75rem);
		margin-bottom: clamp(0.5rem, 2vw, 1rem);
		transition: all 0.3s ease;
		min-height: 48px;
	}

	.input-display:has(.processing) {
		border-color: var(--secondary-color);
		background: rgba(255, 255, 255, 0.02);
	}

	.display-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
	}

	.score-display {
		font-size: clamp(0.7rem, 2vw, 0.8rem);
		color: var(--accent-color);
		font-weight: 600;
		letter-spacing: 0.05em;
		font-family: 'Courier New', monospace;
	}

	.score-value {
		color: #fff;
		font-weight: 700;
	}

	.input-value {
		font-size: clamp(1.2rem, 4vw, 1.6rem);
		font-weight: 600;
		color: #fff;
		font-family: 'Courier New', monospace;
		transition: all 0.3s ease;
		line-height: 1;
	}

	.input-value.processing {
		opacity: 0.7;
		color: var(--secondary-color);
	}

	.input-actions {
		display: flex;
		align-items: center;
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

	.bottom-row {
		display: flex;
		gap: clamp(0.5rem, 2vw, 0.75rem);
	}

	.numpad-button {
		flex: 1;
		height: clamp(45px, 9vw, 52px);
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

	.game-field.mobile .equation-element {
		width: 100px;
		height: 70px;
		padding: 6px;
		border-radius: 6px;
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
		z-index: 1;
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

	/* Enter Button with HP Bar */
	.enter-button {
		flex: 3;
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--primary-color);
		position: relative;
		overflow: hidden;
		padding: 0;
	}

	.enter-content {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}

	.enter-text {
		font-size: clamp(0.9rem, 3vw, 1.2rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #fff;
		z-index: 3;
		position: relative;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.hp-segments {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		z-index: 1;
	}

	.hp-segment {
		height: 100%;
		border-right: 1px solid rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.02);
		transition: all 0.3s ease;
	}

	.hp-segment:last-child {
		border-right: none;
	}

	.hp-segment.active {
		background: linear-gradient(to top, var(--primary-color), var(--accent-color));
		box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2);
		animation: hpPulse 0.3s ease-out;
	}

	@keyframes hpPulse {
		0% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	.enter-button.can-process {
		border-color: var(--accent-color);
		box-shadow: 0 0 10px var(--accent-color);
	}

	.enter-button:active:not(:disabled) {
		transform: scale(0.95);
	}

	.enter-button:disabled {
		opacity: 0.4;
		border-color: rgba(120, 120, 120, 0.3);
	}

	/* Menu Button */
	.menu-button {
		flex: 1;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
		font-size: 1.5rem;
		max-width: 60px;
	}

	.menu-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.menu-button:active:not(:disabled) {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(0.95);
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
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.mode-label {
		color: #ccc;
		font-size: clamp(0.85rem, 3vw, 1rem);
		font-weight: 500;
	}

	.keyboard-stats {
		display: flex;
		gap: 1rem;
		font-size: clamp(0.8rem, 2.5vw, 0.9rem);
		font-family: 'Courier New', monospace;
		color: var(--accent-color);
		font-weight: 600;
	}

	.health-display {
		color: var(--primary-color);
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

	/* Remove spinner arrows */
	.device-input::-webkit-outer-spin-button,
	.device-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.device-input[type='number'] {
		-moz-appearance: textfield;
	}

	/* Responsive Adjustments */
	@media (max-height: 700px) {
		.numpad-button {
			height: clamp(40px, 8vw, 48px);
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
			max-height: 55vh;
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
			padding: 0.5rem;
		}

		.menu-button {
			max-width: 50px;
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

		.hp-segment {
			border-right-color: #fff;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.numpad-button,
		.keyboard-toggle,
		.device-input,
		.input-value,
		.enter-button,
		.hp-segment {
			transition: none;
		}

		.numpad-button::before {
			display: none;
		}
	}
</style>
