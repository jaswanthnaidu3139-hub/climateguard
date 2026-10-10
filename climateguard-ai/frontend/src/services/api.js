const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Request Failed [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/api/health'),
  getLocations: () => request('/api/locations'),
  getWeather: (locationId) => request(`/api/weather?location_id=${encodeURIComponent(locationId)}`),
  getClimateHistory: (locationId, startDate, endDate) =>
    request(`/api/climate/history?location_id=${encodeURIComponent(locationId)}&start_date=${startDate}&end_date=${endDate}`),
  getRisk: (locationId) => request(`/api/risk?location_id=${encodeURIComponent(locationId)}`),
  simulateWhatIf: (payload) =>
    request('/api/risk/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRecommendations: (locationId) =>
    request(`/api/recommendations?location_id=${encodeURIComponent(locationId)}`),
  compareLocations: (locationIds) => {
    const ids = Array.isArray(locationIds) ? locationIds.join(',') : locationIds;
    return request(`/api/compare?location_ids=${encodeURIComponent(ids)}`);
  },
  getRiskHistory: (locationId, limit = 20) =>
    request(`/api/risk/${encodeURIComponent(locationId)}/history?limit=${limit}`),
};
