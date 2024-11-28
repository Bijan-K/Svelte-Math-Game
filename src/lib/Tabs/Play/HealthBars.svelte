<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { cache } from '$lib/stores.js';

	let healthBars = $cache.hp;

	function updateHealthBars(newHp) {
		const currentBars = healthBars.length;
		if (newHp > currentBars) {
			// Add new health bars
			for (let i = currentBars; i < newHp; i++) {
				healthBars.push(tweened(100, { duration: 500, easing: cubicOut }));
			}
		} else if (newHp < currentBars) {
			// Remove health bars
			healthBars = healthBars.slice(0, newHp);
		}
		healthBars = healthBars; // Trigger reactivity
	}

	$: if ($cache.hp !== undefined) {
		updateHealthBars($cache.hp);
	}

	onMount(() => {
		updateHealthBars($cache.hp);
	});
</script>

<div class="health-bar-container">
	{#each healthBars as healthBar, i}
		<div class="health-bar">
			<div class="health-bar-fill" style="height: {healthBar}%;"></div>
		</div>
	{/each}
</div>

<style>
	.health-bar-container {
		display: flex;
		flex-direction: row-reverse;
		align-items: flex-end;
	}

	.health-bar {
		width: 30px;
		height: 100px;
		margin-right: 5px;
		transform: skew(-30deg) rotate(30deg);
		transform-origin: bottom;
		overflow: hidden;
		position: relative;
	}

	@media (max-width: 768px) {
		.health-bar {
			width: 10px;
			height: 33px;
		}
	}

	.health-bar-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top, white, red);
		transition: height 0.5s ease;
	}
</style>
