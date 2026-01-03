function buildProfile(events = []) {
	return {
		metrics: {
			totalEvents: events.length,
		},
		scores: {},
		labels: [],
	};
}

module.exports = {
	buildProfile,
};
