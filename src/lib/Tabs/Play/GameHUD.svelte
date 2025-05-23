<!-- src/lib/tabs/play/GameHUD.svelte -->
<script>
	import { fade, slide } from 'svelte/transition';
	import { cache } from '$lib/stores.js';

	export let isGamePaused;
	export let onPause;
	export let onResume;
	export let onQuit;

	// Get difficulty-based colors
	$: difficultyColors = {
		ez: { start: '#10b981', end: '#ef4444' }, // green to red
		mid: { start: '#f59e0b', end: '#ef4444' }, // yellow to red
		high: { start: '#ef4444', end: '#7c2d12' } // red to dark red
	};

	$: currentColors = difficultyColors[$cache.diff] || difficultyColors.ez;

	function getHealthBarStyle(index, total) {
		const healthPercentage = ($cache.hp - index) / total;
		const opacity = index < $cache.hp ? 1 : 0.3;

		return `
			background: linear-gradient(to top, ${currentColors.start}, ${currentColors.end});
			opacity: ${opacity};
		`;
	}

	function handlePauseClick() {
		if (isGamePaused) {
			onResume();
		} else {
			onPause();
		}
	}
</script>

<div class="hud-container" role="complementary" aria-label="Game controls and status">
	<!-- Health Bars -->
	<div class="health-section" role="status" aria-label="Health remaining: {$cache.hp}">
		{#each Array(5) as _, i}
			{#if i < ($cache.diff === 'ez' ? 5 : $cache.diff === 'mid' ? 3 : 1)}
				<div
					class="health-bar"
					style={getHealthBarStyle(i, $cache.diff === 'ez' ? 5 : $cache.diff === 'mid' ? 3 : 1)}
					in:fade={{ duration: 200 }}
					out:slide={{ duration: 200 }}
					aria-hidden="true"
				></div>
			{/if}
		{/each}
	</div>

	<!-- Pause Button -->
	<button
		class="pause-button"
		class:paused={isGamePaused}
		on:click={handlePauseClick}
		aria-label={isGamePaused ? 'Resume game' : 'Pause game'}
		title={isGamePaused ? 'Resume (Enter)' : 'Pause (Space)'}
	>
		{#if isGamePaused}
			<!-- Play icon -->
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M8 5v14l11-7z" />
			</svg>
		{:else}
			<!-- Pause icon -->
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
			</svg>
		{/if}
	</button>

	<!-- Quit Button -->
	<button class="quit-button" on:click={onQuit} aria-label="Quit game" title="Quit Game (Escape)">
		<!-- X icon -->
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
			/>
		</svg>
	</button>
</div>

<style>
	.hud-container {
		position: absolute;
		bottom: 20px;
		right: 20px;
		display: flex;
		align-items: flex-end;
		gap: 12px;
		z-index: 10;
	}

	.health-section {
		display: flex;
		gap: 4px;
		align-items: flex-end;
	}

	.health-bar {
		width: 18px;
		height: 45px;
		transform: skew(-15deg);
		border-radius: 2px;
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.pause-button,
	.quit-button {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.8);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		backdrop-filter: blur(4px);
	}

	.pause-button:hover,
	.quit-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: white;
		transform: scale(1.05);
	}

	.pause-button:active,
	.quit-button:active {
		transform: scale(0.95);
	}

	.pause-button.paused {
		background: rgba(34, 197, 94, 0.8);
		border-color: #22c55e;
	}

	.pause-button.paused:hover {
		background: rgba(34, 197, 94, 0.9);
	}

	.quit-button {
		background: rgba(239, 68, 68, 0.8);
		border-color: #ef4444;
	}

	.quit-button:hover {
		background: rgba(239, 68, 68, 0.9);
	}

	@media (max-width: 768px) {
		.hud-container {
			bottom: 15px;
			right: 15px;
			gap: 8px;
		}

		.health-bar {
			width: 12px;
			height: 30px;
		}

		.pause-button,
		.quit-button {
			width: 32px;
			height: 32px;
		}
	}
</style>
