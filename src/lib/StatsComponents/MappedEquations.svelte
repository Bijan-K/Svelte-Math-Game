<script>
	import { missed_eq_list } from '$lib/stores.js';
	import './style.css';
</script>

<div class="eq-container">
	<div class="row row-eq">
		<span class="title eq-eq">Equation</span>
		<span class="title eq-times">Times</span>
		<span class="title beq">Answer</span>
	</div>

	{#each $missed_eq_list as miss (miss)}
		<div class="row row-eq">
			<span class="eq eq-eq">{miss.equation}</span>
			<span class="eq eq-times">{miss.times}</span>
			<span class={`eq blur b`}>{miss.answer}</span>
		</div>
	{/each}
</div>

<style>
	.eq-container {
		margin: 0 5%;
		transform: translateY(-1.5rem);
		overflow: visible;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
	}
	.row-eq {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr;

		padding: 0.5rem 5%;
	}

	.eq-eq {
		place-self: start;
	}
	.beq {
		place-self: end;
	}
	.b {
		place-self: end;
	}
	.eq-times {
		place-self: center;
	}

	span {
		text-align: center;
	}
	.title {
		font-size: 1.7rem;
		font-family: lato;
	}
	.eq {
		transition: all 0.2s;
		font-size: calc(32px +1vw);
	}
</style>
