<script>
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';
	import { settingOpen } from '$lib/stores.js';
	import { slide } from 'svelte/transition';
	import './style.css';
	import SettingDirectories from './SettingDirectories.svelte';

	function changeStats() {
		settingOpen.update((n) => !n);
		document.querySelector('.gear').classList.toggle('spin');
	}
</script>

<div class="setting">
	<span class="gear" on:click={changeStats}>
		<SettingIcon />
	</span>

	<div class="directories">
		{#if $settingOpen}
			<span in:slide={{ axis: 'y', duration: 200 }} on:click={changeStats}>Directories</span>
		{:else}
			<SettingDirectories />
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
	span {
		position: relative;
		font-size: 1.8rem;
		font-weight: 600;
	}
</style>
