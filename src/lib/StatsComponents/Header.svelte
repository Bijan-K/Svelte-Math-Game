<script>
	// icons
	import NotVisibleIcon from '../Icons/NotVisibleIcon.svelte';
	import VisibleIcon from '../Icons/VisibleIcon.svelte';

	import { flawsVisibility } from '$lib/stores.js';

	function changeVisibility() {
		flawsVisibility.update((n) => !n);
		let b = document.querySelectorAll('.b');
		b.forEach((element) => {
			element.classList.toggle('blur');
		});
	}
</script>

<div class="header-container">
	<!-- Header -->
	<div class="header">
		<h2>Misses</h2>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span on:click={changeVisibility} class="ico">
			{#if $flawsVisibility}
				<VisibleIcon />
			{:else}
				<NotVisibleIcon />
			{/if}
		</span>
	</div>
</div>

<style>
	.header-container {
		border-bottom: 1px #eee solid;
		margin: 0 5%;
	}
	.header {
		margin: 1rem 2%;

		display: flex;
		justify-content: space-between;
	}

	.ico {
		transform: scale(150%);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.ico:hover {
		cursor: pointer;
	}
</style>
