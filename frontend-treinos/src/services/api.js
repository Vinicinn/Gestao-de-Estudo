const API_BASE = import.meta.env.VITE_API_URL || "/api/recomendacao-treinos";

function getToken() {
  return localStorage.getItem("treinosToken");
}

function setToken(token) {
  localStorage.setItem("treinosToken", token);
}

function clearToken() {
  localStorage.removeItem("treinosToken");
}

async function request(path, options = {}, withAuth = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (withAuth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Erro na requisicao");
  }

  return data;
}

export const api = {
  getToken,
  clearToken,

  async register({ name, email, password }) {
    return await request(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      false,
    );
  },

  async login({ email, password }) {
    const data = await request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    );

    setToken(data.token);
    return data;
  },

  async me() {
    return await request("/auth/me");
  },

  async getWorkouts() {
    return await request("/workouts");
  },

  async addWorkout(payload) {
    return await request("/workouts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async completeWorkout(workoutId, payload) {
    return await request(`/workouts/${workoutId}/complete`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async skipWorkout(workoutId, payload) {
    return await request(`/workouts/${workoutId}/skip`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async setFavorite(workoutId, favorite) {
    return await request(`/workouts/${workoutId}/favorite`, {
      method: "PUT",
      body: JSON.stringify({ favorite }),
    });
  },

  async reviewWorkout(workoutId, payload) {
    return await request(`/workouts/${workoutId}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteWorkout(workoutId) {
    return await request(`/workouts/${workoutId}`, { method: "DELETE" });
  },

  async getRecommendations() {
    return await request("/workouts/recommendations");
  },

  async getProfile() {
    return await request("/profile");
  },

  async saveProfile(payload) {
    return await request("/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getHistory() {
    return await request("/history");
  },

  async getHistorySummary() {
    return await request("/history/summary");
  },
};
