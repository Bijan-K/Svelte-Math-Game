<script>
	import DiffSelect from './DiffSelect.svelte';
	import './style.css';

	let hideBG = false;

	function hideBackground() {
		hideBG = !hideBG;
		let playBG = document.getElementById('playcontainerid');
		playBG.classList.toggle('hideBG');
	}
</script>

<div class="play-aside">
	<h2>Diff</h2>

	<DiffSelect />

	<div on:click={hideBackground} class="hide-bg-btn">{hideBG ? 'Show' : 'Hide'} Background</div>
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

	.hide-bg-btn {
		font-family: lato;
	}
	.hide-bg-btn:hover {
		cursor: pointer;
	}
</style>
