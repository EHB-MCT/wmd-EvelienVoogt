function buildProfile(events = []) {
	const metrics = computeMetrics(events);

	return {
		metrics,
		scores: {},
		labels: [],
	};
}


function computeMetrics(events = []) {
  const eventCounts = events.reduce((acc, event) => {
    const type = event.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    eventCounts,
    timerStartCount: eventCounts['timer_start'] || 0,
    timerCompleteCount: eventCounts['timer_complete'] || 0,
    timerInterruptCount: eventCounts['timer_interrupt'] || 0,
  };
}

function computeScores(metrics) {
  return {};
}

module.exports = {
  buildProfile,
};