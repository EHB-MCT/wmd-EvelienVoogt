function buildProfile(events = []) {
  const metrics = computeMetrics(events);
  const scores = computeScores(metrics);

  return {
    metrics,
    scores,
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

    // timer metrics
    timerStartCount: eventCounts['timer_start'] || 0,
    timerCompleteCount: eventCounts['timer_complete'] || 0,
    timerInterruptCount: eventCounts['timer_interrupt'] || 0,

    // task metrics
    taskCreateCount: eventCounts['task_create'] || 0,
    taskCompleteCount: eventCounts['task_complete'] || 0,
    taskDeleteCount: eventCounts['task_delete'] || 0,
  };
}

function computeScores(metrics) {
  return {};
}

module.exports = {
  buildProfile,
};
