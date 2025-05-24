<!-- src/lib/tabs/play/GameOver.svelte -->
<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	let phase = 'expanding'; // 'expanding', 'resetting', 'contracting', or 'merged'
	const leftLine = tweened(0, { duration: 1000, easing: cubicInOut });
	const rightLine = tweened(0, { duration: 1000, easing: cubicInOut });
	const leftFromEdge = tweened(0, { duration: 1000, easing: cubicInOut });
	const rightFromEdge = tweened(0, { duration: 1000, easing: cubicInOut });
	const mergedLine = tweened(0, { duration: 500, easing: cubicInOut });

	onMount(() => {
		animate();
	});

	async function animate() {
		while (true) {
			// Expanding phase
			phase = 'expanding';
			await Promise.all([leftLine.set(50), rightLine.set(50)]);

			await new Promise((resolve) => setTimeout(resolve, 500)); // Pause at full extension

			// Reset phase (lines disappear)
			phase = 'resetting';
			await new Promise((resolve) => setTimeout(resolve, 10)); // Pause while invisible

			// Contracting phase (lines start from sides)
			phase = 'contracting';
			leftFromEdge.set(0);
			rightFromEdge.set(0);
			await Promise.all([leftFromEdge.set(100), rightFromEdge.set(100)]);
		}
	}
</script>

<div class="game-over">
	<h1>Game Over</h1>
	<div class="lines">
		{#if phase === 'expanding'}
			<div class="line left" style="width: {$leftLine}%"></div>
			<div class="line right" style="width: {$rightLine}%"></div>
		{:else if phase === 'contracting'}
			<div class="line left-from-edge" style="width: {$leftFromEdge}%"></div>
			<div class="line right-from-edge" style="width: {$rightFromEdge}%"></div>
		{:else if phase === 'merged'}
			<div class="line merged" style="width: {$mergedLine}%"></div>
		{/if}
	</div>
</div>

<style>
	.game-over {
		text-align: center;
		padding: 20px;
		font-family: Arial, sans-serif;
		background-color: #000; /* Dark background to make white lines visible */
	}

	h1 {
		font-size: 3em;
		margin-bottom: 10px;
		color: #fff;
	}

	.lines {
		position: relative;
		height: 4px;
		width: 100%;
		max-width: 300px;
		margin: 0 auto;
	}

	.line {
		position: absolute;
		height: 4px;
		background-color: #fff;
	}

	.left {
		right: 50%;
		transform-origin: right;
	}

	.right {
		left: 50%;
		transform-origin: left;
	}

	.left-from-edge {
		left: 0;
	}

	.right-from-edge {
		right: 0;
	}

	.merged {
		left: 50%;
		transform: translateX(-50%);
	}
</style>
