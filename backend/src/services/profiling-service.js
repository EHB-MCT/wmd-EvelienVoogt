function buildProfile(events = []) {
	const metrics = computeMetrics(events);
	const scores = computeScores(metrics);

	return {
		metrics,
		scores,
		labels: scores.labels || [],
	};
}

function computeMetrics(events = []) {
	const eventCounts = events.reduce((acc, event) => {
		const type = event.type || "unknown";
		acc[type] = (acc[type] || 0) + 1;
		return acc;
	}, {});

	// Duration aggregates (tab blurs, idle_end etc.)
	const durationAgg = events.reduce(
		(acc, event) => {
			if (typeof event.duration_ms === "number") {
				acc.totalDurationMs += event.duration_ms;
				acc.countDurationMs += 1;
			}
			if (event.type === "tab_blur" && typeof event.duration_ms === "number") {
				acc.tabBlurDurationMs += event.duration_ms;
				acc.tabBlurCount += 1;
			}
			if (event.type === "idle_end" && typeof event.duration_ms === "number") {
				acc.idleDurationMs += event.duration_ms;
				acc.idleCount += 1;
			}
			return acc;
		},
		{ totalDurationMs: 0, countDurationMs: 0, tabBlurDurationMs: 0, tabBlurCount: 0, idleDurationMs: 0, idleCount: 0 }
	);

	const avgDurationMs = durationAgg.countDurationMs ? Math.round(durationAgg.totalDurationMs / durationAgg.countDurationMs) : 0;
	const avgTabBlurDurationMs = durationAgg.tabBlurCount ? Math.round(durationAgg.tabBlurDurationMs / durationAgg.tabBlurCount) : 0;
	const avgIdleDurationMs = durationAgg.idleCount ? Math.round(durationAgg.idleDurationMs / durationAgg.idleCount) : 0;

	return {
		totalEvents: events.length,
		eventCounts,

		// timer metrics
		timerStartCount: eventCounts["timer_start"] || 0,
		timerCompleteCount: eventCounts["timer_complete"] || 0,
		timerInterruptCount: eventCounts["timer_interrupt"] || 0,

		// task metrics
		taskCreateCount: eventCounts["task_create"] || 0,
		taskCompleteCount: eventCounts["task_complete"] || 0,
		taskDeleteCount: eventCounts["task_delete"] || 0,
		taskEditCount: eventCounts["task_edit"] || 0,

		// interaction metrics
		clickCount: eventCounts["click"] || 0,
		formSubmitCount: eventCounts["form_submit"] || 0,
		pageViewCount: eventCounts["page_view"] || 0,
		tabBlurCount: eventCounts["tab_blur"] || 0,
		tabFocusCount: eventCounts["tab_focus"] || 0,

		// idle
		idleStartCount: eventCounts["idle_start"] || 0,
		idleEndCount: eventCounts["idle_end"] || 0,

		// durations
		avgDurationMs,
		avgTabBlurDurationMs,
		avgIdleDurationMs,
	};
}

function computeScores(metrics) {
	const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

	const { totalEvents, clickCount, formSubmitCount, pageViewCount, tabBlurCount, tabFocusCount, timerStartCount, timerCompleteCount, timerInterruptCount, taskCreateCount, taskCompleteCount, taskEditCount, avgTabBlurDurationMs, avgIdleDurationMs } =
		metrics || {};

	const safeTotal = Math.max(1, totalEvents || 0);

	// Engagement: proportion of meaningful interactions
	const engagedActions = (clickCount || 0) * 1 + (formSubmitCount || 0) * 3 + (taskCompleteCount || 0) * 5 + (timerCompleteCount || 0) * 4 + (pageViewCount || 0) * 0.5;
	const engagementScore = clamp((engagedActions / safeTotal) * 100);

	// Focus: penalize tab blurs and timer interrupts
	const tabBlurFraction = (tabBlurCount || 0) / safeTotal;
	const timerInterruptFraction = timerStartCount ? (timerInterruptCount || 0) / Math.max(1, timerStartCount) : 0;
	let focusScore = 100 - (tabBlurFraction * 70 + timerInterruptFraction * 50);
	focusScore = clamp(focusScore);

	// Indecision: many created tasks left incomplete + many edits
	let indecisionScore = 0;
	if (taskCreateCount && taskCreateCount > 0) {
		const incompleteFrac = 1 - (taskCompleteCount || 0) / taskCreateCount;
		const editsPerTask = Math.min(1, (taskEditCount || 0) / taskCreateCount);
		indecisionScore = clamp((incompleteFrac * 0.7 + editsPerTask * 0.3) * 100);
	}

	// Procrastination: presence of interrupts, unfinished timers, tab blurs, and long idle/tab blur durations
	const unfinishedTimers = Math.max(0, (timerStartCount || 0) - (timerCompleteCount || 0));
	const procrastinationEvents = (timerInterruptCount || 0) + unfinishedTimers + (tabBlurCount || 0);
	const baseProcrastination = (procrastinationEvents / safeTotal) * 100;
	const idlePenalty = Math.min(1, (avgIdleDurationMs || 0) / 60000); // 60s baseline
	const tabBlurDurationPenalty = Math.min(1, (avgTabBlurDurationMs || 0) / 30000); // 30s baseline
	const procrastinationScore = clamp(baseProcrastination + idlePenalty * 30 + tabBlurDurationPenalty * 20);

	// Labels based on thresholds
	const labels = [];
	if (procrastinationScore > 60) labels.push("Procrastinator");
	else if (procrastinationScore > 30) labels.push("Occasional Procrastination");

	if (indecisionScore > 60) labels.push("Indecisive");
	else if (indecisionScore > 30) labels.push("Some Indecision");

	if (engagementScore > 60) labels.push("Engaged");
	else if (engagementScore < 30) labels.push("Low Engagement");

	if (focusScore > 60) labels.push("Focused");
	else if (focusScore < 40) labels.push("Distracted");

	return {
		procrastination: procrastinationScore,
		indecision: indecisionScore,
		engagement: engagementScore,
		focus: focusScore,
		labels,
	};
}

module.exports = {
	buildProfile,
};
