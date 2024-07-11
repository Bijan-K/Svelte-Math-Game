<script>
	import CounterZone from '$lib/PlayMode/CounterZone.svelte';
	import GameContainer from './GameContainer.svelte';
</script>

<div id="playcontainerid" class="">
	<GameContainer />

	<CounterZone />
</div>

<style>
	#playcontainerid {
		width: 80vw;
		height: 100vh;
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 3;
	}
</style>
