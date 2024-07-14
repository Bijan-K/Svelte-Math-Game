<script>
	import { record } from '$lib/stores.js';
</script>

<div class="cardHolder">
	<!-- Card -->
	{#each $record as diff (diff)}
		<div class="card">
			<div class="title">
				<h3>{diff.diff.toUpperCase()}</h3>
			</div>

			<div class="record">
				<h4>{diff.count}</h4>
				<p>-- Record --</p>
			</div>

			<h5 class="date">{diff.date}</h5>
		</div>
	{/each}
</div>

<style>
	.cardHolder {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}
	.card {
		place-self: center;
		width: 200px;
		height: 200px;
		box-shadow: -2px 2px 5px 1px #eee;
		border-radius: 2px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}
	h3 {
		font-family: Roboto;

		text-align: center;
		font-size: x-large;
	}

	h4 {
		font-family: 'Courier New';
		text-align: center;
		font-size: x-large;
	}
	p {
		font-family: 'Courier New';

		text-align: center;
		font-size: large;
	}
	h5 {
		font-family: 'Courier New';
		text-align: center;
		font-size: large;
	}
</style>
