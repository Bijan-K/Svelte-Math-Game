<!-- src/lib/aside/Aside.svelte -->
<script>
	import { fade } from 'svelte/transition';
	import { modeState, mobileMenuState, menuListIsClosed, isMobile } from '$lib/stores.js';
	import MinusIcon from '$lib/Icons/MinusIcon.svelte';
	import AddIcon from '$lib/Icons/AddIcon.svelte';
	import AsideSetting from './AsideSetting.svelte';
	import PlayAside from './PlayAside.svelte';

	$: $modeState;
	$: showAside = $modeState == 'play' || $modeState == 'about' || $modeState == 'stats';
	$: showMobileAside = $isMobile && $mobileMenuState && showAside;

	// Close mobile menu when clicking outside
	function handleBackdropClick() {
		if ($isMobile && $mobileMenuState) {
			mobileMenuState.set(false);
			document.querySelector('.prime-container')?.classList.remove('mobile-slide');
		}
	}

	// Handle escape key
	function handleKeydown(event) {
		if (event.key === 'Escape' && $isMobile && $mobileMenuState) {
			mobileMenuState.set(false);
			document.querySelector('.prime-container')?.classList.remove('mobile-slide');
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showAside}
	<!-- Mobile backdrop -->
	{#if showMobileAside}
		<div
			class="mobile-backdrop"
			on:click={handleBackdropClick}
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		></div>
	{/if}

	<div class="aside" class:mobile-open={showMobileAside} class:desktop={!$isMobile}>
		<div in:fade={{ duration: 200, delay: $isMobile ? 0 : 1500 }}>
			<h2>
				<MinusIcon />
				Quick Math
				<AddIcon />
			</h2>

			{#if $modeState == 'play'}
				<PlayAside />
			{:else if $modeState == 'stats'}
				<div class="placeholder-content">
					<p>Stats info will appear here</p>
				</div>
			{:else if $modeState == 'about'}
				<div class="placeholder-content">
					<p>About info will appear here</p>
				</div>
			{/if}

			<AsideSetting />
		</div>
	</div>
{/if}

<style>
	.aside {
		height: 100dvh;
		border-right: 1px solid #eee;
		width: 20vw;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 40;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.aside.desktop {
		transform: translateX(0);
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.aside {
			width: 90vw;
			transform: translateX(-100%);
			box-shadow: 2px 0 20px rgba(0, 0, 0, 0.5);
		}

		.aside.mobile-open {
			transform: translateX(0);
		}
	}

	.mobile-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100dvh;
		z-index: 39;
		backdrop-filter: blur(2px);
	}

	h2 {
		text-align: center;
		font-size: 2rem;
		padding: 0.5rem;
		color: #fff;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.placeholder-content {
		padding: 1rem;
		text-align: center;
		color: #999;
		font-style: italic;
	}

	/* Custom scrollbar for aside */
	.aside::-webkit-scrollbar {
		width: 6px;
	}

	.aside::-webkit-scrollbar-track {
		background: #111;
	}

	.aside::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 3px;
	}

	.aside::-webkit-scrollbar-thumb:hover {
		background: #555;
	}

	/* Prevent body scroll when mobile menu is open */
	:global(body:has(.aside.mobile-open)) {
		overflow: hidden;
	}
</style>
