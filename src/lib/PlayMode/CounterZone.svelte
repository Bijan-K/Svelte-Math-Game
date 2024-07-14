<script>
	import { cache } from '$lib/stores.js';
	import HealthBars from './HealthBars.svelte';

	let toggleShow = false;

	$: isTrue = $cache.diff === 'high';

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			toggleShow = false;
		} else {
			toggleShow = true;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="counter-container">
	<div class="container">
		<div class:user-input={toggleShow} class="counter">
			{#if !$cache.gameState}
				<!-- game diff -->
				<h2 class:high={isTrue}>{$cache.diff.toUpperCase()}</h2>
			{:else}
				<!-- input and score -->
				{#if toggleShow}
					<h2>{$cache.userInput}</h2>
				{:else}
					<h2 class:high={isTrue}>Score : {$cache.score}</h2>
				{/if}
			{/if}
		</div>

		<div class="heath-bars">
			<HealthBars />
		</div>
	</div>
</div>

<style>
	.heath-bars {
		position: absolute;
		right: 10px;
		bottom: 10px;
	}
	h2 {
		min-height: 2rem;
	}

	.counter-container {
		width: 80vw;
		height: 12vh;
		min-height: 12vh;
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 3;
	}
	.container {
		border-top: 1px #eee solid;
		width: 90%;
		padding: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.counter {
		border-bottom: solid #eee 2px;
		border-left: solid #eee 2px;
		border-right: solid #eee 2px;
		border-radius: 0.25rem;
		padding: 0.5rem 2rem;
	}
	.user-input {
		border-bottom: solid #eee 2px;
		border-left: none;
		border-right: none;
	}

	.high {
		animation: flash 0.5s linear infinite alternate;
	}

	@keyframes flash {
		0% {
			color: #eee;
		}
		100% {
			color: #ff0000;
		}
	}
</style>
