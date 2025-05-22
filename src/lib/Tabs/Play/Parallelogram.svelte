<!-- src/lib/Tabs/Play/Parallelogram.svelte -->
<script>
	export let width = 20;
	export let height = 40;
	export let skew = -20;
</script>

<div
	class="parallelogram"
	style="--width: {width}px; --height: {height}px; --skew: {skew}deg;"
></div>

<style>
	.parallelogram {
		width: var(--width);
		height: var(--height);
		transform: skew(var(--skew));
		background: linear-gradient(to bottom, red, white);
		position: relative;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.parallelogram {
			width: 10px;
			height: 33px;
		}
	}

	.parallelogram::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: inherit;
		transform: skew(calc(var(--skew) * -1));
	}
</style>
