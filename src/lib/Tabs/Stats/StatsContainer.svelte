<!-- src/lib/tabs/stats/StatsContainer.svelte -->
<script>
	import Records from './Records.svelte';
	import AnalyticsPanel from './AnalyticsPanel.svelte';
	import MissedEquationsTable from './MissedEquationsTable.svelte';
	import PerformanceChart from './PerformanceChart.svelte';
	import SettingIcon from '$lib/Icons/SettingIcon.svelte';

	import { mobileMenuState, isMobile, missed_eq_list, record } from '$lib/stores.js';

	function changeStatus() {
		document.querySelector('.prime-container').classList.toggle('mobile-slide');
		mobileMenuState.update((n) => !n);
	}

	// Calculate comprehensive stats
	$: stats = calculateStats($missed_eq_list, $record);

	function calculateStats(missedList, records) {
		if (!missedList || !records) return null;

		// Basic counts
		const totalMissed = missedList.reduce((sum, eq) => sum + eq.times, 0);
		const uniqueProblems = missedList.length;

		// Most problematic operations
		const operationStats = {};
		missedList.forEach((eq) => {
			const operation = eq.equation.match(/[+\-×÷%^√]/)?.[0] || 'unknown';
			operationStats[operation] = (operationStats[operation] || 0) + eq.times;
		});

		// Difficulty distribution
		const difficultyStats = { easy: 0, medium: 0, hard: 0 };
		missedList.forEach((eq) => {
			if (eq.difficulty <= 2) difficultyStats.easy += eq.times;
			else if (eq.difficulty <= 3) difficultyStats.medium += eq.times;
			else difficultyStats.hard += eq.times;
		});

		// Recent performance (last 7 days)
		const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
		const recentMisses = missedList.filter((eq) => (eq.lastMissed || 0) > weekAgo);

		// Total games played estimation
		const totalScore = records.reduce((sum, record) => sum + record.count, 0);

		return {
			totalMissed,
			uniqueProblems,
			operationStats,
			difficultyStats,
			recentMisses: recentMisses.length,
			totalScore,
			averageScore: totalScore / 3,
			mostMissedEquation: missedList.sort((a, b) => b.times - a.times)[0],
			operationRanking: Object.entries(operationStats)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
		};
	}
</script>

<div class="stats-container">
	<div class="stats-header">
		<h1>Performance Analytics</h1>
		<p class="subtitle">Track your mental math journey</p>
	</div>

	<div class="stats-grid">
		<!-- Main Records Card -->
		<div class="card records-card">
			<h2>Best Scores</h2>
			<Records />
		</div>

		<!-- Analytics Overview -->
		<div class="card analytics-card">
			<h2>Quick Stats</h2>
			{#if stats}
				<AnalyticsPanel {stats} />
			{/if}
		</div>

		<!-- Performance Chart -->
		<div class="card chart-card">
			<h2>Difficulty Distribution</h2>
			{#if stats}
				<PerformanceChart {stats} />
			{/if}
		</div>

		<!-- Missed Equations Table -->
		<div class="card missed-card">
			<h2>Problem Areas</h2>
			<MissedEquationsTable />
		</div>
	</div>

	{#if $isMobile && !$mobileMenuState}
		<button class="mobile-menu-btn" on:click={changeStatus} aria-label="Open menu">
			<SettingIcon />
		</button>
	{/if}
</div>

<style>
	.stats-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100dvh;
		background: #000;
		overflow-y: auto;
		overflow-x: hidden;
		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		color: #e0e0e0;
	}

	@media (max-width: 768px) {
		.stats-container {
			width: 100vw;
			left: 0;
			right: auto;
		}
	}

	.stats-header {
		padding: 2rem 2rem 1rem;
		text-align: center;
		background: #111;
		color: white;
		margin-bottom: 1rem;
		border-bottom: 2px solid #333;
	}

	.stats-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		font-family: 'Inter', sans-serif;
		letter-spacing: -0.025em;
		color: #fff;
	}

	.subtitle {
		font-size: 1.1rem;
		opacity: 0.7;
		font-weight: 400;
		color: #ccc;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto auto;
		gap: 1.5rem;
		padding: 1.5rem;
		grid-template-areas:
			'records analytics'
			'chart chart'
			'missed missed';
		max-width: 100%;
		box-sizing: border-box;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
			grid-template-areas:
				'records'
				'analytics'
				'chart'
				'missed';
			padding: 1rem;
			gap: 1rem;
			margin: 0;
			width: 100%;
		}
	}

	.card {
		background: #111;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #333;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		min-width: 0; /* Prevents overflow in grid */
		overflow: hidden; /* Ensures content doesn't overflow */
	}

	@media (max-width: 768px) {
		.card {
			padding: 1rem;
			border-radius: 8px;
			margin: 0;
			width: 100%;
			box-sizing: border-box;
		}
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
		border-color: #555;
	}

	.card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 2.5rem;
		color: #f0f0f0;
		font-family: 'Inter', sans-serif;
	}

	.records-card {
		grid-area: records;
	}

	.analytics-card {
		grid-area: analytics;
	}

	.chart-card {
		grid-area: chart;
	}

	.missed-card {
		grid-area: missed;
	}

	.mobile-menu-btn {
		position: fixed;
		bottom: 2rem;
		left: 1.5rem;
		width: 56px;
		height: 56px;
		border-radius: 2px;
		border: 2px solid #555;
		background: #000;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 21;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mobile-menu-btn:hover {
		transform: scale(1.1);
		background: #333;
		border-color: #777;
	}

	.mobile-menu-btn:active {
		transform: scale(0.95);
	}

	/* Custom scrollbar */
	.stats-container::-webkit-scrollbar {
		width: 8px;
	}

	.stats-container::-webkit-scrollbar-track {
		background: #111;
	}

	.stats-container::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 4px;
	}

	.stats-container::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
