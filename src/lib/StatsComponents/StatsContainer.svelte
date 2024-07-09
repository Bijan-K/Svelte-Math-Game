<script>
	import NotVisibleIcon from '../Icons/NotVisibleIcon.svelte';
	import VisibleIcon from '../Icons/VisibleIcon.svelte';

	import { flawsVisibility } from '$lib/stores.js';
</script>

<div class="stats-container">
	<div class="holder">
		<!-- Title -->
		<h2>Stats</h2>

		<!-- Stats (records) -->
		<div class="cardHolder">
			<div class="card"></div>
			<div class="card">mid</div>
			<div class="card">high</div>
		</div>

		<!-- Mistakes and Misses -->

		<div>
			<!-- Header -->
			<div>
				<h2>Mistakes</h2>
				<span>
					{#if $flawsVisibility}
						<VisibleIcon />
					{:else}
						<NotVisibleIcon />
					{/if}
				</span>
			</div>

			<!-- The Equations -->
			<div></div>
		</div>
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
		background-color: #111827;
	}
	.holder {
		padding: 0.75rem 2rem;
		display: flex;
		gap: 2rem;
		flex-direction: column;
	}
	h2 {
		font-size: 2.4rem;
	}
	.cardHolder {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}
	.card {
		place-self: center;
		width: 200px;
		height: 200px;
		box-shadow: -1px 1px 5px 0px #eee;
	}
</style>
