<script>
	import Records from './Records.svelte';
	import Header from './Header.svelte';
	import MappedEquations from './MappedEquations.svelte';
</script>

<div class="stats-container">
	<div class="holder">
		<!-- Title -->
		<h2>Stats</h2>

		<!-- Stats (records) -->
		<Records />

		<!-- Mistakes and Misses -->
		<Header />

		<!-- The Equations -->
		<MappedEquations />
	</div>
</div>

<style>
	.stats-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100vh;
		z-index: 20;
		background-color: #000;
	}
	.holder {
		padding: 0.75rem 2rem;
		display: flex;
		gap: 2rem;
		flex-direction: column;
	}
	h2 {
		font-size: 2.4rem;
		text-align: center;
		font-family: Merriweather;
	}
</style>
