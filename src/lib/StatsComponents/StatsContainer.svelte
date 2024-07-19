<script>
	import Records from './Records.svelte';
	import Header from './Header.svelte';
	import MappedEquations from './MappedEquations.svelte';
	import SettingIcon from '../Icons/SettingIcon.svelte';

	import { mobileMenuState, isMobile } from '$lib/stores.js';

	function changeStats() {
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
	}
</script>

<div class="stats-container">
	<div class="holder">
		<!-- Title -->
		<h2>Stats</h2>

		<!-- Stats (records) -->
		<Records />

		<!-- Mistakes and Misses -->
		<Header />

		<!-- The Equations -->
		<MappedEquations />
	</div>

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

	.stats-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100dvh;
		z-index: 20;
		overflow-y: scroll;
		transition: all 0.5s;
	}

	@media (max-width: 768px) {
		.stats-container {
			width: 100vw;
			overflow-x: hidden;
		}
		.holder {
			transform: translateX(5%);
		}
	}

	.holder {
		padding: 0.75rem 2rem;
		display: flex;
		gap: 2rem;
		flex-direction: column;
		overflow: scroll;
	}
	h2 {
		font-size: 2.4rem;
		text-align: center;
		font-family: Merriweather;
	}
</style>
