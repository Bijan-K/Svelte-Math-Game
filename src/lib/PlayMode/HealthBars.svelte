<script>
	import { onMount, afterUpdate } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// Assuming you have a store named 'cache' with a 'healthBars' property
	import { cache } from '$lib/stores.js';

	let healthBars = [];
	let prevHealthBars = 0;

	$: if ($cache.healthBars !== prevHealthBars) {
		updateHealthBars($cache.healthBars);
	}

	function updateHealthBars(newCount) {
		const diff = newCount - healthBars.length;
		if (diff > 0) {
			// Add new health bars
			for (let i = 0; i < diff; i++) {
				healthBars.push(tweened(100, { duration: 500, easing: cubicOut }));
			}
		} else if (diff < 0) {
			// Remove health bars
			healthBars = healthBars.slice(0, newCount);
		}
		healthBars = healthBars; // Trigger reactivity
		prevHealthBars = newCount;
	}

	onMount(() => {
		updateHealthBars($cache.hp);
	});
</script>

<div class="health-bar-container">
	{#each healthBars as healthBar, i}
		<div class="health-bar" style="--health: {healthBar}%;">
			<div class="health-bar-fill"></div>
		</div>
	{/each}
</div>

<style>
	.health-bar-container {
		display: flex;
		flex-direction: row-reverse;
		align-items: flex-end;
		height: 200px;
		padding: 10px;
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

	.health-bar-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--health);
		background: linear-gradient(to top, white, red);
		transition: height 0.5s ease;
	}
</style>
