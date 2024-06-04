<script>
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	let mode = true;
</script>

{#if mode == 'play' || mode == 'about' || mode == 'stats'}
	<aside in:fly>
		{#if mode == 'play'}
			<ul>
				<li>
					<a href="/">play</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>

				<li>
					<a href="/stats">Stats</a>
				</li>
				<li></li>
			</ul>
			<div></div>
		{:else if mode == 'stats'}
			<ul>
				<li>
					<a href="/">play</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>

				<li>
					<a href="/stats">Stats</a>
				</li>
				<li></li>
			</ul>
			<div></div>
		{:else if mode == 'about'}
			<ul>
				<li>
					<a href="/">play</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>

				<li>
					<a href="/stats">Stats</a>
				</li>
				<li></li>
			</ul>
			<div></div>
		{/if}
	</aside>
{/if}

<style>
	aside {
		height: 100vh;
		border-right: 1px solid #eee;
		width: 20%;
		position: relative;
		left: 0;
		top: 0;
		background-color: #000;
	}
</style>
