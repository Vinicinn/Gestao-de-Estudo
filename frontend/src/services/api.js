const URL = "https://gestao-de-estudo.onrender.com/api";
// em dev   - http://localhost:3001/api
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

    return data.message;
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
};
