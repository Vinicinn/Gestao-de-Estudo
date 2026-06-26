const API_BASE = import.meta.env.VITE_API_URL || "/api/recomendacao-livros";

function getToken() {
  return localStorage.getItem("livrosToken");
}

function setToken(token) {
  localStorage.setItem("livrosToken", token);
}

function clearToken() {
  localStorage.removeItem("livrosToken");
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
    throw new Error(data.error || data.message || "Erro na requisição");
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

  async getBooks() {
    return await request("/books");
  },

  async addBook(payload) {
    return await request("/books", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async markAsRead(bookId, payload) {
    return await request(`/books/${bookId}/read`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async abandonBook(bookId, payload) {
    return await request(`/books/${bookId}/abandon`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async setFavorite(bookId, favorite) {
    return await request(`/books/${bookId}/favorite`, {
      method: "PUT",
      body: JSON.stringify({ favorite }),
    });
  },

  async reviewBook(bookId, payload) {
    return await request(`/books/${bookId}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteBook(bookId) {
    return await request(`/books/${bookId}`, { method: "DELETE" });
  },

  async getRecommendations() {
    return await request("/books/recommendations");
  },

  async getPreferences() {
    return await request("/preferences");
  },

  async savePreferences(payload) {
    return await request("/preferences", {
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
