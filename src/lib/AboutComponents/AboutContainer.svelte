<script>
	import GithubIcon from '../Icons/GithubIcon.svelte';
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
			<a href="">
				<GithubIcon />
			</a>
		</section>

		<footer>
			<div>Made by Bijan</div>
		</footer>
	</div>
</div>

<style>
	.about-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100vh;
		z-index: 20;
		background-color: #000;
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
