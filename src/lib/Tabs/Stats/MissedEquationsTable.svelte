<!-- src/lib/tabs/stats/MissedEquationsTable.svelte -->
<script>
	import { missed_eq_list } from '$lib/stores.js';
	import VisibleIcon from '$lib/Icons/VisibleIcon.svelte';
	import NotVisibleIcon from '$lib/Icons/NotVisibleIcon.svelte';

	let showAnswers = false;
	let sortBy = 'times'; // 'times', 'difficulty', 'recent'
	let sortDirection = 'desc';

	$: sortedEquations = sortEquations($missed_eq_list, sortBy, sortDirection);

	function sortEquations(equations, sortBy, direction) {
		if (!equations || equations.length === 0) return [];

		const sorted = [...equations].sort((a, b) => {
			let aVal, bVal;

			switch (sortBy) {
				case 'times':
					aVal = a.times;
					bVal = b.times;
					break;
				case 'difficulty':
					aVal = a.difficulty || 1;
					bVal = b.difficulty || 1;
					break;
				case 'recent':
					aVal = a.lastMissed || 0;
					bVal = b.lastMissed || 0;
					break;
				default:
					aVal = a.times;
					bVal = b.times;
			}

			if (direction === 'asc') {
				return aVal - bVal;
			} else {
				return bVal - aVal;
			}
		});

		return sorted;
	}

	function toggleAnswers() {
		showAnswers = !showAnswers;
	}

	function handleSort(newSortBy) {
		if (sortBy === newSortBy) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = newSortBy;
			sortDirection = 'desc';
		}
	}

	function getDifficultyBadge(difficulty) {
		if (difficulty <= 2) return { text: 'Easy', class: 'easy' };
		if (difficulty <= 3) return { text: 'Medium', class: 'medium' };
		return { text: 'Hard', class: 'hard' };
	}

	function formatDate(timestamp) {
		if (!timestamp) return 'Unknown';
		return new Date(timestamp).toLocaleDateString();
	}

	function getSortIcon(column) {
		if (sortBy !== column) return '↕️';
		return sortDirection === 'asc' ? '↑' : '↓';
	}
</script>

<div class="table-container">
	<div class="table-header">
		<div class="table-controls">
			<button class="toggle-btn" on:click={toggleAnswers} class:active={showAnswers}>
				{#if showAnswers}
					<VisibleIcon />
				{:else}
					<NotVisibleIcon />
				{/if}
				<span>{showAnswers ? 'Hide' : 'Show'} Answers</span>
			</button>

			<div class="sort-info">
				Sorted by: <strong>{sortBy}</strong>
				<span class="sort-direction">({sortDirection === 'asc' ? 'ascending' : 'descending'})</span>
			</div>
		</div>
	</div>

	{#if sortedEquations.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🎯</div>
			<h3>Perfect Performance!</h3>
			<p>No missed equations yet. Keep up the great work!</p>
		</div>
	{:else}
		<div class="table-wrapper">
			<table class="equations-table">
				<thead>
					<tr>
						<th>
							<button class="sort-btn" on:click={() => handleSort('equation')}>
								Equation {getSortIcon('equation')}
							</button>
						</th>
						<th>
							<button class="sort-btn" on:click={() => handleSort('times')}>
								Misses {getSortIcon('times')}
							</button>
						</th>
						<th>
							<button class="sort-btn" on:click={() => handleSort('difficulty')}>
								Difficulty {getSortIcon('difficulty')}
							</button>
						</th>
						<th>
							<button class="sort-btn" on:click={() => handleSort('recent')}>
								Last Missed {getSortIcon('recent')}
							</button>
						</th>
						<th class="answer-column" class:hidden={!showAnswers}>Answer</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedEquations as equation, index}
						<tr class="equation-row" class:high-priority={equation.times >= 3}>
							<td class="equation-cell">
								<div class="equation-text">{equation.equation}</div>
							</td>
							<td class="count-cell">
								<div class="miss-count" class:critical={equation.times >= 5}>
									{equation.times}
								</div>
							</td>
							<td class="difficulty-cell">
								{#if equation.difficulty}
									{@const badge = getDifficultyBadge(equation.difficulty)}
									<span class="difficulty-badge {badge.class}">
										{badge.text}
									</span>
								{:else}
									<span class="difficulty-badge unknown">Unknown</span>
								{/if}
							</td>
							<td class="date-cell">
								<div class="date-text">{formatDate(equation.lastMissed)}</div>
							</td>
							<td class="answer-cell" class:hidden={!showAnswers} class:blur={!showAnswers}>
								<div class="answer-value">= {equation.answer}</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="table-footer">
			<div class="summary-stats">
				<span class="stat">
					<strong>{sortedEquations.length}</strong> unique problems
				</span>
				<span class="stat">
					<strong>{sortedEquations.reduce((sum, eq) => sum + eq.times, 0)}</strong> total misses
				</span>
				<span class="stat">
					<strong>{sortedEquations.filter((eq) => eq.times >= 3).length}</strong> need attention
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.table-container {
		width: 100%;
	}

	.table-header {
		margin-bottom: 1rem;
	}

	.table-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: #e0e0e0;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 0.9rem;
	}

	.toggle-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.toggle-btn.active {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		border-color: #3b82f6;
		color: white;
	}

	.sort-info {
		font-size: 0.85rem;
		color: #a0a0a0;
	}

	.sort-direction {
		font-weight: normal;
		opacity: 0.7;
	}

	.table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.02);
		width: 100%;
		max-width: 100%;
	}

	.equations-table {
		width: 100%;
		min-width: 500px; /* Minimum width to prevent cramping */
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.equations-table {
			min-width: 450px; /* Allows horizontal scroll on very small screens */
			font-size: 0.8rem;
		}

		.table-container {
			width: 100%;
			overflow-x: hidden;
		}
	}

	.equations-table th {
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #f0f0f0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sort-btn {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-weight: inherit;
		font-size: inherit;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		transition: color 0.2s ease;
	}

	.sort-btn:hover {
		color: #3b82f6;
	}

	.equations-table td {
		padding: 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.equation-row:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.equation-row.high-priority {
		background: rgba(239, 68, 68, 0.1);
		border-left: 3px solid #ef4444;
	}

	.equation-text {
		font-family: 'Courier New', monospace;
		font-weight: 600;
		font-size: 1rem;
	}

	.miss-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		font-weight: 700;
		color: #fbbf24;
	}

	.miss-count.critical {
		background: #ef4444;
		color: white;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.difficulty-badge.easy {
		background: #10b981;
		color: white;
	}

	.difficulty-badge.medium {
		background: #f59e0b;
		color: white;
	}

	.difficulty-badge.hard {
		background: #ef4444;
		color: white;
	}

	.difficulty-badge.unknown {
		background: #6b7280;
		color: white;
	}

	.date-text {
		font-size: 0.85rem;
		color: #a0a0a0;
	}

	.answer-cell {
		transition: all 0.3s ease;
	}

	.answer-cell.hidden {
		opacity: 0.3;
	}

	.answer-cell.blur {
		filter: blur(4px);
	}

	.answer-value {
		font-family: 'Courier New', monospace;
		font-weight: 600;
		color: #10b981;
	}

	.table-footer {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.summary-stats {
		display: flex;
		justify-content: space-around;
		text-align: center;
		gap: 1rem;
	}

	.stat {
		font-size: 0.9rem;
		color: #e0e0e0;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #a0a0a0;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: #e0e0e0;
	}

	.empty-state p {
		font-size: 1rem;
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.table-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.summary-stats {
			flex-direction: column;
			gap: 0.5rem;
		}

		.equations-table {
			font-size: 0.8rem;
		}

		.equations-table th,
		.equations-table td {
			padding: 0.5rem;
		}
	}
</style>
