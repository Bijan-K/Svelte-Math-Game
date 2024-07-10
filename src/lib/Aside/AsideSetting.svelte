<script>
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';
	import { settingOpen, modeState } from '$lib/stores.js';
	import { slide } from 'svelte/transition';
	import './style.css';

	function changeStats() {
		settingOpen.update((n) => !n);
		document.querySelector('.gear').classList.toggle('spin');
	}
	function changeMode(mode) {
		modeState.update((n) => mode);
		// changeStats();
	}
</script>

<div class="setting">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span class="gear" on:click={changeStats}>
		<SettingIcon />
	</span>

	<div class="directories">
		{#if $settingOpen}
			<span in:slide={{ axis: 'y', duration: 200 }} on:click={changeStats}>Directories</span>
		{:else}
			<div class="directories" in:slide={{ axis: 'y', duration: 200 }}>
				<span class="dir" on:click={() => changeMode('play')}>Play</span>
				<span class="dir" on:click={() => changeMode('stats')}>Stats</span>
				<span class="dir" on:click={() => changeMode('about')}>About</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.setting {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 3px solid #eee;
		border-radius: 0.2rem;
		width: 90%;
		margin-bottom: 2rem;
	}
	.setting:hover {
		cursor: pointer;
	}

	span {
		font-size: 1.8rem;
		font-weight: 600;
	}

	.gear {
		position: absolute;
		left: 10px;
		bottom: 5px;
		font-size: 2.2rem;
		transition: all 0.5s ease;
		transform: translateY(5%);
	}

	.directories {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: start;
		gap: 10px;
		padding: 0.25rem;
	}

	.dir:hover {
		text-decoration: underline;
	}
</style>
