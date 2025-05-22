<!-- src/lib/Typewriter.svelte -->
<script>
	export let text = '';
	export let speed = 75;

	let displayText = '';
	let index = 0;

	function type() {
		if (index < text.length) {
			displayText += text.charAt(index);
			index++;
			setTimeout(type, speed);
		}
	}

	$: {
		displayText = '';
		index = 0;
		type();
	}
</script>

<div>{displayText}</div>

<style>
	div {
		background-color: transparent;
		color: #eee;
		opacity: 1;
		font-size: larger;
	}
</style>
