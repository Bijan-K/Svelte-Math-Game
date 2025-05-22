<!-- src/lib/Aside/Components/DiffSelect.svelte -->
<script>
	import { selectedDiff, cache, mobileMenuState, menuListIsClosed } from '$lib/stores.js';

	let hp_data = {
		ez: 5,
		mid: 3,
		high: 1
	};

	function addActive(diff) {
		if ($cache.gameState == false) {
			document.querySelector('.ez').classList.remove('active-ez');
			document.querySelector('.mid').classList.remove('active-mid');
			document.querySelector('.high').classList.remove('active-high');

			document.querySelector(`.${diff}`).classList.add(`active-${diff}`);
			selectedDiff.update((n) => diff);
			cache.update((n) => ({ ...n, diff: diff, hp: hp_data[diff] }));

			document.querySelector('.prime-container').classList.toggle('mobile-slide');
			mobileMenuState.update((n) => !n);

			menuListIsClosed.update((n) => true);
			document.querySelector('.menu').classList.toggle('spin');
		}
	}
</script>

<div class="diffHolder">
	<div class="mode ez" on:click={() => addActive('ez')}>Ez</div>
	<div class="mode mid" on:click={() => addActive('mid')}>Mid</div>
	<div class="mode high" on:click={() => addActive('high')}>High</div>
</div>

<style>
	.diffHolder {
		padding: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.5rem;
	}
	.mode {
		width: 8rem;
		padding: 0.75rem 1.5rem;
		border: 2px #eee solid;
		text-align: center;
	}
	.ez:hover {
		background-color: rgba(0, 123, 82, 0.858);
		box-shadow: 0px 0px 10px 5px rgba(104, 255, 205, 0.685);
		cursor: pointer;
	}
	.mid:hover {
		background-color: rgba(255, 255, 0, 0.614);
		box-shadow: 0px 0px 10px 5px rgba(255, 255, 0, 0.751);
		cursor: pointer;
	}
	.high:hover {
		background-color: rgba(255, 0, 0, 0.717);
		box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.575);
		cursor: pointer;
	}
</style>
