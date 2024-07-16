<script>
	import ArrowIcon from '../Icons/ArrowIcon.svelte';

	import { slide } from 'svelte/transition';
	import { mobileMenuState } from '$lib/stores.js';
	import { modeState } from '$lib/stores.js';

	let isHovered = {
		parent1: false,
		parent2: false,
		parent3: false
	};
	function changeMode(mode) {
		modeState.update((n) => mode);

		document.querySelector(`.play-dir`).classList.remove('underline');
		document.querySelector(`.stats-dir`).classList.remove('underline');
		document.querySelector(`.about-dir`).classList.remove('underline');

		document.querySelector(`.${mode}-dir`).classList.add('underline');
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
		console.log($mobileMenuState);

		// changeStats();
	}

	function handleHover(parentId) {
		isHovered[parentId] = !isHovered[parentId];
	}
</script>

<div class="directories" in:slide={{ axis: 'y', duration: 200 }}>
	<span
		on:mouseover={() => handleHover('parent1')}
		on:mouseout={() => handleHover('parent1')}
		class="dir play-dir"
		on:click={() => changeMode('play')}
	>
		<span class:hovered={isHovered.parent1} class="arrow">
			<ArrowIcon />
		</span>

		Play</span
	>
	<span
		on:mouseover={() => handleHover('parent2')}
		on:mouseout={() => handleHover('parent2')}
		class="dir stats-dir"
		on:click={() => changeMode('stats')}
	>
		<span class:hovered={isHovered.parent2} class="arrow">
			<ArrowIcon />
		</span>

		Stats</span
	>
	<span
		on:mouseover={() => handleHover('parent3')}
		on:mouseout={() => handleHover('parent3')}
		class="dir about-dir"
		on:click={() => changeMode('about')}
	>
		<span class:hovered={isHovered.parent3} class="arrow">
			<ArrowIcon />
		</span>

		About</span
	>
</div>

<style>
	.directories {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: start;
		gap: 10px;
		padding: 0.25rem;
	}
	.dir {
		position: relative;
		font-size: 1.8rem;
		font-weight: 600;
	}
	.dir:hover {
		text-decoration: underline;
	}

	.arrow {
		position: absolute;
		left: 0;
		transform: translateX(-100%);
		display: none;
	}
	.hovered {
		display: inline;
	}
</style>
