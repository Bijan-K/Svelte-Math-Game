<script>
	function addActive(diff) {
		console.log('lol');
		document.querySelector(`.${diff}`).classList.add(`active-${diff}`);
		console.log(document.querySelector(`.${diff}`));
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
		background-color: rgba(255, 255, 0, 0.516);
		box-shadow: 0px 0px 10px 5px #fddf47a2;
	}
	.high:hover {
		background-color: rgba(255, 0, 0, 0.717);
		box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.575);
	}
</style>
