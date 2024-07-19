<script>
	import { fade } from 'svelte/transition';
	import DiffSelect from './DiffSelect.svelte';
	import './style.css';
</script>

<div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }} class="play-aside">
	<h2>Diff</h2>

	<DiffSelect />
</div>

<style>
	h2 {
		padding: 1rem;
		padding-top: 2rem;
		text-align: center;
	}
	.play-aside {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
</style>
