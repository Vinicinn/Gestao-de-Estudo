const URL = process.env.NODE_ENV === "development"
  ? "/api"
  : "https://gestao-de-estudo.onrender.com/api";
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

  async createSchedule({ userId, subject, topic, date, time }) {
    const response = await fetch(`${URL}/reviews/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subject, topic, date, time }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.message;
  },

  async completeReview({ userId, contentId, reviewDate }) {
    const response = await fetch(`${URL}/reviews/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, contentId, reviewDate }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async getUserSchedules(userId) {
    const response = await fetch(`${URL}/reviews/schedule/user/${userId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  },

  async getUserReviewHistory(userId) {
    const response = await fetch(`${URL}/reviews/user/${userId}/history`);
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

  async submitReviewFeedback({
    userId,
    contentId,
    reviewDate,
    understandingScore,
    perceivedDifficulty,
    note,
  }) {
    const response = await fetch(`${URL}/feedback/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        contentId,
        reviewDate,
        understandingScore,
        perceivedDifficulty,
        note,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async getUserReviewFeedback(userId, filters = {}) {
    const params = new URLSearchParams();

    if (filters.subject) {
      params.append("subject", filters.subject);
    }
    if (filters.from) {
      params.append("from", filters.from);
    }
    if (filters.to) {
      params.append("to", filters.to);
    }

    const query = params.toString();
    const response = await fetch(`${URL}/feedback/review/user/${userId}${query ? `?${query}` : ""}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async uncompleteReview(reviewId) {
    const response = await fetch(`${URL}/reviews/complete/${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async completeSchedule(scheduleId) {
    const response = await fetch(`${URL}/reviews/schedule/${scheduleId}/complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async uncompleteSchedule(scheduleId) {
    const response = await fetch(`${URL}/reviews/schedule/${scheduleId}/uncomplete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async skipSchedule(scheduleId) {
    const response = await fetch(`${URL}/reviews/schedule/${scheduleId}/skip`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async submitScheduleFeedback({ userId, scheduleId, subject, topic, understandingScore, perceivedDifficulty, note }) {
    const response = await fetch(`${URL}/feedback/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, scheduleId, subject, topic, understandingScore, perceivedDifficulty, note }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async deleteReviewFeedback({ userId, contentId, reviewDate }) {
    const response = await fetch(`${URL}/feedback/review`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, contentId, reviewDate }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async deleteScheduleFeedback(scheduleId) {
    const response = await fetch(`${URL}/feedback/schedule/${scheduleId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async submitSkippedReview({ userId, contentId, reviewDate }) {
    const response = await fetch(`${URL}/feedback/skip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, contentId, reviewDate }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  async getSkippedReviews(userId) {
    const response = await fetch(`${URL}/feedback/skip/user/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
  async updateContentReviewDates(contentId, nextReviews) {
    const response = await fetch(`${URL}/contents/${contentId}/review-dates`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextReviews }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  },

  async deleteContentById(contentId) {
    const response = await fetch(`${URL}/contents/${contentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return data;
  },

  async deleteScheduleById(scheduleId) {
    const response = await fetch(`${URL}/reviews/schedule/${scheduleId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return data;
  },
};
