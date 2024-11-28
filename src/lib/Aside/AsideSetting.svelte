<script>
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';
	import { menuListIsClosed, mobileMenuState } from '$lib/stores.js';
	import { slide } from 'svelte/transition';

	import SettingDirectories from './SettingDirectories.svelte';

	function changeStatus() {
		if ($menuListIsClosed == false) {
			document.querySelector('.prime-container').classList.toggle('mobile-slide');
			mobileMenuState.update((n) => !n);
		}

		menuListIsClosed.update((n) => !n);
		document.querySelector('.menu').classList.toggle('spin');
	}
</script>

<div class="setting">
	<span class="menu" on:click={changeStatus}>
		<SettingIcon />
	</span>

	<div class="directories">
		{#if $menuListIsClosed}
			<span in:slide={{ axis: 'y', duration: 200 }} on:click={changeStatus}>Directories</span>
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

	.menu {
		position: absolute;
		left: 10px;
		bottom: 5px;
		font-size: 2.2rem;
		transition: all 0.5s ease;
		transform: translateY(5%);
		z-index: 21;
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
