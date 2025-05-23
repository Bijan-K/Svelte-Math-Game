<!-- src/lib/tabs/play/MobileNumpad.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { cache, functionTriggerEnter, functionTriggerInput } from '$lib/stores.js';
	import { fade, slide } from 'svelte/transition';

	export let onRequestKeyboard = () => {};
	export let useDeviceKeyboard = false;

	let userInput = '';
	let numpadVisible = true;

	// Get difficulty-based theming
	$: difficultyTheme = {
		ez: { primary: '#10b981', secondary: '#065f46', accent: '#34d399' },
		mid: { primary: '#f59e0b', secondary: '#92400e', accent: '#fbbf24' },
		high: { primary: '#ef4444', secondary: '#991b1b', accent: '#f87171' },
		custom: { primary: '#8b5cf6', secondary: '#5b21b6', accent: '#a78bfa' }
	};

	$: currentTheme = difficultyTheme[$cache.diff] || difficultyTheme.ez;

	// Traditional phone numpad layout
	const numpadLayout = [
		[
			{ value: '1', label: '1' },
			{ value: '2', label: '2' },
			{ value: '3', label: '3' }
		],
		[
			{ value: '4', label: '4' },
			{ value: '5', label: '5' },
			{ value: '6', label: '6' }
		],
		[
			{ value: '7', label: '7' },
			{ value: '8', label: '8' },
			{ value: '9', label: '9' }
		],
		[
			{ value: '-', label: '±', special: true },
			{ value: '0', label: '0' },
			{ value: 'backspace', label: '⌫', special: true }
		]
	];

	function handleInput(value) {
		if (value === 'enter') {
			functionTriggerEnter.update((n) => true);
			functionTriggerInput.update((n) => true);
			userInput = '';
		} else if (value === 'backspace') {
			userInput = userInput.slice(0, -1);
			functionTriggerInput.update((n) => false);
			cache.update((n) => ({ ...n, userInput: userInput }));
		} else if (value === 'keyboard') {
			toggleKeyboardMode();
		} else {
			// Only allow minus at start
			if (value === '-' && userInput !== '') return;

			userInput += value;
			functionTriggerInput.update((n) => false);
			cache.update((n) => ({ ...n, userInput: userInput }));
		}
	}

	function toggleKeyboardMode() {
		useDeviceKeyboard = !useDeviceKeyboard;
		onRequestKeyboard(useDeviceKeyboard);

		if (useDeviceKeyboard) {
			// Focus a hidden input to trigger device keyboard
			const hiddenInput = document.getElementById('device-keyboard-trigger');
			if (hiddenInput) {
				hiddenInput.focus();
			}
		}
	}

	// Handle device keyboard input
	function handleDeviceKeyboard(event) {
		if (!useDeviceKeyboard) return;

		const key = event.target.value;
		if (key.match(/^-?\d*$/)) {
			userInput = key;
			cache.update((n) => ({ ...n, userInput: userInput }));
		}
	}

	function handleDeviceEnter(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleInput('enter');
			event.target.blur(); // Hide keyboard after submit
		}
	}

	// Listen for keyboard events when using device keyboard
	onMount(() => {
		function handleKeydown(e) {
			if (useDeviceKeyboard && e.key === 'Enter') {
				e.preventDefault();
				handleInput('enter');
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	// Sync userInput with store
	$: userInput = $cache.userInput || '';
</script>

<div class="numpad-container" class:hidden={useDeviceKeyboard}>
	{#if !useDeviceKeyboard}
		<div
			class="numpad"
			in:slide={{ duration: 300 }}
			style="--primary-color: {currentTheme.primary}; --secondary-color: {currentTheme.secondary}; --accent-color: {currentTheme.accent}"
			role="group"
			aria-label="Number input pad"
		>
			<!-- Input Display -->
			<div
				class="input-display"
				aria-live="polite"
				aria-label="Current input: {userInput || 'none'}"
			>
				<div class="input-value">{userInput || '0'}</div>
				<button
					class="keyboard-toggle"
					on:click={() => handleInput('keyboard')}
					aria-label="Switch to device keyboard"
					title="Use device keyboard"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"
						/>
					</svg>
				</button>
			</div>

			<!-- Number Grid -->
			<div class="numpad-grid">
				{#each numpadLayout as row, rowIndex}
					<div class="numpad-row" role="row">
						{#each row as button}
							<button
								class="numpad-button"
								class:special={button.special}
								on:click={() => handleInput(button.value)}
								aria-label={button.value === '-'
									? 'Negative sign'
									: button.value === 'backspace'
										? 'Delete'
										: `Number ${button.value}`}
								role="button"
								tabindex="-1"
							>
								{button.label}
							</button>
						{/each}
					</div>
				{/each}

				<!-- Enter Button (spans full width) -->
				<div class="numpad-row">
					<button
						class="numpad-button enter-button"
						on:click={() => handleInput('enter')}
						aria-label="Submit answer"
						role="button"
						tabindex="-1"
					>
						Enter
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Device Keyboard Mode -->
		<div class="device-keyboard-mode" in:fade={{ duration: 200 }}>
			<div class="keyboard-info">
				<span>Using device keyboard</span>
				<button
					class="keyboard-toggle device"
					on:click={() => handleInput('keyboard')}
					aria-label="Switch to custom numpad"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
						/>
					</svg>
				</button>
			</div>

			<input
				id="device-keyboard-trigger"
				type="number"
				inputmode="numeric"
				pattern="-?\d*"
				value={userInput}
				on:input={handleDeviceKeyboard}
				on:keydown={handleDeviceEnter}
				placeholder="Enter answer..."
				aria-label="Math answer input"
				class="device-input"
				autocomplete="off"
			/>
		</div>
	{/if}
</div>

<style>
	.numpad-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 20;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(10px);
		border-top: 2px solid var(--primary-color, #666);
		transition: all 0.3s ease;
	}

	.numpad-container.hidden {
		transform: translateY(100%);
		opacity: 0;
		pointer-events: none;
	}

	.numpad {
		padding: 1rem;
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
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.input-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #fff;
		font-family: 'Courier New', monospace;
		min-height: 1.5rem;
		flex: 1;
	}

	.keyboard-toggle {
		background: var(--primary-color);
		border: none;
		border-radius: 8px;
		padding: 0.5rem;
		color: #fff;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.keyboard-toggle:hover {
		background: var(--accent-color);
		transform: scale(1.05);
	}

	.keyboard-toggle:active {
		transform: scale(0.95);
	}

	.numpad-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.numpad-row {
		display: flex;
		gap: 0.75rem;
	}

	.numpad-button {
		flex: 1;
		height: 60px;
		border: 2px solid var(--primary-color);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font-size: 1.3rem;
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

	.numpad-button:active::before {
		left: 100%;
	}

	.numpad-button:active {
		background: var(--primary-color);
		transform: scale(0.95);
		border-color: var(--accent-color);
	}

	.numpad-button.special {
		background: var(--secondary-color);
		border-color: var(--secondary-color);
	}

	.numpad-button.special:active {
		background: var(--primary-color);
	}

	.enter-button {
		background: var(--primary-color);
		border-color: var(--primary-color);
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.enter-button:active {
		background: var(--accent-color);
		border-color: var(--accent-color);
	}

	/* Device Keyboard Mode */
	.device-keyboard-mode {
		padding: 1rem;
		text-align: center;
	}

	.keyboard-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		color: #ccc;
		font-size: 0.9rem;
	}

	.keyboard-toggle.device {
		background: #666;
		border: 2px solid #999;
	}

	.keyboard-toggle.device:hover {
		background: #777;
		border-color: #bbb;
	}

	.device-input {
		width: 100%;
		max-width: 300px;
		padding: 1rem;
		font-size: 1.5rem;
		text-align: center;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid var(--primary-color, #666);
		border-radius: 12px;
		color: #fff;
		font-family: 'Courier New', monospace;
	}

	.device-input:focus {
		outline: none;
		border-color: var(--accent-color, #999);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.device-input::placeholder {
		color: #666;
	}

	/* Remove spinner arrows for number input */
	.device-input::-webkit-outer-spin-button,
	.device-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.device-input[type='number'] {
		-moz-appearance: textfield;
	}

	@media (max-width: 480px) {
		.numpad {
			padding: 0.75rem;
		}

		.numpad-button {
			height: 55px;
			font-size: 1.2rem;
		}

		.input-value {
			font-size: 1.3rem;
		}
	}

	@media (max-height: 600px) {
		.numpad-button {
			height: 50px;
		}

		.numpad-grid {
			gap: 0.5rem;
		}

		.numpad-row {
			gap: 0.5rem;
		}
	}
</style>
