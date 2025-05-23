<!-- src/lib/tabs/play/PlayModeContainer.svelte -->
<script>
	import CounterZone from './CounterZone.svelte';
	import GameContainer from './GameContainer.svelte';
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';

	import { mobileMenuState, isMobile } from '$lib/stores.js';
	import MobileNumpad from './MobileNumpad.svelte';

	let useDeviceKeyboard = false;
	let gameContainerRef;

	function changeStatus() {
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
	}

	function handleKeyboardRequest(useDevice) {
		useDeviceKeyboard = useDevice;

		// Notify game container about keyboard mode change
		if (gameContainerRef) {
			gameContainerRef.updateKeyboardMode(useDevice);
		}
	}
</script>

<div id="playcontainerid" class="hideBG">
	<div class="game-area" class:keyboard-mode={useDeviceKeyboard}>
		<GameContainer bind:this={gameContainerRef} {useDeviceKeyboard} />
	</div>

	{#if $isMobile}
		<MobileNumpad onRequestKeyboard={handleKeyboardRequest} {useDeviceKeyboard} />
	{/if}

	<CounterZone />

	{#if $isMobile && !$mobileMenuState}
		<span class="menu" on:click={changeStatus}>
			<SettingIcon />
		</span>
	{/if}
</div>

<style>
	.menu {
		position: fixed;
		bottom: 2rem;
		left: 1.5rem;
		font-size: 2.2rem;
		transition: all 0.5s ease;
		transform: translateY(5%);
		z-index: 21;
	}

	.game-area {
		position: absolute;
		top: 0;
		right: 0;
		height: 85dvh;
		width: 80vw;
		transition: all 0.3s ease;
	}

	.game-area.keyboard-mode {
		height: calc(85dvh - 60px); /* Account for device keyboard space */
	}

	#playcontainerid {
		width: 80vw;
		height: 100dvh;
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 3;
		transition: all 0.5s;
	}

	@media (max-width: 768px) {
		#playcontainerid {
			width: 100vw;
		}

		.game-area {
			width: 100vw;
			height: 68dvh;
		}

		.game-area.keyboard-mode {
			height: calc(68dvh - 40px);
		}
	}

	/* Smooth transitions for keyboard mode */
	@media (max-width: 768px) and (orientation: landscape) {
		.game-area.keyboard-mode {
			height: calc(100vh - 120px); /* More space in landscape */
		}
	}
</style>
