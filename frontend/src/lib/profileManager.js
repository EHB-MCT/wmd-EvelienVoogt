import { fetchSessionProfile } from "./profileApi.js";

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

  return {
    load,
    getProfile,
    getLabels,
    getScores,
    getMetrics,
    getState,
  };
}
