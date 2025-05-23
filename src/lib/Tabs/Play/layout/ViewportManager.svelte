<!-- src/lib/tabs/play/layout/ViewportManager.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { viewport, updateViewportState } from './viewportStore.js';

	let initialHeight = 0;
	let resizeTimeout;
	let keyboardCheckTimeout;

	// Viewport change callback for components that need immediate updates
	export let onViewportChange = () => {};

	function handleResize() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(updateViewportState, 100);
	}

	function handleVisualViewportChange() {
		clearTimeout(keyboardCheckTimeout);
		keyboardCheckTimeout = setTimeout(updateViewportState, 150);
	}

	function handleOrientationChange() {
		// Give time for orientation change to complete
		setTimeout(updateViewportState, 500);
	}

	// Call onViewportChange when viewport updates
	$: if ($viewport) {
		onViewportChange($viewport);
	}

	onMount(() => {
		// Initialize safe area CSS variables
		const style = document.createElement('style');
		style.textContent = `
			:root {
				--safe-area-inset-top: env(safe-area-inset-top, 0px);
				--safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
				--safe-area-inset-left: env(safe-area-inset-left, 0px);
				--safe-area-inset-right: env(safe-area-inset-right, 0px);
			}
		`;
		document.head.appendChild(style);

		// Set initial viewport state
		initialHeight = window.innerHeight;
		updateViewportState();

		// Set up event listeners
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleOrientationChange);

		// Listen for visual viewport changes (mobile keyboard)
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', handleVisualViewportChange);
		}

		return () => {
			document.head.removeChild(style);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleOrientationChange);

			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
			}

			clearTimeout(resizeTimeout);
			clearTimeout(keyboardCheckTimeout);
		};
	});

	onDestroy(() => {
		clearTimeout(resizeTimeout);
		clearTimeout(keyboardCheckTimeout);
	});
</script>

<!-- Debug info (only shown in development) -->
{#if false}
	{@const $viewportState = $viewport}
	<div class="debug-info">
		<div>Viewport: {$viewportState.width}×{$viewportState.height}</div>
		<div>Available: {$viewportState.availableHeight}px</div>
		<div>Mobile: {$viewportState.isMobile ? 'Yes' : 'No'}</div>
		<div>Keyboard: {$viewportState.isKeyboardOpen ? 'Open' : 'Closed'}</div>
		<div>
			Safe Areas: T:{$viewportState.safeAreaInsets.top} B:{$viewportState.safeAreaInsets.bottom}
		</div>
	</div>
{/if}

<style>
	.debug-info {
		position: fixed;
		top: 10px;
		left: 10px;
		background: rgba(0, 0, 0, 0.9);
		color: #00ff00;
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.75rem;
		z-index: 9999;
		pointer-events: none;
		border: 1px solid #333;
	}

	.debug-info div {
		margin-bottom: 0.25rem;
	}
</style>
