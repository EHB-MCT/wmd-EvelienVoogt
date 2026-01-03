function buildProfile(events = []) {
  const eventCounts = events.reduce((acc, event) => {
    const type = event.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    metrics: {
      totalEvents: events.length,
      eventCounts,
    },
    scores: {},
    labels: [],
  };
}

module.exports = {
  buildProfile,
};
