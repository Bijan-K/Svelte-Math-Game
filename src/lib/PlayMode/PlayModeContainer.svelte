<script>
	import CounterZone from '$lib/PlayMode/CounterZone.svelte';
	import GameContainer from './GameContainer.svelte';
	import SettingIcon from '../Icons/SettingIcon.svelte';

	import { mobileMenuState, isMobile } from '$lib/stores.js';
	import MobileNumpad from './MobileNumpad.svelte';

	function changeStats() {
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
	}
</script>

<div id="playcontainerid" class="hideBG">
	<div class="set">
		<GameContainer />
	</div>

	{#if $isMobile}
		<MobileNumpad />
	{/if}

	<CounterZone />

	{#if $isMobile && !$mobileMenuState}
		<span class="gear" on:click={changeStats}>
			<SettingIcon />
		</span>
	{/if}
</div>

<style>
	.gear {
		position: fixed;
		bottom: 2rem;
		left: 1.5rem;
		font-size: 2.2rem;
		transition: all 0.5s ease;
		transform: translateY(5%);
		z-index: 21;
	}

	.set {
		position: absolute;
		top: 0;
		right: 0;
		height: 85dvh;
		width: 80vw;
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
		.set {
			width: 100vw;
			height: 68dvh;
		}
	}
</style>
