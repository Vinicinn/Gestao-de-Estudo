const URL = "https://gestao-de-estudo.onrender.com/api";
// em dev   - /api (proxy via package.json para localhost:3001)
// em prod  - https://gestao-de-estudo.onrender.com/api

export const api = {
  async login({ name, password }) {
    const response = await fetch(`${URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async register(name, password) {
    const response = await fetch(`${URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.message;
  },

  async createContent({ userId, name, subject, difficulty }) {
    const response = await fetch(`${URL}/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, subject, difficulty }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async getUserContents(userId) {
    const response = await fetch(`${URL}/contents/user/${userId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  },

  async createSchedule({ userId, subject, topic, date, time, duration }) {
    const response = await fetch(`${URL}/reviews/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subject, topic, date, time, duration }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.message;
  },

  async getUserSchedules(userId) {
    const response = await fetch(`${URL}/reviews/schedule/user/${userId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  },

  async getUserRecommendations(userId) {
    const response = await fetch(`${URL}/contents/user/${userId}/recommendations`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  },
};
