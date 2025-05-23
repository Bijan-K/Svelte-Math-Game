<!-- src/lib/tabs/play/layout/ResponsiveGameLayout.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import ViewportManager from './ViewportManager.svelte';
	import { viewport } from './viewportStore.js';

	// Props
	export let showAside = false;

	// Layout state
	let layoutContainer;
	let currentLayout = 'desktop';

	// Reactive layout updates
	$: currentLayout = $viewport.isMobile ? 'mobile' : 'desktop';

	// Handle viewport changes
	function handleViewportChange(viewportState) {
		if (layoutContainer) {
			layoutContainer.style.setProperty('--dynamic-height', `${viewportState.availableHeight}px`);
		}
	}

	onMount(() => {
		// Ensure proper height on mount
		if (layoutContainer) {
			layoutContainer.style.setProperty('--dynamic-height', `${window.innerHeight}px`);
		}
	});
</script>

<!-- Viewport Manager handles all responsive logic -->
<ViewportManager onViewportChange={handleViewportChange} />

<div
	bind:this={layoutContainer}
	class="game-layout {currentLayout}"
	class:with-aside={showAside}
	class:keyboard-open={$viewport.isKeyboardOpen}
>
	<!-- Main Game Container -->
	<main class="layout-main">
		<!-- Game Field - where equations appear -->
		<section class="layout-game-field">
			<slot name="game-field" />
		</section>

		<!-- Control Panel - unified bottom area -->
		<section class="layout-control-panel">
			<slot name="control-panel" />
		</section>
	</main>

	<!-- Mobile Aside Overlay -->
	{#if showAside && $viewport.isMobile}
		<div class="layout-mobile-aside">
			<slot name="mobile-aside" />
		</div>
	{/if}

	<!-- Full Screen Overlays (modals, game start, etc.) -->
	<div class="layout-overlay">
		<slot name="overlay" />
	</div>
</div>

<style>
	/* Base Layout Container - Fixed to prevent overflow */
	.game-layout {
		position: fixed;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: #000;
		color: #fff;
		overflow: hidden;
		transition: all 0.5s;
	}

	/* Mobile Layout */
	.game-layout.mobile {
		width: 100vw;
		left: 0;
		right: auto;
	}

	/* Main Container */
	.layout-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 100%;
	}

	/* Game Field - Main play area */
	.layout-game-field {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: #000;
		min-height: 0; /* Important for flexbox */
	}

	/* Control Panel - Bottom area with score/controls */
	.layout-control-panel {
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.95);
		border-top: 1px solid #333;
		height: clamp(80px, 12vh, 120px);
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 20;
		overflow: hidden;
		padding-top: 0.5rem;
	}

	/* Mobile Aside Overlay */
	.layout-mobile-aside {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		background: rgba(0, 0, 0, 0.95);
		z-index: 100;
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.layout-mobile-aside.visible {
		transform: translateX(0);
	}

	/* Full Screen Overlays */
	.layout-overlay {
		position: fixed;
		top: 0;
		width: 80vw;
		height: 100%;
		z-index: 10;
		pointer-events: none;
	}

	.layout-overlay:has(*) {
		pointer-events: auto;
	}

	/* Keyboard Adjustments */
	.game-layout.keyboard-open.mobile {
		height: var(--dynamic-height, 100vh);
	}

	.game-layout.keyboard-open .layout-control-panel {
		height: clamp(60px, 8vh, 80px);
	}

	/* Safe Area Support */
	.layout-main {
		padding-left: env(safe-area-inset-left, 0);
		padding-right: env(safe-area-inset-right, 0);
	}

	.layout-control-panel {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	/* Responsive Typography */
	.game-layout {
		font-size: clamp(14px, 2.5vw, 18px);
	}

	/* Animation & Transitions */
	.layout-main,
	.layout-control-panel {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.layout-main,
		.layout-control-panel,
		.layout-mobile-aside {
			transition: none;
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.layout-control-panel {
			border-top-color: #fff;
		}
	}

	/* Landscape Mobile Adjustments */
	@media (max-height: 500px) and (orientation: landscape) {
		.layout-control-panel {
			height: 60px;
		}
	}

	/* Ensure proper stacking context */
	.game-layout {
		z-index: 20;
	}

	/* Prevent touch bounce on iOS */
	.game-layout {
		-webkit-overflow-scrolling: touch;
		position: fixed;
		touch-action: none;
	}

	.layout-game-field {
		touch-action: manipulation;
	}
</style>
