<script>
	import CounterZone from '$lib/PlayMode/CounterZone.svelte';
	import GameContainer from './GameContainer.svelte';
</script>

<div id="playcontainerid" class="hideBG">
	<div class="set">
		<GameContainer />
	</div>

	<CounterZone />
</div>

<style>
	.set {
		position: absolute;
		top: 0;
		right: 0;
		height: 85vh;
		width: 80vw;
	}
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
