<!-- src/lib/tabs/about/AboutContainer.svelte -->
<script>
	import GithubIcon from '$lib/Icons/GithubIcon.svelte';
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';

	import { mobileMenuState, isMobile } from '$lib/stores.js';

	function changeStatus() {
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
	}
</script>

<div class="about-container">
	<div class="holder">
		<!-- Title -->
		<h2>About</h2>

		<section>
			<p>Simple app for brushing up mental math every now and then.</p>
		</section>

		<section>
			<p>Source Code:</p>
			<a href="https://github.com/Bijan-K/Svelte-Math-Game" rel="noopener noreferrer">
				<GithubIcon />
			</a>
		</section>

		<footer>
			<div>Made by Bijan</div>
		</footer>

		{#if $isMobile && !$mobileMenuState}
			<span class="menu" on:click={changeStatus}>
				<SettingIcon />
			</span>
		{/if}
	</div>
</div>

<style>
	.menu {
		position: fixed;
		bottom: 2rem;
		left: 1.5rem;
		font-size: 2.2rem;
		transition: all 0.5s ease;
		transform: translateY(5%);
		z-index: 21;
	}

	.about-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100dvh;
		z-index: 20;
		background-color: #000;
		transition: all 0.5s;
	}

	@media (max-width: 768px) {
		.about-container {
			width: 100vw;
		}
	}

	.holder {
		padding: 0.75rem 2rem;
		display: flex;
		gap: 2rem;
		flex-direction: column;
		font-family: Merriweather;
	}
	h2 {
		font-size: 3.4rem;
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: start;
		color: #eee;
		gap: 1rem;
	}
	section a {
		color: #eee;
		font-size: x-large;
	}
</style>
