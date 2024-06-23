<script>
	import { onMount } from 'svelte';
	import TagCloud from 'tagcloud';

	let tags = [
		{ text: '15 * 14 = 210', weight: 10 },
		{ text: '45 / 5 = 9', weight: 10 },
		{ text: '37 + 26 = 63', weight: 10 },
		{ text: '81 - 27 = 54', weight: 10 },
		{ text: '12 * 16 = 192', weight: 10 },
		{ text: '144 / 12 = 12', weight: 10 },
		{ text: '58 + 42 = 100', weight: 10 },
		{ text: '100 - 47 = 53', weight: 10 },
		{ text: '23 * 7 = 161', weight: 10 },
		{ text: '96 / 8 = 12', weight: 10 },
		{ text: '48 * 5 = 240', weight: 10 },
		{ text: '72 / 6 = 12', weight: 10 },
		{ text: '68 + 37 = 105', weight: 10 },
		{ text: '92 - 38 = 54', weight: 10 },
		{ text: '14 * 13 = 182', weight: 10 },
		{ text: '120 / 10 = 12', weight: 10 },
		{ text: '55 + 45 = 100', weight: 10 },
		{ text: '130 - 50 = 80', weight: 10 },
		{ text: '19 * 11 = 209', weight: 10 },
		{ text: '84 / 7 = 12', weight: 10 },
		{ text: '27 * 15 = 405', weight: 10 },
		{ text: '180 / 15 = 12', weight: 10 },
		{ text: '75 + 25 = 100', weight: 10 },
		{ text: '150 - 60 = 90', weight: 10 },
		{ text: '21 * 18 = 378', weight: 10 },
		{ text: '108 / 9 = 12', weight: 10 },
		{ text: '47 + 53 = 100', weight: 10 },
		{ text: '130 - 45 = 85', weight: 10 },
		{ text: '16 * 14 = 224', weight: 10 },
		{ text: '240 / 20 = 12', weight: 10 },
		{ text: '63 + 37 = 100', weight: 10 },
		{ text: '170 - 85 = 85', weight: 10 },
		{ text: '12 * 15 = 180', weight: 10 },
		{ text: '144 / 12 = 12', weight: 10 },
		{ text: '51 + 49 = 100', weight: 10 },
		{ text: '200 - 100 = 100', weight: 10 },
		{ text: '18 * 12 = 216', weight: 10 },
		{ text: '216 / 18 = 12', weight: 10 },
		{ text: '38 + 62 = 100', weight: 10 },
		{ text: '190 - 75 = 115', weight: 10 },
		{ text: '22 * 9 = 198', weight: 10 },
		{ text: '270 / 15 = 18', weight: 10 },
		{ text: '65 + 35 = 100', weight: 10 },
		{ text: '210 - 95 = 115', weight: 10 },
		{ text: '24 * 8 = 192', weight: 10 },
		{ text: '192 / 8 = 24', weight: 10 },
		{ text: '42 + 58 = 100', weight: 10 },
		{ text: '250 - 110 = 140', weight: 10 },
		{ text: '13 * 20 = 260', weight: 10 },
		{ text: '260 / 13 = 20', weight: 10 }
	];

	onMount(() => {
		const container = document.getElementById('tag-cloud');
		TagCloud(
			container,
			tags.map((tag) => tag.text),
			{
				// Add TagCloud options here
				radius: 1000,
				maxSpeed: 'fast',
				initSpeed: 'normal',
				direction: 135,
				keep: true
			}
		);
	});
</script>

<div id="tag-cloud" class="unselectable"></div>

<style>
	#tag-cloud {
		width: 100%;
		height: 400px;
		position: fixed;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
	}

	.unselectable {
		-webkit-user-select: none; /* Safari 3.1+ */
		-moz-user-select: none; /* Firefox 1.0+ */
		-ms-user-select: none; /* IE 10+ */
		user-select: none; /* Standard syntax */
	}
</style>
