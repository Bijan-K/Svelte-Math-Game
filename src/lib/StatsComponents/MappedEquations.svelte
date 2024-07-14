<script>
	import { misses, flawsVisibility } from '$lib/stores.js';
	import './style.css';
</script>

<div class="eq-container">
	<div class="row">
		<span class="title">Equation</span>
		<span class="title">Answer</span>
		<span class="title">Times</span>
	</div>

	{#each $misses as miss (miss)}
		<div class="row row-eq">
			<span class="eq">{miss.equation}</span>
			<span class={`eq blur b`}>{miss.answer}</span>
			<span class="eq">{miss.times}</span>
		</div>
	{/each}
</div>

<style>
	.eq-container {
		margin: 0 5%;
		transform: translateY(-1.5rem);
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
	}
	.row-eq {
		padding: 0.5rem 5%;
	}
	span {
		text-align: center;
	}
	.title {
		font-size: 1.7rem;
		font-family: lato;
	}
	.eq {
		transition: all 0.5s;
	}
</style>
