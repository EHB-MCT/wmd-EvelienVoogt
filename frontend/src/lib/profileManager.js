import { fetchSessionProfile } from "./profileApi.js";
import { TIPS_BY_LABEL } from "./tips.js";

const LABEL_PRIORITY = ["Procrastinator", "Indecisive", "Distracted", "Low Engagement", "Focused", "Engaged"];

export function createProfileManager() {
	let profile = null;
	let loading = false;
	let error = null;

	async function load() {
		try {
			loading = true;
			error = null;
			profile = await fetchSessionProfile();
			return profile;
		} catch (e) {
			error = e.message || "Failed to load profile";
			profile = null;
			throw e;
		} finally {
			loading = false;
		}
	}

	function getProfile() {
		return profile;
	}

	function getLabels() {
		return profile?.labels || [];
	}

	function getScores() {
		return profile?.scores || {};
	}

	function getMetrics() {
		return profile?.metrics || {};
	}

	function getState() {
		return { profile, loading, error };
	}

	function getDominantLabel() {
		const labels = getLabels();
		return LABEL_PRIORITY.find((l) => labels.includes(l)) || labels[0] || null;
	}

	function getTipLabel() {
		const dominant = getDominantLabel();
		if (dominant && TIPS_BY_LABEL[dominant]) {
			return dominant;
		}
		return "default";
	}

	function pickTip() {
		const label = getTipLabel();
		const list = TIPS_BY_LABEL[label] || TIPS_BY_LABEL.default;
		return list[Math.floor(Math.random() * list.length)];
	}

	return {
		load,
		getProfile,
		getLabels,
		getScores,
		getMetrics,
		getState,
		getDominantLabel,
		getTipLabel,
		pickTip,
	};
}
